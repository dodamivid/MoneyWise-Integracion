-- ============================================================================
-- Stored Procedures para Módulo de Usuarios
-- Base de datos: MoneyWise
-- Versión: 1.0.0
-- Fecha: 2025-11-15
-- ============================================================================
-- Especificación: tickets/API_usuarios.md
-- ============================================================================

USE moneywise;

DELIMITER $$

-- ============================================================================
-- SP: sp_usuarios_obtenerPorId
-- Descripción: Obtiene el perfil completo de un usuario por su ID
-- Parámetros:
--   IN pUsuarioId INT - ID del usuario a consultar
-- Retorna:
--   - Perfil completo del usuario (sin contraseña)
--   - Lanza SIGNAL 'NO_ENCONTRADO' si el usuario no existe
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_usuarios_obtenerPorId$$

CREATE PROCEDURE sp_usuarios_obtenerPorId(
    IN pUsuarioId INT
)
BEGIN
    DECLARE vCount INT DEFAULT 0;

    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO vCount
    FROM usuarios
    WHERE usuarioId = pUsuarioId;

    IF vCount = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'NO_ENCONTRADO',
            MYSQL_ERRNO = 404;
    END IF;

    -- Retornar perfil del usuario (sin contraseña)
    SELECT
        usuarioId,
        nombre,
        apellidoP,
        apellidoM,
        correo,
        fechaN,
        creadoEn,
        actualizadoEn,
        activo
    FROM usuarios
    WHERE usuarioId = pUsuarioId;
END$$

-- ============================================================================
-- SP: sp_usuarios_actualizar
-- Descripción: Actualiza los campos de perfil de un usuario
-- Parámetros:
--   IN pUsuarioId INT - ID del usuario a actualizar
--   IN pNombre VARCHAR(80) - Nuevo nombre (NULL = no actualizar)
--   IN pApellidoP VARCHAR(80) - Nuevo apellido paterno (NULL = no actualizar)
--   IN pApellidoM VARCHAR(80) - Nuevo apellido materno (NULL = no actualizar)
--   IN pFechaN DATE - Nueva fecha de nacimiento (NULL = no actualizar)
-- Retorna:
--   - actualizado: BOOLEAN (siempre true si no hay error)
--   - actualizadoEn: DATETIME del momento de actualización
--   - Lanza SIGNAL 'NO_ENCONTRADO' si el usuario no existe
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_usuarios_actualizar$$

CREATE PROCEDURE sp_usuarios_actualizar(
    IN pUsuarioId INT,
    IN pNombre VARCHAR(80),
    IN pApellidoP VARCHAR(80),
    IN pApellidoM VARCHAR(80),
    IN pFechaN DATE
)
BEGIN
    DECLARE vCount INT DEFAULT 0;
    DECLARE vActualizadoEn DATETIME;

    -- Verificar si el usuario existe
    SELECT COUNT(*) INTO vCount
    FROM usuarios
    WHERE usuarioId = pUsuarioId;

    IF vCount = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'NO_ENCONTRADO',
            MYSQL_ERRNO = 404;
    END IF;

    -- Establecer timestamp de actualización
    SET vActualizadoEn = NOW();

    -- Actualizar solo los campos que no sean NULL
    UPDATE usuarios
    SET
        nombre = COALESCE(pNombre, nombre),
        apellidoP = COALESCE(pApellidoP, apellidoP),
        apellidoM = COALESCE(pApellidoM, apellidoM),
        fechaN = COALESCE(pFechaN, fechaN),
        actualizadoEn = vActualizadoEn
    WHERE usuarioId = pUsuarioId;

    -- Retornar confirmación
    SELECT
        TRUE AS actualizado,
        vActualizadoEn AS actualizadoEn;
END$$

-- ============================================================================
-- SP: sp_usuarios_cambiarContrasena
-- Descripción: Cambia la contraseña de un usuario validando la actual
-- Parámetros:
--   IN pUsuarioId INT - ID del usuario
--   IN pHashViejo VARCHAR(72) - Hash bcrypt de la contraseña actual
--   IN pHashNuevo VARCHAR(72) - Hash bcrypt de la nueva contraseña
-- Retorna:
--   - cambiado: BOOLEAN (true si el cambio fue exitoso)
--   - Lanza SIGNAL 'NO_ENCONTRADO' si el usuario no existe
--   - Lanza SIGNAL 'CONTRASENA_INCORRECTA' si la contraseña actual no coincide
-- Notas:
--   - La validación de contraseña con bcrypt se hace en el servicio (Node.js)
--   - Este SP solo verifica que el hash coincida exactamente
--   - En producción, se usaría una UDF MySQL para bcrypt.compare()
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_usuarios_cambiarContrasena$$

CREATE PROCEDURE sp_usuarios_cambiarContrasena(
    IN pUsuarioId INT,
    IN pHashViejo VARCHAR(72),
    IN pHashNuevo VARCHAR(72)
)
BEGIN
    DECLARE vCount INT DEFAULT 0;
    DECLARE vHashActual VARCHAR(72);

    -- Verificar si el usuario existe y obtener hash actual
    SELECT COUNT(*), COALESCE(MAX(contrasena), '') INTO vCount, vHashActual
    FROM usuarios
    WHERE usuarioId = pUsuarioId;

    IF vCount = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'NO_ENCONTRADO',
            MYSQL_ERRNO = 404;
    END IF;

    -- Verificar que el hash actual coincida
    -- NOTA: En producción, esto se haría con bcrypt.compare() en Node.js
    -- antes de llamar al SP, o usando una UDF MySQL con bcrypt
    IF vHashActual != pHashViejo THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'CONTRASENA_INCORRECTA',
            MYSQL_ERRNO = 401;
    END IF;

    -- Actualizar contraseña
    UPDATE usuarios
    SET
        contrasena = pHashNuevo,
        actualizadoEn = NOW()
    WHERE usuarioId = pUsuarioId;

    -- Retornar confirmación
    SELECT TRUE AS cambiado;
END$$

DELIMITER ;

-- ============================================================================
-- Permisos (ajustar según el usuario de la aplicación)
-- ============================================================================
-- GRANT EXECUTE ON PROCEDURE moneywise.sp_usuarios_obtenerPorId TO 'app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE moneywise.sp_usuarios_actualizar TO 'app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE moneywise.sp_usuarios_cambiarContrasena TO 'app_user'@'localhost';

-- ============================================================================
-- Pruebas de los Stored Procedures
-- ============================================================================
--
-- -- Test 1: Obtener usuario existente
-- CALL sp_usuarios_obtenerPorId(1);
--
-- -- Test 2: Obtener usuario no existente (debe lanzar error)
-- CALL sp_usuarios_obtenerPorId(9999);
--
-- -- Test 3: Actualizar perfil parcial
-- CALL sp_usuarios_actualizar(1, 'Juan Carlos', NULL, NULL, NULL);
--
-- -- Test 4: Actualizar perfil completo
-- CALL sp_usuarios_actualizar(1, 'Juan', 'Pérez', 'López', '1995-05-20');
--
-- -- Test 5: Cambiar contraseña (requiere hash real de bcrypt)
-- -- SET @hashViejo = '$2b$10$...';  -- Hash actual del usuario
-- -- SET @hashNuevo = '$2b$10$...';  -- Hash nuevo generado con bcrypt
-- -- CALL sp_usuarios_cambiarContrasena(1, @hashViejo, @hashNuevo);
--
-- ============================================================================
