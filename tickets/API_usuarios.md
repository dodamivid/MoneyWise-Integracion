# [API] Usuarios — Perfil y contraseña
**Fecha:** 2025-10-31

## Objetivo
Permitir a los usuarios consultar y actualizar su perfil, así como cambiar la contraseña desde la aplicación autentificada.

## Supuestos y seguridad
- JWT obligatorio; `sub` indica el usuario autenticado. Sólo `admin:usuarios` puede operar sobre otros IDs.
- DTOs reutilizan reglas del registro (`nombre`/`apellidos` longitud 2–80, `fechaN` válida, etc.).
- Cambios de contraseña usan `bcrypt` con mismo `cost` que registro.

## Arquitectura
```
src/routes/users.routes.ts
src/controllers/users.controller.ts
src/services/users.service.ts
src/repositories/users.repository.ts
src/dtos/users.dto.ts
```

## SPs requeridos
- `sp_usuarios_obtenerPorId(pUsuarioId INT)`
  - Devuelve `{ usuarioId, nombre, apellidoP, apellidoM, correo, fechaN, creadoEn, actualizadoEn, activo }`.
- `sp_usuarios_actualizar(pUsuarioId INT, pNombre VARCHAR(80), pApellidoP VARCHAR(80), pApellidoM VARCHAR(80), pFechaN DATE)`
  - Devuelve `{ actualizado BOOLEAN, actualizadoEn DATETIME }`.
- `sp_usuarios_cambiarContrasena(pUsuarioId INT, pHashViejo VARCHAR(72), pHashNuevo VARCHAR(72))`
  - Debe validar hash actual y devolver `{ cambiado BOOLEAN }`, usando `SIGNAL 'CONTRASENA_INCORRECTA'`.

## Contrato por endpoint
### GET /api/v1/usuarios/:id
- Auth: JWT.
- Scopes: `usuarios:leer`.
- Reglas: si `:id` no coincide con `sub` y el usuario no tiene `admin:usuarios`, responder `PERMISO_DENEGADO(403)`.
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "usuarioId": 1,
    "nombre": "Juan",
    "apellidoP": "Pérez",
    "apellidoM": "López",
    "correo": "juan@example.com",
    "fechaN": "1995-05-20",
    "creadoEn": "2025-01-01T00:00:00Z",
    "actualizadoEn": "2025-04-01T12:00:00Z",
    "activo": true
  }
}
```
- Errores: `NO_ENCONTRADO(404)` desde SP, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_usuarios_obtenerPorId(pUsuarioId)`.

### PUT /api/v1/usuarios/:id
- Auth: JWT.
- Scopes: `usuarios:escribir`.
- Body:
```json
{
  "nombre": "Juan",
  "apellidoP": "Pérez",
  "apellidoM": "López",
  "fechaN": "1995-05-20"
}
```
- Validaciones: todos opcionales pero debe venir al menos uno; normalizar texto (trim, capitalizar). `fechaN` no puede ser futura ni dejar al usuario <16 años.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true, "actualizadoEn": "2025-04-01T12:30:00Z" } }`.
- Errores: `DATOS_INVALIDOS(422)`, `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_usuarios_actualizar(pUsuarioId, ...)`.

### PATCH /api/v1/usuarios/:id/contrasena
- Auth: JWT.
- Scopes: `usuarios:escribir`.
- Body:
```json
{
  "contrasenaActual": "Pa$$w0rd!",
  "contrasenaNueva": "Nuev0P@ss!"
}
```
- Validaciones: ambas obligatorias; `contrasenaNueva` ≠ `contrasenaActual`, cumple política (mín 8 caracteres, mayúsculas, minúsculas, dígito, símbolo).
- Flujo: servicio obtiene hash actual vía SP, valida con `bcrypt.compare`, genera hash nuevo y llama SP.
- Respuesta 200: `{ "ok": true, "data": { "cambiado": true } }`.
- Errores: `CONTRASENA_INVALIDA(401)` si la actual no coincide, `DATOS_INVALIDOS(422)`, `PERMISO_DENEGADO(403)`, `NO_ENCONTRADO(404)`.
- SP: `CALL sp_usuarios_cambiarContrasena(pUsuarioId, pHashViejo, pHashNuevo)`.

## Criterios de aceptación
- DTOs cubren validaciones y mensajes claros.
- SPs devuelven alias en español, usan `SIGNAL` para errores.
- Swagger/Postman incluye pruebas de lectura, actualización parcial, contraseña incorrecta y permisos cruzados.

## Riesgos
- Mantener sincronía entre validación de contraseña en DTO y en SP.
- Si se habilita multi-factor, actualizar flujo para forzar reautenticación tras cambio de contraseña.

## Pruebas sugeridas
- Consultar perfil propio, intentar consultar otro sin permisos, actualizar datos válidos e inválidos, cambiar contraseña correcta e incorrecta.
