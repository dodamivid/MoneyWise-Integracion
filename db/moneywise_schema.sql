-- ============================================================================
-- MoneyWise - Script de Base de Datos y Stored Procedures
-- Fuente: tickets/BD_ticket.md y API v1
-- Este script crea el esquema normalizado, catálogos seed y procedimientos
-- necesarios para que la capa de integración (Node.js) opere al 100%.
-- ============================================================================

DROP DATABASE IF EXISTS moneywise;
CREATE DATABASE moneywise
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE moneywise;

-- ============================================================================
-- Tablas base
-- ============================================================================

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  apellido_p VARCHAR(80) NOT NULL,
  apellido_m VARCHAR(80) NOT NULL,
  correo VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  password_hash VARCHAR(72) NOT NULL,
  scopes TEXT NOT NULL DEFAULT '[]',
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_correo (correo)
);

CREATE TABLE auth_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token CHAR(36) NOT NULL,
  tipo ENUM('RESET_PASSWORD') NOT NULL,
  expira_en DATETIME NOT NULL,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_auth_tokens_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_auth_token (token),
  KEY idx_auth_usuario_tipo (usuario_id, tipo, expira_en)
);

-- ============================================================================
-- Catálogos con soporte global/usario
-- ============================================================================

CREATE TABLE tipos_ingreso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nombre VARCHAR(60) NOT NULL,
  es_por_defecto TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  UNIQUE KEY uq_tipos_ingreso_usuario_nombre (usuario_id, nombre),
  KEY idx_tipos_ingreso_usuario (usuario_id),
  CONSTRAINT fk_tipos_ingreso_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE TABLE tipos_egreso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nombre VARCHAR(60) NOT NULL,
  es_por_defecto TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  UNIQUE KEY uq_tipos_egreso_usuario_nombre (usuario_id, nombre),
  KEY idx_tipos_egreso_usuario (usuario_id),
  CONSTRAINT fk_tipos_egreso_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE TABLE destinos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nombre VARCHAR(100) NOT NULL,
  es_por_defecto TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  UNIQUE KEY uq_destinos_usuario_nombre (usuario_id, nombre),
  KEY idx_destinos_usuario (usuario_id),
  CONSTRAINT fk_destinos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE TABLE procedencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  nombre VARCHAR(100) NOT NULL,
  es_por_defecto TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  UNIQUE KEY uq_procedencias_usuario_nombre (usuario_id, nombre),
  KEY idx_procedencias_usuario (usuario_id),
  CONSTRAINT fk_procedencias_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

CREATE TABLE frecuencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  UNIQUE KEY uq_frecuencias_nombre (nombre)
);

-- ============================================================================
-- Movimientos financieros
-- ============================================================================

CREATE TABLE ingresos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_id INT NOT NULL,
  procedencia_id INT NULL,
  frecuencia_id INT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  descripcion VARCHAR(255) NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  CONSTRAINT fk_ingresos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_ingresos_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_ingreso(id),
  CONSTRAINT fk_ingresos_procedencia FOREIGN KEY (procedencia_id) REFERENCES procedencias(id),
  CONSTRAINT fk_ingresos_frecuencia FOREIGN KEY (frecuencia_id) REFERENCES frecuencias(id),
  KEY idx_ingresos_usuario_fecha (usuario_id, fecha_inicio),
  KEY idx_ingresos_usuario_tipo (usuario_id, tipo_id),
  KEY idx_ingresos_usuario_procedencia (usuario_id, procedencia_id)
);

CREATE TABLE egresos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_id INT NOT NULL,
  destino_id INT NULL,
  frecuencia_id INT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  descripcion VARCHAR(255) NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  CONSTRAINT fk_egresos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_egresos_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_egreso(id),
  CONSTRAINT fk_egresos_destino FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE SET NULL,
  CONSTRAINT fk_egresos_frecuencia FOREIGN KEY (frecuencia_id) REFERENCES frecuencias(id),
  KEY idx_egresos_usuario_fecha (usuario_id, fecha_inicio),
  KEY idx_egresos_usuario_tipo (usuario_id, tipo_id),
  KEY idx_egresos_usuario_destino (usuario_id, destino_id)
);

CREATE TABLE inversiones (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  destino_id INT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  objetivo VARCHAR(120) NOT NULL,
  tasa_interes DECIMAL(5,2) NOT NULL CHECK (tasa_interes >= 0 AND tasa_interes <= 100),
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  CONSTRAINT fk_inversiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_inversiones_destino FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE SET NULL,
  KEY idx_inversiones_usuario_fecha (usuario_id, fecha_inicio)
);

CREATE TABLE metas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  monto_objetivo DECIMAL(12,2) NOT NULL CHECK (monto_objetivo > 0),
  ahorro_real DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (ahorro_real >= 0),
  activa TINYINT(1) NOT NULL DEFAULT 1,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  CONSTRAINT fk_metas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  KEY idx_metas_usuario_activa_fecha (usuario_id, activa, fecha_inicio)
);

CREATE TABLE fechas_corte_ahorro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_corte DATETIME NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fechas_corte_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  UNIQUE KEY uq_fechas_corte_usuario_fecha (usuario_id, fecha_corte)
);

-- ============================================================================
-- Seeds de catálogos globales
-- ============================================================================

