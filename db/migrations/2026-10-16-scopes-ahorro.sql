-- ============================================================================
-- Migración: scopes de ahorro para usuarios registrados
-- ============================================================================
-- Problema: sp_usuarios_registrar asignaba a los usuarios nuevos los scopes de
-- ingresos, egresos, metas, inversiones, catálogos y dashboard, pero NO los de
-- ahorro. Las rutas /api/v1/ahorro/fechas-corte exigen ahorro:leer y
-- ahorro:escribir, así que ningún usuario registrado podía crear su fecha de
-- corte (403) y GET /api/v1/dashboard/balance respondía 404 para siempre.
--
-- Qué hace este script (es idempotente: se puede correr más de una vez):
--   1. Vuelve a crear sp_usuarios_registrar con los scopes de ahorro.
--   2. Agrega ahorro:leer y ahorro:escribir a los usuarios que ya existen,
--      sin duplicarlos y sin tocar los demás scopes de cada quien.
--
-- No borra datos. A diferencia de scripts/import-db.js (que hace DROP DATABASE),
-- esto se puede correr sobre la base de Railway con datos.
--
-- Cómo correrlo (con las credenciales de Railway → Variables del servicio MySQL):
--   mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < db/migrations/2026-10-16-scopes-ahorro.sql
-- ============================================================================

DELIMITER $$

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
  DECLARE vScopes TEXT DEFAULT '["ingresos:leer","ingresos:escribir","egresos:leer","egresos:escribir","metas:leer","metas:escribir","inversiones:leer","inversiones:escribir","catalogos:leer","dashboard:leer","ahorro:leer","ahorro:escribir"]';
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

DELIMITER ;

-- Usuarios existentes: agrega cada scope solo si todavía no lo tienen.
UPDATE usuarios
SET scopes = JSON_ARRAY_APPEND(scopes, '$', 'ahorro:leer')
WHERE JSON_TYPE(scopes) = 'ARRAY'
  AND NOT JSON_CONTAINS(scopes, JSON_QUOTE('ahorro:leer'));

UPDATE usuarios
SET scopes = JSON_ARRAY_APPEND(scopes, '$', 'ahorro:escribir')
WHERE JSON_TYPE(scopes) = 'ARRAY'
  AND NOT JSON_CONTAINS(scopes, JSON_QUOTE('ahorro:escribir'));

-- Verificación: debe devolver 0 filas.
SELECT id, correo
FROM usuarios
WHERE JSON_TYPE(scopes) = 'ARRAY'
  AND (
    NOT JSON_CONTAINS(scopes, JSON_QUOTE('ahorro:leer'))
    OR NOT JSON_CONTAINS(scopes, JSON_QUOTE('ahorro:escribir'))
  );
