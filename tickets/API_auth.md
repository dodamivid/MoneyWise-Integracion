# [API] Autenticación — Registro/Acceso/Olvido/Restablecer
**Fecha:** 2025-10-31

## Objetivo
Registrar usuarios, autenticarlos mediante JWT y administrar el flujo de recuperación de contraseña vía correo electrónico.

## Supuestos generales
- Passwords se almacenan con `bcrypt` (`cost` configurable, mínimo 12). El hash se genera en servicio antes de llamar al SP.
- JWT firmado con RS256, expiración 24h; payload incluye `sub` (usuarioId), `nombre`, `correo`, `scopes`.
- Todos los endpoints retornan `{ "ok": true/false, ... }` según contrato global.
- Los correos se envían a través de un servicio externo; almacenar token de restablecimiento en tabla dedicada (`auth_tokens`) con expiración de 15 minutos.

## Arquitectura
```
src/routes/auth.routes.ts
src/controllers/auth.controller.ts
src/services/auth.service.ts
src/repositories/auth.repository.ts
src/dtos/auth.dto.ts
src/emails/auth.mailer.ts (enviar plantillas)
```

## SPs requeridos
- `sp_usuarios_registrar(pNombre VARCHAR(80), pApellidoP VARCHAR(80), pApellidoM VARCHAR(80), pCorreo VARCHAR(120), pFechaN DATE, pHash VARCHAR(72))`
  - Devuelve `{ usuarioId, nombre, apellidoP, apellidoM, correo, creadoEn, scopesPorDefecto }`.
  - Valida duplicidad por correo (`SIGNAL 'DUPLICADO'`).
- `sp_auth_acceso(pCorreo VARCHAR(120))`
  - Devuelve `{ usuarioId, hash, nombre, correo, activo, scopes }`.
- `sp_auth_olvido_iniciar(pCorreo VARCHAR(120), pToken VARCHAR(128), pExpira DATETIME)`
  - Inserta token de recuperación y devuelve `{ enviado BOOLEAN }`; si correo no existe responder igual para evitar enumeración.
- `sp_auth_restablecer_confirmar(pToken VARCHAR(128), pHashNuevo VARCHAR(72))`
  - Actualiza contraseña si token vigente; `SIGNAL 'TOKEN_INVALIDO'` o `TOKEN_EXPIRADO`.

## Contrato por endpoint
### POST /api/v1/auth/registro
- Auth: público.
- Body:
```json
{
  "nombre": "Juan",
  "apellidoP": "Pérez",
  "apellidoM": "López",
  "correo": "juan@example.com",
  "fechaN": "1995-05-20",
  "contrasena": "Pa$$w0rd!"
}
```
- Validaciones: nombre/apellidos 2–80 caracteres, `correo` formato RFC5322, `fechaN` mayor de 16 años, `contrasena` mínimo 8 caracteres con mayúscula, minúscula y dígito.
- Flujo: servicio genera hash, llama `sp_usuarios_registrar`, crea JWT inicial opcional, envía correo de bienvenida.
- Respuesta 201:
```json
{
  "ok": true,
  "data": {
    "usuarioId": 1,
    "nombreCompleto": "Juan Pérez López",
    "correo": "juan@example.com",
    "creadoEn": "2025-10-31T00:00:00Z",
    "scopes": ["ingresos:leer", "egresos:leer"]
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por payload, `EMAIL_DUPLICADO(409)` desde el SP, `ERROR_SERVIDOR(500)` si falla correo (registrar métrica pero no bloquear).

### POST /api/v1/auth/acceso
- Auth: público.
- Body:
```json
{ "correo": "juan@example.com", "contrasena": "Pa$$w0rd!" }
```
- Flujo: repositorio consulta `sp_auth_acceso`, compara hash con `bcrypt.compare`, valida bandera `activo`.
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "token": "<jwt>",
    "refreshToken": "<uuid-opcional>",
    "expiraEn": 86400,
    "usuario": {
      "usuarioId": 1,
      "nombre": "Juan",
      "correo": "juan@example.com",
      "scopes": ["ingresos:leer", "egresos:leer"]
    }
  }
}
```
- Errores: `CREDENCIALES_INVALIDAS(401)` por correo inexistente o hash no coincide, `USUARIO_INACTIVO(403)` si `activo = 0`.

### POST /api/v1/auth/olvido
- Auth: público.
- Body: `{ "correo": "juan@example.com" }`.
- Flujo: DTO valida correo; servicio genera token (UUID), expiración 15 minutos, lo envía al SP junto con correo. Se envía email con link `${APP_URL}/restablecer?token=<token>`.
- Respuesta 200 siempre:
```json
{ "ok": true, "data": { "enviado": true } }
```
- Errores (sólo se loguean, no se exponen): `EMAIL_NO_ENVIADO(500)` si falla el correo; se responde éxito pero se registra alerta.

### POST /api/v1/auth/restablecer
- Auth: público.
- Body:
```json
{
  "token": "2b1d6a70-...",
  "contrasenaNueva": "Nuev0P@ss!"
}
```
- Validaciones: `token` UUID, `contrasenaNueva` cumple política. Servicio genera hash y llama SP.
- Respuesta 200: `{ "ok": true, "data": { "restablecido": true } }`.
- Errores: `TOKEN_INVALIDO(400)` o `TOKEN_EXPIRADO(410)` desde SP, `DATOS_INVALIDOS(422)` por password.

## Criterios de aceptación
- Contraseñas nunca se registran en texto plano (log, request, error).
- Tokens JWT contienen scopes iniciales y se firman con clave privada en `config/jwt`.
- Colección Postman cubre flujos completos y errores (email duplicado, password débil, token inválido).

## Riesgos
- Envío de correo depende del servicio SMTP; definir reintentos/backoff.
- Tokens de restablecimiento deben invalidarse tras un uso o expiración para evitar reuse.

## Pruebas sugeridas
- Registro con datos válidos e invalidos, login correcto e incorrecto, flujo de olvido/restablecer (token válido, expirado, inválido), usuario inactivo.