INSERT INTO tipos_ingreso (usuario_id, nombre, es_por_defecto)
VALUES
  (NULL, 'Efectivo', 1),
  (NULL, 'Transferencia', 1),
  (NULL, 'Cheque', 1),
  (NULL, 'Tarjeta', 1),
  (NULL, 'Vales', 1),
  (NULL, 'Bonos', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tipos_egreso (usuario_id, nombre, es_por_defecto)
VALUES
  (NULL, 'Efectivo', 1),
  (NULL, 'Transferencia', 1),
  (NULL, 'Cheque', 1),
  (NULL, 'Tarjeta', 1),
  (NULL, 'Vales', 1),
  (NULL, 'Bonos', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO destinos (usuario_id, nombre, es_por_defecto)
VALUES
  (NULL, 'Renta', 1),
  (NULL, 'Servicios', 1),
  (NULL, 'Transporte', 1),
  (NULL, 'Alimentación', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO procedencias (usuario_id, nombre, es_por_defecto)
VALUES
  (NULL, 'Empresa', 1),
  (NULL, 'Freelance', 1),
  (NULL, 'Negocio propio', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO frecuencias (nombre)
VALUES
  ('Diario'),
  ('Semanal'),
  ('Quincenal'),
  ('Mensual'),
  ('Bimestral'),
  ('Trimestral'),
  ('Semestral'),
  ('Anual')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================================
-- Stored Procedures
-- (Las definiciones comienzan después de establecer DELIMITER)
-- ============================================================================

DELIMITER $$

-- ============================================================================
-- Usuarios y Autenticación
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_usuarios_registrar$$
CREATE PROCEDURE sp_usuarios_registrar(
  IN pNombre VARCHAR(80),
  IN pApellidoP VARCHAR(80),
  IN pApellidoM VARCHAR(80),
  IN pCorreo VARCHAR(120),
  IN pFechaN DATE,
  IN pHash VARCHAR(72)
)
BEGIN
  DECLARE vCorreo VARCHAR(120);
  DECLARE vScopes TEXT DEFAULT '["ingresos:leer","ingresos:escribir","egresos:leer","egresos:escribir","metas:leer","metas:escribir","inversiones:leer","inversiones:escribir","catalogos:leer","dashboard:leer"]';
  DECLARE vUsuarioId INT;

  SET vCorreo = LOWER(TRIM(pCorreo));

  IF EXISTS (SELECT 1 FROM usuarios WHERE correo = vCorreo) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El correo ya está registrado',
          MYSQL_ERRNO = 1644;
  END IF;

  INSERT INTO usuarios (
    nombre,
    apellido_p,
    apellido_m,
    correo,
    fecha_nacimiento,
    password_hash,
    scopes,
    activo
  )
  VALUES (
    pNombre,
    pApellidoP,
    pApellidoM,
    vCorreo,
    pFechaN,
    pHash,
    vScopes,
    1
  );

  SET vUsuarioId = LAST_INSERT_ID();

  SELECT
    u.id AS usuarioId,
    u.nombre,
    u.apellido_p AS apellidoP,
    u.apellido_m AS apellidoM,
    u.correo,
    u.creado_en AS creadoEn,
    u.scopes AS scopesPorDefecto
  FROM usuarios u
  WHERE u.id = vUsuarioId;
END$$

DROP PROCEDURE IF EXISTS sp_auth_acceso$$
CREATE PROCEDURE sp_auth_acceso(
  IN pCorreo VARCHAR(120)
)
BEGIN
  SELECT
    u.id AS usuarioId,
    u.password_hash AS hash,
    u.nombre,
    u.correo,
    u.activo,
    u.scopes AS scopes
  FROM usuarios u
  WHERE u.correo = LOWER(TRIM(pCorreo))
  LIMIT 1;
END$$

DROP PROCEDURE IF EXISTS sp_auth_olvido_iniciar$$
CREATE PROCEDURE sp_auth_olvido_iniciar(
  IN pCorreo VARCHAR(120),
  IN pToken VARCHAR(128),
  IN pExpira DATETIME
)
BEGIN
  DECLARE vUsuarioId INT DEFAULT NULL;

  SELECT id INTO vUsuarioId
  FROM usuarios
  WHERE correo = LOWER(TRIM(pCorreo))
  LIMIT 1;

  IF vUsuarioId IS NOT NULL THEN
    INSERT INTO auth_tokens (usuario_id, token, tipo, expira_en, usado)
    VALUES (vUsuarioId, pToken, 'RESET_PASSWORD', pExpira, 0)
    ON DUPLICATE KEY UPDATE
      expira_en = VALUES(expira_en),
      usado = 0,
      creado_en = NOW();
  END IF;

  SELECT TRUE AS enviado;
END$$

DROP PROCEDURE IF EXISTS sp_auth_restablecer_confirmar$$
CREATE PROCEDURE sp_auth_restablecer_confirmar(
  IN pToken VARCHAR(128),
  IN pHashNuevo VARCHAR(72)
)
BEGIN
  DECLARE vUsuarioId INT;
  DECLARE vExpira DATETIME;
  DECLARE vUsado TINYINT;

  SELECT usuario_id, expira_en, usado
  INTO vUsuarioId, vExpira, vUsado
  FROM auth_tokens
  WHERE token = pToken
    AND tipo = 'RESET_PASSWORD'
  LIMIT 1;

  IF vUsuarioId IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TOKEN_INVALIDO:El token no existe',
          MYSQL_ERRNO = 400;
  END IF;

  IF vUsado = 1 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TOKEN_INVALIDO:El token ya fue usado',
          MYSQL_ERRNO = 400;
  END IF;

  IF vExpira < NOW() THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'TOKEN_EXPIRADO:El token expiró',
          MYSQL_ERRNO = 410;
  END IF;

  UPDATE usuarios
  SET password_hash = pHashNuevo,
      actualizado_en = NOW()
  WHERE id = vUsuarioId;

  UPDATE auth_tokens
  SET usado = 1
  WHERE token = pToken;

  SELECT TRUE AS restablecido;
END$$

DROP PROCEDURE IF EXISTS sp_usuarios_obtenerPorId$$
CREATE PROCEDURE sp_usuarios_obtenerPorId(
  IN pUsuarioId INT
)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = pUsuarioId) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Usuario no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT
    id AS usuarioId,
    nombre,
    apellido_p AS apellidoP,
    apellido_m AS apellidoM,
    correo,
    fecha_nacimiento AS fechaN,
    creado_en AS creadoEn,
    actualizado_en AS actualizadoEn,
    activo
  FROM usuarios
  WHERE id = pUsuarioId;
END$$

DROP PROCEDURE IF EXISTS sp_usuarios_actualizar$$
CREATE PROCEDURE sp_usuarios_actualizar(
  IN pUsuarioId INT,
  IN pNombre VARCHAR(80),
  IN pApellidoP VARCHAR(80),
  IN pApellidoM VARCHAR(80),
  IN pFechaN DATE
)
BEGIN
  DECLARE vActual DATETIME;

  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = pUsuarioId) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Usuario no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SET vActual = NOW();

  UPDATE usuarios
  SET
    nombre = COALESCE(pNombre, nombre),
    apellido_p = COALESCE(pApellidoP, apellido_p),
    apellido_m = COALESCE(pApellidoM, apellido_m),
    fecha_nacimiento = COALESCE(pFechaN, fecha_nacimiento),
    actualizado_en = vActual
  WHERE id = pUsuarioId;

  SELECT
    TRUE AS actualizado,
    vActual AS actualizadoEn;
END$$

DROP PROCEDURE IF EXISTS sp_usuarios_cambiarContrasena$$
CREATE PROCEDURE sp_usuarios_cambiarContrasena(
  IN pUsuarioId INT,
  IN pHashViejo VARCHAR(72),
  IN pHashNuevo VARCHAR(72)
)
BEGIN
  DECLARE vHashActual VARCHAR(72);

  SELECT password_hash INTO vHashActual
  FROM usuarios
  WHERE id = pUsuarioId;

  IF vHashActual IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Usuario no existe',
          MYSQL_ERRNO = 404;
  END IF;

  IF vHashActual <> pHashViejo THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'CONTRASENA_INCORRECTA:La contraseña actual no coincide',
          MYSQL_ERRNO = 401;
  END IF;

  UPDATE usuarios
  SET password_hash = pHashNuevo,
      actualizado_en = NOW()
  WHERE id = pUsuarioId;

  SELECT TRUE AS cambiado;
END$$

-- ============================================================================
-- Catálogos: Tipos de ingreso
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_tiposIngreso_listar$$
CREATE PROCEDURE sp_tiposIngreso_listar(
  IN pUsuarioId INT,
  IN pBuscar VARCHAR(60),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vBuscar VARCHAR(60);
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vBuscar = NULLIF(TRIM(pBuscar), '');
  IF vBuscar IS NOT NULL THEN
    SET vBuscar = CONCAT('%', vBuscar, '%');
  END IF;

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'nombre%' THEN 'nombre'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    WHEN pOrden LIKE 'actualizadoEn%' THEN 'actualizado_en'
    ELSE 'nombre'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:desc' THEN 'DESC'
    ELSE 'ASC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @pUsuarioId := pUsuarioId;
  SET @vBuscar := vBuscar;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_ti := CONCAT(
    'SELECT id AS tipoIngresoId,
            usuario_id AS usuarioId,
            nombre,
            es_por_defecto AS esPorDefecto,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM tipos_ingreso
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL, NULL, NULL, NULL, NULL, NULL, COUNT(*) AS totalRegistros
     FROM tipos_ingreso
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)'
  );

  PREPARE stmt FROM @sql_ti;
  EXECUTE stmt USING
    @pUsuarioId, @vBuscar, @vBuscar, @vTam, @vOffset,
    @pUsuarioId, @vBuscar, @vBuscar;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_tiposIngreso_crear$$
CREATE PROCEDURE sp_tiposIngreso_crear(
  IN pUsuarioId INT,
  IN pNombre VARCHAR(60)
)
BEGIN
  DECLARE vNombre VARCHAR(60);

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM tipos_ingreso
    WHERE eliminado_en IS NULL
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El tipo de ingreso ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  INSERT INTO tipos_ingreso (usuario_id, nombre, es_por_defecto)
  VALUES (pUsuarioId, vNombre, IFNULL(pUsuarioId, 0));

  SELECT
    LAST_INSERT_ID() AS tipoIngresoId,
    vNombre AS nombre;
END$$

DROP PROCEDURE IF EXISTS sp_tiposIngreso_actualizar$$
CREATE PROCEDURE sp_tiposIngreso_actualizar(
  IN pTipoIngresoId INT,
  IN pUsuarioId INT,
  IN pNombre VARCHAR(60)
)
BEGIN
  DECLARE vNombre VARCHAR(60);
  DECLARE vEsPorDefecto TINYINT(1);
  DECLARE vDueño INT;

  SELECT usuario_id, es_por_defecto
  INTO vDueño, vEsPorDefecto
  FROM tipos_ingreso
  WHERE id = pTipoIngresoId AND eliminado_en IS NULL;

  IF vDueño IS NULL AND vEsPorDefecto IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Tipo de ingreso no existe',
          MYSQL_ERRNO = 404;
  END IF;

  IF vDueño IS NULL AND pUsuarioId IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar un tipo global',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño IS NOT NULL AND vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar el catálogo de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM tipos_ingreso
    WHERE eliminado_en IS NULL
      AND id <> pTipoIngresoId
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El tipo de ingreso ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE tipos_ingreso
  SET nombre = vNombre,
      actualizado_en = NOW()
  WHERE id = pTipoIngresoId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_tiposIngreso_eliminar$$
CREATE PROCEDURE sp_tiposIngreso_eliminar(
  IN pTipoIngresoId INT,
  IN pUsuarioId INT
)
BEGIN
  DECLARE vDueño INT;
  DECLARE vEsPorDefecto TINYINT(1);

  SELECT usuario_id, es_por_defecto
  INTO vDueño, vEsPorDefecto
  FROM tipos_ingreso
  WHERE id = pTipoIngresoId AND eliminado_en IS NULL;

  IF vDueño IS NULL AND vEsPorDefecto IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Tipo de ingreso no existe',
          MYSQL_ERRNO = 404;
  END IF;

  IF vDueño IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar un tipo global',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar catálogos de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  IF EXISTS (
    SELECT 1 FROM ingresos
    WHERE tipo_id = pTipoIngresoId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'EN_USO:El tipo está referenciado por ingresos',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE tipos_ingreso
  SET eliminado_en = NOW()
  WHERE id = pTipoIngresoId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Catálogos: Tipos de egreso
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_tiposEgreso_listar$$
CREATE PROCEDURE sp_tiposEgreso_listar(
  IN pUsuarioId INT,
  IN pBuscar VARCHAR(60),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vBuscar VARCHAR(60);
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vBuscar = NULLIF(TRIM(pBuscar), '');
  IF vBuscar IS NOT NULL THEN
    SET vBuscar = CONCAT('%', vBuscar, '%');
  END IF;

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'nombre%' THEN 'nombre'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    WHEN pOrden LIKE 'actualizadoEn%' THEN 'actualizado_en'
    ELSE 'nombre'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:desc' THEN 'DESC'
    ELSE 'ASC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @pUsuarioId := pUsuarioId;
  SET @vBuscar := vBuscar;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_te := CONCAT(
    'SELECT id AS tipoEgresoId,
            usuario_id AS usuarioId,
            nombre,
            es_por_defecto AS esPorDefecto,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM tipos_egreso
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL, NULL, NULL, NULL, NULL, NULL, COUNT(*) AS totalRegistros
     FROM tipos_egreso
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)'
  );

  PREPARE stmt FROM @sql_te;
  EXECUTE stmt USING
    @pUsuarioId, @vBuscar, @vBuscar, @vTam, @vOffset,
    @pUsuarioId, @vBuscar, @vBuscar;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_tiposEgreso_crear$$
CREATE PROCEDURE sp_tiposEgreso_crear(
  IN pUsuarioId INT,
  IN pNombre VARCHAR(60)
)
BEGIN
  DECLARE vNombre VARCHAR(60);

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM tipos_egreso
    WHERE eliminado_en IS NULL
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El tipo de egreso ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  INSERT INTO tipos_egreso (usuario_id, nombre, es_por_defecto)
  VALUES (pUsuarioId, vNombre, IFNULL(pUsuarioId, 0));

  SELECT
    LAST_INSERT_ID() AS tipoEgresoId,
    vNombre AS nombre;
END$$

DROP PROCEDURE IF EXISTS sp_tiposEgreso_actualizar$$
CREATE PROCEDURE sp_tiposEgreso_actualizar(
  IN pTipoEgresoId INT,
  IN pUsuarioId INT,
  IN pNombre VARCHAR(60)
)
BEGIN
  DECLARE vNombre VARCHAR(60);
  DECLARE vDueño INT;
  DECLARE vEsPorDefecto TINYINT(1);

  SELECT usuario_id, es_por_defecto
  INTO vDueño, vEsPorDefecto
  FROM tipos_egreso
  WHERE id = pTipoEgresoId AND eliminado_en IS NULL;

  IF vDueño IS NULL AND vEsPorDefecto IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Tipo de egreso no existe',
          MYSQL_ERRNO = 404;
  END IF;

  IF vDueño IS NULL AND pUsuarioId IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar un tipo global',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño IS NOT NULL AND vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar el catálogo de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM tipos_egreso
    WHERE eliminado_en IS NULL
      AND id <> pTipoEgresoId
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El tipo de egreso ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE tipos_egreso
  SET nombre = vNombre,
      actualizado_en = NOW()
  WHERE id = pTipoEgresoId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_tiposEgreso_eliminar$$
CREATE PROCEDURE sp_tiposEgreso_eliminar(
  IN pTipoEgresoId INT,
  IN pUsuarioId INT
)
BEGIN
  DECLARE vDueño INT;
  DECLARE vEsPorDefecto TINYINT(1);

  SELECT usuario_id, es_por_defecto
  INTO vDueño, vEsPorDefecto
  FROM tipos_egreso
  WHERE id = pTipoEgresoId AND eliminado_en IS NULL;

  IF vDueño IS NULL AND vEsPorDefecto IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Tipo de egreso no existe',
          MYSQL_ERRNO = 404;
  END IF;

  IF vDueño IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar un tipo global',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar catálogos de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  IF EXISTS (
    SELECT 1 FROM egresos
    WHERE tipo_id = pTipoEgresoId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'EN_USO:El tipo está referenciado por egresos',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE tipos_egreso
  SET eliminado_en = NOW()
  WHERE id = pTipoEgresoId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Catálogos: Destinos
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_destinos_listar$$
CREATE PROCEDURE sp_destinos_listar(
  IN pUsuarioId INT,
  IN pBuscar VARCHAR(100),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vBuscar VARCHAR(100);
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vBuscar = NULLIF(TRIM(pBuscar), '');
  IF vBuscar IS NOT NULL THEN
    SET vBuscar = CONCAT('%', vBuscar, '%');
  END IF;

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'nombre%' THEN 'nombre'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    WHEN pOrden LIKE 'actualizadoEn%' THEN 'actualizado_en'
    ELSE 'nombre'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:desc' THEN 'DESC'
    ELSE 'ASC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @pUsuarioId := pUsuarioId;
  SET @vBuscar := vBuscar;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_destinos := CONCAT(
    'SELECT id AS destinoId,
            usuario_id AS usuarioId,
            nombre,
            es_por_defecto AS esPorDefecto,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM destinos
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL, NULL, NULL, NULL, NULL, NULL, COUNT(*) AS totalRegistros
     FROM destinos
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)'
  );

  PREPARE stmt FROM @sql_destinos;
  EXECUTE stmt USING
    @pUsuarioId, @vBuscar, @vBuscar, @vTam, @vOffset,
    @pUsuarioId, @vBuscar, @vBuscar;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_destinos_crear$$
CREATE PROCEDURE sp_destinos_crear(
  IN pUsuarioId INT,
  IN pNombre VARCHAR(100)
)
BEGIN
  DECLARE vNombre VARCHAR(100);

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM destinos
    WHERE eliminado_en IS NULL
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El destino ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  INSERT INTO destinos (usuario_id, nombre, es_por_defecto)
  VALUES (pUsuarioId, vNombre, IFNULL(pUsuarioId, 0));

  SELECT LAST_INSERT_ID() AS destinoId, vNombre AS nombre;
END$$

DROP PROCEDURE IF EXISTS sp_destinos_actualizar$$
CREATE PROCEDURE sp_destinos_actualizar(
  IN pDestinoId INT,
  IN pUsuarioId INT,
  IN pNombre VARCHAR(100)
)
BEGIN
  DECLARE vDueño INT;
  DECLARE vNombre VARCHAR(100);
  DECLARE vEsPorDefecto TINYINT(1);

  IF NOT EXISTS (SELECT 1 FROM destinos WHERE id = pDestinoId AND eliminado_en IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Destino no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT usuario_id, es_por_defecto
  INTO vDueño, vEsPorDefecto
  FROM destinos
  WHERE id = pDestinoId AND eliminado_en IS NULL;

  IF vDueño IS NULL AND pUsuarioId IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar un destino global',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño IS NOT NULL AND vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar catálogos de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM destinos
    WHERE eliminado_en IS NULL
      AND id <> pDestinoId
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:El destino ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE destinos
  SET nombre = vNombre,
      actualizado_en = NOW()
  WHERE id = pDestinoId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_destinos_eliminar$$
CREATE PROCEDURE sp_destinos_eliminar(
  IN pDestinoId INT,
  IN pUsuarioId INT
)
BEGIN
  DECLARE vDueño INT;

  IF NOT EXISTS (SELECT 1 FROM destinos WHERE id = pDestinoId AND eliminado_en IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Destino no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT usuario_id
  INTO vDueño
  FROM destinos
  WHERE id = pDestinoId AND eliminado_en IS NULL;

  IF vDueño IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar un destino global',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar catálogos de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  IF EXISTS (
    SELECT 1 FROM egresos
    WHERE destino_id = pDestinoId AND eliminado_en IS NULL
  ) OR EXISTS (
    SELECT 1 FROM inversiones
    WHERE destino_id = pDestinoId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'EN_USO:El destino está referenciado',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE destinos
  SET eliminado_en = NOW()
  WHERE id = pDestinoId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Catálogos: Procedencias
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_procedencias_listar$$
CREATE PROCEDURE sp_procedencias_listar(
  IN pUsuarioId INT,
  IN pBuscar VARCHAR(100),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vBuscar VARCHAR(100);
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vBuscar = NULLIF(TRIM(pBuscar), '');
  IF vBuscar IS NOT NULL THEN
    SET vBuscar = CONCAT('%', vBuscar, '%');
  END IF;

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'nombre%' THEN 'nombre'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    WHEN pOrden LIKE 'actualizadoEn%' THEN 'actualizado_en'
    ELSE 'nombre'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:desc' THEN 'DESC'
    ELSE 'ASC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @pUsuarioId := pUsuarioId;
  SET @vBuscar := vBuscar;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_proc := CONCAT(
    'SELECT id AS procedenciaId,
            usuario_id AS usuarioId,
            nombre,
            es_por_defecto AS esPorDefecto,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM procedencias
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL, NULL, NULL, NULL, NULL, NULL, COUNT(*) AS totalRegistros
     FROM procedencias
     WHERE eliminado_en IS NULL
       AND (usuario_id = ? OR usuario_id IS NULL)
       AND (? IS NULL OR nombre LIKE ?)'
  );

  PREPARE stmt FROM @sql_proc;
  EXECUTE stmt USING
    @pUsuarioId, @vBuscar, @vBuscar, @vTam, @vOffset,
    @pUsuarioId, @vBuscar, @vBuscar;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_procedencias_crear$$
CREATE PROCEDURE sp_procedencias_crear(
  IN pUsuarioId INT,
  IN pNombre VARCHAR(100)
)
BEGIN
  DECLARE vNombre VARCHAR(100);

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM procedencias
    WHERE eliminado_en IS NULL
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:La procedencia ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  INSERT INTO procedencias (usuario_id, nombre, es_por_defecto)
  VALUES (pUsuarioId, vNombre, IFNULL(pUsuarioId, 0));

  SELECT LAST_INSERT_ID() AS procedenciaId, vNombre AS nombre;
END$$

DROP PROCEDURE IF EXISTS sp_procedencias_actualizar$$
CREATE PROCEDURE sp_procedencias_actualizar(
  IN pProcedenciaId INT,
  IN pUsuarioId INT,
  IN pNombre VARCHAR(100)
)
BEGIN
  DECLARE vDueño INT;
  DECLARE vNombre VARCHAR(100);

  IF NOT EXISTS (SELECT 1 FROM procedencias WHERE id = pProcedenciaId AND eliminado_en IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Procedencia no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT usuario_id
  INTO vDueño
  FROM procedencias
  WHERE id = pProcedenciaId AND eliminado_en IS NULL;

  IF vDueño IS NULL AND pUsuarioId IS NOT NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar procedencias globales',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño IS NOT NULL AND vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes editar catálogos de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM procedencias
    WHERE eliminado_en IS NULL
      AND id <> pProcedenciaId
      AND LOWER(nombre) = LOWER(vNombre)
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:La procedencia ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE procedencias
  SET nombre = vNombre,
      actualizado_en = NOW()
  WHERE id = pProcedenciaId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_procedencias_eliminar$$
CREATE PROCEDURE sp_procedencias_eliminar(
  IN pProcedenciaId INT,
  IN pUsuarioId INT
)
BEGIN
  DECLARE vDueño INT;

  IF NOT EXISTS (SELECT 1 FROM procedencias WHERE id = pProcedenciaId AND eliminado_en IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Procedencia no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT usuario_id
  INTO vDueño
  FROM procedencias
  WHERE id = pProcedenciaId AND eliminado_en IS NULL;

  IF vDueño IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar procedencias globales',
          MYSQL_ERRNO = 403;
  END IF;

  IF vDueño <> pUsuarioId THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'PERMISO_DENEGADO:No puedes eliminar catálogos de otro usuario',
          MYSQL_ERRNO = 403;
  END IF;

  IF EXISTS (
    SELECT 1 FROM ingresos
    WHERE procedencia_id = pProcedenciaId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'EN_USO:La procedencia está referenciada por ingresos',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE procedencias
  SET eliminado_en = NOW()
  WHERE id = pProcedenciaId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Catálogos: Frecuencias (global)
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_frecuencias_listar$$
CREATE PROCEDURE sp_frecuencias_listar(
  IN pBuscar VARCHAR(60),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vBuscar VARCHAR(60);
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vBuscar = NULLIF(TRIM(pBuscar), '');
  IF vBuscar IS NOT NULL THEN
    SET vBuscar = CONCAT('%', vBuscar, '%');
  END IF;

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'nombre%' THEN 'nombre'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    WHEN pOrden LIKE 'actualizadoEn%' THEN 'actualizado_en'
    ELSE 'nombre'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:desc' THEN 'DESC'
    ELSE 'ASC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @vBuscar := vBuscar;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_freq := CONCAT(
    'SELECT id AS frecuenciaId,
            nombre,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM frecuencias
     WHERE (eliminado_en IS NULL)
       AND (? IS NULL OR nombre LIKE ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL, NULL, NULL, NULL, COUNT(*) AS totalRegistros
     FROM frecuencias
     WHERE (eliminado_en IS NULL)
       AND (? IS NULL OR nombre LIKE ?)'
  );

  PREPARE stmt FROM @sql_freq;
  EXECUTE stmt USING
    @vBuscar, @vBuscar, @vTam, @vOffset,
    @vBuscar, @vBuscar;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_frecuencias_crear$$
CREATE PROCEDURE sp_frecuencias_crear(
  IN pNombre VARCHAR(60)
)
BEGIN
  DECLARE vNombre VARCHAR(60);

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1 FROM frecuencias
    WHERE eliminado_en IS NULL
      AND LOWER(nombre) = LOWER(vNombre)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:La frecuencia ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  INSERT INTO frecuencias (nombre)
  VALUES (vNombre);

  SELECT LAST_INSERT_ID() AS frecuenciaId, vNombre AS nombre;
END$$

DROP PROCEDURE IF EXISTS sp_frecuencias_actualizar$$
CREATE PROCEDURE sp_frecuencias_actualizar(
  IN pFrecuenciaId INT,
  IN pNombre VARCHAR(60)
)
BEGIN
  DECLARE vNombre VARCHAR(60);

  IF NOT EXISTS (SELECT 1 FROM frecuencias WHERE id = pFrecuenciaId AND eliminado_en IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Frecuencia no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SET vNombre = TRIM(pNombre);

  IF EXISTS (
    SELECT 1
    FROM frecuencias
    WHERE eliminado_en IS NULL
      AND id <> pFrecuenciaId
      AND LOWER(nombre) = LOWER(vNombre)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:La frecuencia ya existe',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE frecuencias
  SET nombre = vNombre,
      actualizado_en = NOW()
  WHERE id = pFrecuenciaId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_frecuencias_eliminar$$
CREATE PROCEDURE sp_frecuencias_eliminar(
  IN pFrecuenciaId INT
)
BEGIN
  IF NOT EXISTS (SELECT 1 FROM frecuencias WHERE id = pFrecuenciaId AND eliminado_en IS NULL) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Frecuencia no existe',
          MYSQL_ERRNO = 404;
  END IF;

  IF EXISTS (
    SELECT 1 FROM ingresos
    WHERE frecuencia_id = pFrecuenciaId AND eliminado_en IS NULL
  ) OR EXISTS (
    SELECT 1 FROM egresos
    WHERE frecuencia_id = pFrecuenciaId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'EN_USO:La frecuencia está referenciada por movimientos',
          MYSQL_ERRNO = 409;
  END IF;

  UPDATE frecuencias
  SET eliminado_en = NOW()
  WHERE id = pFrecuenciaId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Movimientos: Ingresos
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_ingresos_listar$$
CREATE PROCEDURE sp_ingresos_listar(
  IN pUsuarioId INT,
  IN pDesde DATETIME,
  IN pHasta DATETIME,
  IN pTipoId INT,
  IN pProcedenciaId INT,
  IN pMontoMin DECIMAL(12,2),
  IN pMontoMax DECIMAL(12,2),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'fechaInicio%' THEN 'fecha_inicio'
    WHEN pOrden LIKE 'monto%' THEN 'monto'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    ELSE 'creado_en'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:asc' THEN 'ASC'
    ELSE 'DESC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @vUsuario := pUsuarioId;
  SET @vDesde := pDesde;
  SET @vHasta := pHasta;
  SET @vTipo := pTipoId;
  SET @vProc := pProcedenciaId;
  SET @vMin := pMontoMin;
  SET @vMax := pMontoMax;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_ing_list := CONCAT(
    'SELECT id AS ingresoId,
            usuario_id AS usuarioId,
            tipo_id AS tipoId,
            procedencia_id AS procedenciaId,
            monto,
            descripcion,
            fecha_inicio AS fechaInicio,
            fecha_fin AS fechaFin,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM ingresos
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
       AND (? IS NULL OR tipo_id = ?)
       AND (? IS NULL OR procedencia_id = ?)
       AND (? IS NULL OR monto >= ?)
       AND (? IS NULL OR monto <= ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,COUNT(*) AS totalRegistros
     FROM ingresos
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
       AND (? IS NULL OR tipo_id = ?)
       AND (? IS NULL OR procedencia_id = ?)
       AND (? IS NULL OR monto >= ?)
       AND (? IS NULL OR monto <= ?)'
  );

  PREPARE stmt FROM @sql_ing_list;
  EXECUTE stmt USING
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vTipo, @vTipo,
    @vProc, @vProc,
    @vMin, @vMin,
    @vMax, @vMax,
    @vTam, @vOffset,
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vTipo, @vTipo,
    @vProc, @vProc,
    @vMin, @vMin,
    @vMax, @vMax;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_ingresos_crear$$
CREATE PROCEDURE sp_ingresos_crear(
  IN pUsuarioId INT,
  IN pTipoId INT,
  IN pProcedenciaId INT,
  IN pMonto DECIMAL(12,2),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pDescripcion VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tipos_ingreso
    WHERE id = pTipoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:tipoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  IF pProcedenciaId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM procedencias
    WHERE id = pProcedenciaId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:procedenciaId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  INSERT INTO ingresos (
    usuario_id,
    tipo_id,
    procedencia_id,
    monto,
    descripcion,
    fecha_inicio,
    fecha_fin
  ) VALUES (
    pUsuarioId,
    pTipoId,
    pProcedenciaId,
    pMonto,
    pDescripcion,
    pFechaInicio,
    pFechaFin
  );

  SELECT LAST_INSERT_ID() AS ingresoId;
END$$

DROP PROCEDURE IF EXISTS sp_ingresos_obtener$$
CREATE PROCEDURE sp_ingresos_obtener(
  IN pIngresoId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM ingresos WHERE id = pIngresoId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Ingreso no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT
    id AS ingresoId,
    usuario_id AS usuarioId,
    tipo_id AS tipoId,
    procedencia_id AS procedenciaId,
    monto,
    descripcion,
    fecha_inicio AS fechaInicio,
    fecha_fin AS fechaFin,
    creado_en AS creadoEn,
    actualizado_en AS actualizadoEn
  FROM ingresos
  WHERE id = pIngresoId;
END$$

DROP PROCEDURE IF EXISTS sp_ingresos_actualizar$$
CREATE PROCEDURE sp_ingresos_actualizar(
  IN pIngresoId INT,
  IN pUsuarioId INT,
  IN pTipoId INT,
  IN pProcedenciaId INT,
  IN pMonto DECIMAL(12,2),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pDescripcion VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM ingresos
    WHERE id = pIngresoId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Ingreso no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  IF pTipoId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM tipos_ingreso
    WHERE id = pTipoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:tipoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  IF pProcedenciaId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM procedencias
    WHERE id = pProcedenciaId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:procedenciaId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  UPDATE ingresos
  SET tipo_id = COALESCE(pTipoId, tipo_id),
      procedencia_id = pProcedenciaId,
      monto = COALESCE(pMonto, monto),
      descripcion = COALESCE(pDescripcion, descripcion),
      fecha_inicio = COALESCE(pFechaInicio, fecha_inicio),
      fecha_fin = pFechaFin,
      actualizado_en = NOW()
  WHERE id = pIngresoId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_ingresos_eliminar$$
CREATE PROCEDURE sp_ingresos_eliminar(
  IN pIngresoId INT,
  IN pUsuarioId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM ingresos
    WHERE id = pIngresoId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Ingreso no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  UPDATE ingresos
  SET eliminado_en = NOW()
  WHERE id = pIngresoId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Movimientos: Egresos
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_egresos_listar$$
CREATE PROCEDURE sp_egresos_listar(
  IN pUsuarioId INT,
  IN pDesde DATETIME,
  IN pHasta DATETIME,
  IN pTipoId INT,
  IN pDestinoId INT,
  IN pMontoMin DECIMAL(12,2),
  IN pMontoMax DECIMAL(12,2),
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'fechaInicio%' THEN 'fecha_inicio'
    WHEN pOrden LIKE 'monto%' THEN 'monto'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    ELSE 'creado_en'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:asc' THEN 'ASC'
    ELSE 'DESC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @vUsuario := pUsuarioId;
  SET @vDesde := pDesde;
  SET @vHasta := pHasta;
  SET @vTipo := pTipoId;
  SET @vDestino := pDestinoId;
  SET @vMin := pMontoMin;
  SET @vMax := pMontoMax;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_egr_list := CONCAT(
    'SELECT id AS egresoId,
            usuario_id AS usuarioId,
            tipo_id AS tipoId,
            destino_id AS destinoId,
            monto,
            descripcion,
            fecha_inicio AS fechaInicio,
            fecha_fin AS fechaFin,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM egresos
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
       AND (? IS NULL OR tipo_id = ?)
       AND (? IS NULL OR destino_id = ?)
       AND (? IS NULL OR monto >= ?)
       AND (? IS NULL OR monto <= ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,COUNT(*) AS totalRegistros
     FROM egresos
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
       AND (? IS NULL OR tipo_id = ?)
       AND (? IS NULL OR destino_id = ?)
       AND (? IS NULL OR monto >= ?)
       AND (? IS NULL OR monto <= ?)'
  );

  PREPARE stmt FROM @sql_egr_list;
  EXECUTE stmt USING
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vTipo, @vTipo,
    @vDestino, @vDestino,
    @vMin, @vMin,
    @vMax, @vMax,
    @vTam, @vOffset,
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vTipo, @vTipo,
    @vDestino, @vDestino,
    @vMin, @vMin,
    @vMax, @vMax;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_egresos_crear$$
CREATE PROCEDURE sp_egresos_crear(
  IN pUsuarioId INT,
  IN pTipoId INT,
  IN pDestinoId INT,
  IN pMonto DECIMAL(12,2),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pDescripcion VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tipos_egreso
    WHERE id = pTipoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:tipoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  IF pDestinoId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM destinos
    WHERE id = pDestinoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:destinoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  INSERT INTO egresos (
    usuario_id,
    tipo_id,
    destino_id,
    monto,
    descripcion,
    fecha_inicio,
    fecha_fin
  ) VALUES (
    pUsuarioId,
    pTipoId,
    pDestinoId,
    pMonto,
    pDescripcion,
    pFechaInicio,
    pFechaFin
  );

  SELECT LAST_INSERT_ID() AS egresoId;
END$$

DROP PROCEDURE IF EXISTS sp_egresos_obtener$$
CREATE PROCEDURE sp_egresos_obtener(
  IN pEgresoId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM egresos WHERE id = pEgresoId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Egreso no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT
    id AS egresoId,
    usuario_id AS usuarioId,
    tipo_id AS tipoId,
    destino_id AS destinoId,
    monto,
    descripcion,
    fecha_inicio AS fechaInicio,
    fecha_fin AS fechaFin,
    creado_en AS creadoEn,
    actualizado_en AS actualizadoEn
  FROM egresos
  WHERE id = pEgresoId;
END$$

DROP PROCEDURE IF EXISTS sp_egresos_actualizar$$
CREATE PROCEDURE sp_egresos_actualizar(
  IN pEgresoId INT,
  IN pUsuarioId INT,
  IN pTipoId INT,
  IN pDestinoId INT,
  IN pMonto DECIMAL(12,2),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pDescripcion VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM egresos
    WHERE id = pEgresoId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Egreso no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  IF pTipoId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM tipos_egreso
    WHERE id = pTipoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:tipoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  IF pDestinoId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM destinos
    WHERE id = pDestinoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:destinoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  UPDATE egresos
  SET tipo_id = COALESCE(pTipoId, tipo_id),
      destino_id = pDestinoId,
      monto = COALESCE(pMonto, monto),
      descripcion = COALESCE(pDescripcion, descripcion),
      fecha_inicio = COALESCE(pFechaInicio, fecha_inicio),
      fecha_fin = pFechaFin,
      actualizado_en = NOW()
  WHERE id = pEgresoId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_egresos_eliminar$$
CREATE PROCEDURE sp_egresos_eliminar(
  IN pEgresoId INT,
  IN pUsuarioId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM egresos
    WHERE id = pEgresoId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Egreso no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  UPDATE egresos
  SET eliminado_en = NOW()
  WHERE id = pEgresoId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Movimientos: Inversiones
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_inversiones_listar$$
CREATE PROCEDURE sp_inversiones_listar(
  IN pUsuarioId INT,
  IN pDesde DATETIME,
  IN pHasta DATETIME,
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'fechaInicio%' THEN 'fecha_inicio'
    WHEN pOrden LIKE 'fechaFin%' THEN 'fecha_fin'
    WHEN pOrden LIKE 'monto%' THEN 'monto'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    ELSE 'creado_en'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:asc' THEN 'ASC'
    ELSE 'DESC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @vUsuario := pUsuarioId;
  SET @vDesde := pDesde;
  SET @vHasta := pHasta;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_inv_list := CONCAT(
    'SELECT id AS inversionId,
            usuario_id AS usuarioId,
            destino_id AS destinoId,
            monto,
            objetivo,
            fecha_inicio AS fechaInicio,
            fecha_fin AS fechaFin,
            tasa_interes AS tasaInteresPorc,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            NULL AS totalRegistros
     FROM inversiones
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,COUNT(*) AS totalRegistros
     FROM inversiones
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)'
  );

  PREPARE stmt FROM @sql_inv_list;
  EXECUTE stmt USING
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vTam, @vOffset,
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_inversiones_crear$$
CREATE PROCEDURE sp_inversiones_crear(
  IN pUsuarioId INT,
  IN pDestinoId INT,
  IN pMonto DECIMAL(12,2),
  IN pObjetivo VARCHAR(120),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pTasaInteres DECIMAL(5,2)
)
BEGIN
  IF pDestinoId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM destinos
    WHERE id = pDestinoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:destinoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  IF pTasaInteres < 0 OR pTasaInteres > 100 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DATOS_INVALIDOS:La tasa debe estar entre 0 y 100',
          MYSQL_ERRNO = 422;
  END IF;

  INSERT INTO inversiones (
    usuario_id,
    destino_id,
    monto,
    objetivo,
    tasa_interes,
    fecha_inicio,
    fecha_fin
  ) VALUES (
    pUsuarioId,
    pDestinoId,
    pMonto,
    pObjetivo,
    pTasaInteres,
    pFechaInicio,
    pFechaFin
  );

  SELECT LAST_INSERT_ID() AS inversionId;
END$$

DROP PROCEDURE IF EXISTS sp_inversiones_obtener$$
CREATE PROCEDURE sp_inversiones_obtener(
  IN pInversionId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM inversiones WHERE id = pInversionId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Inversión no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT
    id AS inversionId,
    usuario_id AS usuarioId,
    destino_id AS destinoId,
    monto,
    objetivo,
    fecha_inicio AS fechaInicio,
    fecha_fin AS fechaFin,
    tasa_interes AS tasaInteresPorc,
    creado_en AS creadoEn,
    actualizado_en AS actualizadoEn
  FROM inversiones
  WHERE id = pInversionId;
END$$

DROP PROCEDURE IF EXISTS sp_inversiones_actualizar$$
CREATE PROCEDURE sp_inversiones_actualizar(
  IN pInversionId INT,
  IN pUsuarioId INT,
  IN pDestinoId INT,
  IN pMonto DECIMAL(12,2),
  IN pObjetivo VARCHAR(120),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pTasaInteres DECIMAL(5,2)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM inversiones
    WHERE id = pInversionId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Inversión no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  IF pDestinoId IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM destinos
    WHERE id = pDestinoId
      AND eliminado_en IS NULL
      AND (usuario_id = pUsuarioId OR usuario_id IS NULL)
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'FK_INEXISTENTE:destinoId no existe',
          MYSQL_ERRNO = 422;
  END IF;

  IF pTasaInteres IS NOT NULL AND (pTasaInteres < 0 OR pTasaInteres > 100) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DATOS_INVALIDOS:La tasa debe estar entre 0 y 100',
          MYSQL_ERRNO = 422;
  END IF;

  UPDATE inversiones
  SET destino_id = pDestinoId,
      monto = COALESCE(pMonto, monto),
      objetivo = COALESCE(pObjetivo, objetivo),
      fecha_inicio = COALESCE(pFechaInicio, fecha_inicio),
      fecha_fin = pFechaFin,
      tasa_interes = COALESCE(pTasaInteres, tasa_interes),
      actualizado_en = NOW()
  WHERE id = pInversionId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_inversiones_eliminar$$
CREATE PROCEDURE sp_inversiones_eliminar(
  IN pInversionId INT,
  IN pUsuarioId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM inversiones
    WHERE id = pInversionId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Inversión no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  UPDATE inversiones
  SET eliminado_en = NOW()
  WHERE id = pInversionId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Metas de ahorro
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_metas_listar$$
CREATE PROCEDURE sp_metas_listar(
  IN pUsuarioId INT,
  IN pDesde DATETIME,
  IN pHasta DATETIME,
  IN pActiva BOOLEAN,
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'fechaInicio%' THEN 'fecha_inicio'
    WHEN pOrden LIKE 'fechaFin%' THEN 'fecha_fin'
    WHEN pOrden LIKE 'montoObjetivo%' THEN 'monto_objetivo'
    WHEN pOrden LIKE 'porcentajeAvance%' THEN 'ahorro_real / NULLIF(monto_objetivo,0)'
    ELSE 'creado_en'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:asc' THEN 'ASC'
    ELSE 'DESC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @vUsuario := pUsuarioId;
  SET @vDesde := pDesde;
  SET @vHasta := pHasta;
  SET @vActiva := pActiva;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_metas := CONCAT(
    'SELECT id AS metaId,
            usuario_id AS usuarioId,
            nombre,
            monto_objetivo AS montoObjetivo,
            ahorro_real AS ahorroReal,
            activa,
            fecha_inicio AS fechaInicio,
            fecha_fin AS fechaFin,
            creado_en AS creadoEn,
            actualizado_en AS actualizadoEn,
            ROUND(CASE WHEN monto_objetivo = 0 THEN 0 ELSE (ahorro_real / monto_objetivo) * 100 END, 2) AS porcentajeAvance,
            NULL AS totalRegistros
     FROM metas
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
       AND (? IS NULL OR activa = ?)
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,COUNT(*) AS totalRegistros
     FROM metas
     WHERE eliminado_en IS NULL
       AND usuario_id = ?
       AND (? IS NULL OR fecha_inicio >= ?)
       AND (? IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= ?)
       AND (? IS NULL OR activa = ?)'
  );

  PREPARE stmt FROM @sql_metas;
  EXECUTE stmt USING
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vActiva, @vActiva,
    @vTam, @vOffset,
    @vUsuario,
    @vDesde, @vDesde,
    @vHasta, @vHasta,
    @vActiva, @vActiva;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_metas_crear$$
CREATE PROCEDURE sp_metas_crear(
  IN pUsuarioId INT,
  IN pNombre VARCHAR(120),
  IN pMontoObjetivo DECIMAL(12,2),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pActiva BOOLEAN
)
BEGIN
  INSERT INTO metas (
    usuario_id,
    nombre,
    monto_objetivo,
    ahorro_real,
    activa,
    fecha_inicio,
    fecha_fin
  ) VALUES (
    pUsuarioId,
    pNombre,
    pMontoObjetivo,
    0,
    COALESCE(pActiva, 1),
    pFechaInicio,
    pFechaFin
  );

  SELECT LAST_INSERT_ID() AS metaId;
END$$

DROP PROCEDURE IF EXISTS sp_metas_obtener$$
CREATE PROCEDURE sp_metas_obtener(
  IN pMetaId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM metas WHERE id = pMetaId AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Meta no existe',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT
    id AS metaId,
    usuario_id AS usuarioId,
    nombre,
    monto_objetivo AS montoObjetivo,
    ahorro_real AS ahorroReal,
    activa,
    fecha_inicio AS fechaInicio,
    fecha_fin AS fechaFin,
    creado_en AS creadoEn,
    actualizado_en AS actualizadoEn,
    ROUND(CASE WHEN monto_objetivo = 0 THEN 0 ELSE (ahorro_real / monto_objetivo) * 100 END, 2) AS porcentajeAvance
  FROM metas
  WHERE id = pMetaId;
END$$

DROP PROCEDURE IF EXISTS sp_metas_actualizar$$
CREATE PROCEDURE sp_metas_actualizar(
  IN pMetaId INT,
  IN pUsuarioId INT,
  IN pNombre VARCHAR(120),
  IN pMontoObjetivo DECIMAL(12,2),
  IN pAhorroReal DECIMAL(12,2),
  IN pFechaInicio DATETIME,
  IN pFechaFin DATETIME,
  IN pActiva BOOLEAN
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM metas
    WHERE id = pMetaId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Meta no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  UPDATE metas
  SET nombre = COALESCE(pNombre, nombre),
      monto_objetivo = COALESCE(pMontoObjetivo, monto_objetivo),
      ahorro_real = COALESCE(pAhorroReal, ahorro_real),
      fecha_inicio = COALESCE(pFechaInicio, fecha_inicio),
      fecha_fin = pFechaFin,
      activa = COALESCE(pActiva, activa),
      actualizado_en = NOW()
  WHERE id = pMetaId;

  SELECT TRUE AS actualizado;
END$$

DROP PROCEDURE IF EXISTS sp_metas_eliminar$$
CREATE PROCEDURE sp_metas_eliminar(
  IN pMetaId INT,
  IN pUsuarioId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM metas
    WHERE id = pMetaId
      AND usuario_id = pUsuarioId
      AND eliminado_en IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Meta no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  UPDATE metas
  SET eliminado_en = NOW()
  WHERE id = pMetaId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Fechas de corte de ahorro
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_fechasCorte_listar$$
CREATE PROCEDURE sp_fechasCorte_listar(
  IN pUsuarioId INT,
  IN pPagina INT,
  IN pTam INT,
  IN pOrden VARCHAR(30)
)
BEGIN
  DECLARE vOrdenCol VARCHAR(30);
  DECLARE vOrdenDir VARCHAR(5);
  DECLARE vOffset INT;
  DECLARE vTamFinal INT DEFAULT LEAST(GREATEST(pTam, 1), 100);

  SET vOrdenCol = CASE
    WHEN pOrden LIKE 'fechaCorte%' THEN 'fecha_corte'
    WHEN pOrden LIKE 'creadoEn%' THEN 'creado_en'
    ELSE 'fecha_corte'
  END;
  SET vOrdenDir = CASE
    WHEN pOrden LIKE '%:asc' THEN 'ASC'
    ELSE 'DESC'
  END;

  SET vOffset = GREATEST(pPagina, 1) - 1;
  SET vOffset = vOffset * vTamFinal;

  SET @vUsuario := pUsuarioId;
  SET @vTam := vTamFinal;
  SET @vOffset := vOffset;

  SET @sql_fc := CONCAT(
    'SELECT id AS fechaCorteId,
            usuario_id AS usuarioId,
            fecha_corte AS fechaCorte,
            creado_en AS creadoEn,
            NULL AS totalRegistros
     FROM fechas_corte_ahorro
     WHERE usuario_id = ?
     ORDER BY ', vOrdenCol, ' ', vOrdenDir,
    ' LIMIT ? OFFSET ?
     UNION ALL
     SELECT NULL,NULL,NULL,NULL,COUNT(*) AS totalRegistros
     FROM fechas_corte_ahorro
     WHERE usuario_id = ?'
  );

  PREPARE stmt FROM @sql_fc;
  EXECUTE stmt USING
    @vUsuario, @vTam, @vOffset,
    @vUsuario;
  DEALLOCATE PREPARE stmt;
END$$

DROP PROCEDURE IF EXISTS sp_fechasCorte_crear$$
CREATE PROCEDURE sp_fechasCorte_crear(
  IN pUsuarioId INT,
  IN pFechaCorte DATETIME
)
BEGIN
  IF EXISTS (
    SELECT 1 FROM fechas_corte_ahorro
    WHERE usuario_id = pUsuarioId
      AND fecha_corte = pFechaCorte
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'DUPLICADO:La fecha de corte ya existe para el usuario',
          MYSQL_ERRNO = 409;
  END IF;

  INSERT INTO fechas_corte_ahorro (usuario_id, fecha_corte)
  VALUES (pUsuarioId, pFechaCorte);

  SELECT LAST_INSERT_ID() AS fechaCorteId;
END$$

DROP PROCEDURE IF EXISTS sp_fechasCorte_eliminar$$
CREATE PROCEDURE sp_fechasCorte_eliminar(
  IN pFechaCorteId INT,
  IN pUsuarioId INT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM fechas_corte_ahorro
    WHERE id = pFechaCorteId
      AND usuario_id = pUsuarioId
  ) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:Fecha de corte no existe o no pertenece al usuario',
          MYSQL_ERRNO = 404;
  END IF;

  DELETE FROM fechas_corte_ahorro
  WHERE id = pFechaCorteId;

  SELECT TRUE AS eliminado;
END$$

-- ============================================================================
-- Dashboard / Reportes
-- ============================================================================

DROP PROCEDURE IF EXISTS sp_dashboard_resumen$$
CREATE PROCEDURE sp_dashboard_resumen(
  IN pUsuarioId INT,
  IN pDesde DATETIME,
  IN pHasta DATETIME
)
BEGIN
  DECLARE vIngresos DECIMAL(18,2);
  DECLARE vEgresos DECIMAL(18,2);

  SELECT IFNULL(SUM(monto), 0) INTO vIngresos
  FROM ingresos
  WHERE eliminado_en IS NULL
    AND usuario_id = pUsuarioId
    AND (pDesde IS NULL OR fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= pHasta);

  SELECT IFNULL(SUM(monto), 0) INTO vEgresos
  FROM egresos
  WHERE eliminado_en IS NULL
    AND usuario_id = pUsuarioId
    AND (pDesde IS NULL OR fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= pHasta);

  SELECT
    vIngresos AS ingresosTotal,
    vEgresos AS egresosTotal,
    (vIngresos - vEgresos) AS balance;

  SELECT
    COALESCE(t.id, 0) AS tipoId,
    COALESCE(t.nombre, 'Sin tipo') AS tipo,
    IFNULL(SUM(i.monto), 0) AS total
  FROM ingresos i
  LEFT JOIN tipos_ingreso t ON t.id = i.tipo_id
  WHERE i.eliminado_en IS NULL
    AND i.usuario_id = pUsuarioId
    AND (pDesde IS NULL OR i.fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(i.fecha_fin, i.fecha_inicio) <= pHasta)
  GROUP BY tipoId, tipo
  ORDER BY total DESC;

  SELECT
    COALESCE(t.id, 0) AS tipoId,
    COALESCE(t.nombre, 'Sin tipo') AS tipo,
    IFNULL(SUM(e.monto), 0) AS total
  FROM egresos e
  LEFT JOIN tipos_egreso t ON t.id = e.tipo_id
  WHERE e.eliminado_en IS NULL
    AND e.usuario_id = pUsuarioId
    AND (pDesde IS NULL OR e.fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(e.fecha_fin, e.fecha_inicio) <= pHasta)
  GROUP BY tipoId, tipo
  ORDER BY total DESC;

  SELECT
    COALESCE(p.id, 0) AS procedenciaId,
    COALESCE(p.nombre, 'Sin procedencia') AS procedencia,
    IFNULL(SUM(i.monto), 0) AS total
  FROM ingresos i
  LEFT JOIN procedencias p ON p.id = i.procedencia_id
  WHERE i.eliminado_en IS NULL
    AND i.usuario_id = pUsuarioId
    AND (pDesde IS NULL OR i.fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(i.fecha_fin, i.fecha_inicio) <= pHasta)
  GROUP BY procedenciaId, procedencia
  ORDER BY total DESC;

  SELECT
    COALESCE(d.id, 0) AS destinoId,
    COALESCE(d.nombre, 'Sin destino') AS destino,
    IFNULL(SUM(e.monto), 0) AS total
  FROM egresos e
  LEFT JOIN destinos d ON d.id = e.destino_id
  WHERE e.eliminado_en IS NULL
    AND e.usuario_id = pUsuarioId
    AND (pDesde IS NULL OR e.fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(e.fecha_fin, e.fecha_inicio) <= pHasta)
  GROUP BY destinoId, destino
  ORDER BY total DESC;
END$$

DROP PROCEDURE IF EXISTS sp_dashboard_balance$$
CREATE PROCEDURE sp_dashboard_balance(
  IN pUsuarioId INT,
  IN pFechaCorte DATETIME
)
BEGIN
  DECLARE vFechaCorte DATETIME;
  DECLARE vIngresos DECIMAL(18,2);
  DECLARE vEgresos DECIMAL(18,2);

  SET vFechaCorte = pFechaCorte;

  IF vFechaCorte IS NULL THEN
    SELECT MAX(fecha_corte) INTO vFechaCorte
    FROM fechas_corte_ahorro
    WHERE usuario_id = pUsuarioId;
  END IF;

  IF vFechaCorte IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'NO_ENCONTRADO:No hay fechas de corte registradas',
          MYSQL_ERRNO = 404;
  END IF;

  SELECT IFNULL(SUM(monto), 0) INTO vIngresos
  FROM ingresos
  WHERE eliminado_en IS NULL
    AND usuario_id = pUsuarioId
    AND COALESCE(fecha_fin, fecha_inicio) <= vFechaCorte;

  SELECT IFNULL(SUM(monto), 0) INTO vEgresos
  FROM egresos
  WHERE eliminado_en IS NULL
    AND usuario_id = pUsuarioId
    AND COALESCE(fecha_fin, fecha_inicio) <= vFechaCorte;

  SELECT
    vFechaCorte AS fechaCorte,
    vIngresos AS ingresosAcumulados,
    vEgresos AS egresosAcumulados,
    (vIngresos - vEgresos) AS balanceAcumulado;
END$$

DROP PROCEDURE IF EXISTS sp_dashboard_metas$$
CREATE PROCEDURE sp_dashboard_metas(
  IN pUsuarioId INT,
  IN pDesde DATETIME,
  IN pHasta DATETIME
)
BEGIN
  SELECT
    id AS metaId,
    nombre,
    monto_objetivo AS montoObjetivo,
    ahorro_real AS ahorroReal,
    ROUND(CASE WHEN monto_objetivo = 0 THEN 0 ELSE (ahorro_real / monto_objetivo) * 100 END, 2) AS porcentajeAvance
  FROM metas
  WHERE eliminado_en IS NULL
    AND usuario_id = pUsuarioId
    AND (pDesde IS NULL OR fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= pHasta);

  SELECT
    SUM(CASE WHEN activa = 1 THEN 1 ELSE 0 END) AS totalMetasActivas,
    IFNULL(SUM(ahorro_real), 0) AS ahorroTotalPeriodo,
    IFNULL(SUM(monto_objetivo - ahorro_real), 0) AS diferenciaObjetivo
  FROM metas
  WHERE eliminado_en IS NULL
    AND usuario_id = pUsuarioId
    AND (pDesde IS NULL OR fecha_inicio >= pDesde)
    AND (pHasta IS NULL OR COALESCE(fecha_fin, fecha_inicio) <= pHasta);
END$$

DELIMITER ;


