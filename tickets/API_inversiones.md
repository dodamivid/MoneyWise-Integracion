# [API] Inversiones — CRUD
**Fecha:** 2025-10-31

## Objetivo
Gestionar inversiones del usuario: altas, consultas, ediciones y bajas con seguimiento de rendimientos.

## Supuestos y seguridad
- JWT requerido en todos los endpoints; `sub` → `usuarioId`. Sólo `admin:inversiones` permite operar sobre terceros.
- Scopes: `inversiones:leer` (GET), `inversiones:escribir` (POST/PATCH/DELETE).
- Campos monetarios `DECIMAL(12,2)`; `tasaInteresPorc` `DECIMAL(5,2)` (0–100).
- Reglas de negocio: `fechaFin` opcional, pero cuando existe debe ser ≥ `fechaInicio`; `destinoId` puede ser nulo para inversiones sin destino predeterminado.

## Arquitectura
```
src/routes/inversiones.routes.ts
src/controllers/inversiones.controller.ts
src/services/inversiones.service.ts
src/repositories/inversiones.repository.ts
src/dtos/inversiones.dto.ts
```

## SPs requeridos
- `sp_inversiones_listar(pUsuarioId INT, pDesde DATETIME, pHasta DATETIME, pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Devuelve filas con alias `inversionId`, `usuarioId`, `destinoId`, `monto`, `objetivo`, `fechaInicio`, `fechaFin`, `tasaInteresPorc`, `creadoEn`, `actualizadoEn` y `totalRegistros`.
- `sp_inversiones_crear(pUsuarioId INT, pDestinoId INT, pMonto DECIMAL(12,2), pObjetivo VARCHAR(120), pFechaInicio DATETIME, pFechaFin DATETIME, pTasaInteresPorc DECIMAL(5,2))`
  - Devuelve `{ inversionId }`.
- `sp_inversiones_obtener(pInversionId INT)` → inversión completa o `NO_ENCONTRADO`.
- `sp_inversiones_actualizar(pInversionId INT, pUsuarioId INT, pDestinoId INT, pMonto DECIMAL(12,2), pObjetivo VARCHAR(120), pFechaInicio DATETIME, pFechaFin DATETIME, pTasaInteresPorc DECIMAL(5,2))` → `{ actualizado BOOLEAN }`.
- `sp_inversiones_eliminar(pInversionId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/inversiones
- Auth: JWT.
- Scopes: `inversiones:leer`.
- Query: `usuarioId` (adm), `desde`, `hasta`, `pagina` (default 1), `tamanoPagina` (default 20 máx 100), `orden` (`fechaInicio|fechaFin|monto|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "inversionId": 11,
      "usuarioId": 23,
      "destinoId": 9,
      "monto": 5000.00,
      "objetivo": "Fondo de emergencia",
      "fechaInicio": "2025-02-01T00:00:00Z",
      "fechaFin": "2026-02-01T00:00:00Z",
      "tasaInteresPorc": 7.50,
      "creadoEn": "2025-02-01T10:00:00Z",
      "actualizadoEn": "2025-02-10T08:12:00Z"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "tamanoPagina": 20,
      "total": 1
    }
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por filtros inválidos, `PERMISO_DENEGADO(403)` sin scope admin sobre terceros.
- SP: `CALL sp_inversiones_listar(...)`.

### POST /api/v1/inversiones
- Auth: JWT.
- Scopes: `inversiones:escribir`.
- Body:
```json
{
  "usuarioId": 23,
  "destinoId": 9,
  "monto": 5000.00,
  "objetivo": "Fondo de emergencia",
  "fechaInicio": "2025-02-01T00:00:00Z",
  "fechaFin": "2026-02-01T00:00:00Z",
  "tasaInteresPorc": 7.5
}
```
- Validaciones: monto > 0, tasa 0–100, `objetivo` máx. 120 caracteres, fechas coherentes.
- Respuesta 201: `{ "ok": true, "data": { "inversionId": 11 } }`.
- Errores: `DATOS_INVALIDOS(422)`, `FK_INEXISTENTE(422)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_inversiones_crear(...)`.

### GET /api/v1/inversiones/:id
- Auth: JWT.
- Scopes: `inversiones:leer`.
- Respuesta 200: igual estructura que POST, con campos `creadoEn`, `actualizadoEn`.
- Errores: `NO_ENCONTRADO(404)` o `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_inversiones_obtener(pInversionId)`.

### PATCH /api/v1/inversiones/:id
- Auth: JWT.
- Scopes: `inversiones:escribir`.
- Body parcial; validar reglas según campos enviados.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `DATOS_INVALIDOS(422)`, `FK_INEXISTENTE(422)`, `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_inversiones_actualizar(...)`.

### DELETE /api/v1/inversiones/:id
- Auth: JWT.
- Scopes: `inversiones:escribir`.
- Reglas: Cancelación definitiva o marcar `fechaCancelacion`; validar con equipo de negocio.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_inversiones_eliminar(pInversionId, pUsuarioId)`.

## Criterios de aceptación
- Paginación y orden controlados; totales consistentes.
- Validaciones de negocio implementadas en DTOs y SP.
- Swagger/Postman con casos: alta, GET filtrado, actualización parcial, eliminación, errores de permisos/FK.

## Riesgos
- Tasas > 100 o negativas deben bloquearse; considerar validación en SP.
- Manejo de inversiones con destino eliminado: definir cascada o nulificar.

## Pruebas sugeridas
- Crear inversión, listar sin filtros, filtrar por fechas, actualizar tasa, borrar registro, validar error al usar destino inexistente y prohibición de operar sobre otro usuario sin scope admin.
