# [API] Metas — CRUD y seguimiento
**Fecha:** 2025-10-31

## Objetivo
Permitir al usuario crear, consultar, actualizar y eliminar metas de ahorro, medir avance (`ahorroReal`) y controlar el estado (`activa`).

## Supuestos y seguridad
- Autenticación JWT obligatoria; se usa `sub` como `usuarioId` salvo scopes administrativos.
- Scopes: `metas:leer` para GET, `metas:escribir` para POST/PATCH/DELETE; `admin:metas` permite operar sobre terceros.
- Metas manejan montos `DECIMAL(12,2)`, fechas ISO en UTC y banderas booleanas.
- Respuestas y errores siguen formato estándar `{ ok, data/meta }` y `{ ok:false, error }`.

## Arquitectura
```
src/routes/metas.routes.ts
src/controllers/metas.controller.ts
src/services/metas.service.ts
src/repositories/metas.repository.ts
src/dtos/metas.dto.ts
```

## SPs requeridos
- `sp_metas_listar(pUsuarioId INT, pDesde DATETIME, pHasta DATETIME, pActiva BOOLEAN, pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Result set con alias: `metaId`, `usuarioId`, `nombre`, `montoObjetivo`, `ahorroReal`, `activa`, `fechaInicio`, `fechaFin`, `creadoEn`, `actualizadoEn`, `porcentajeAvance` y `totalRegistros`.
- `sp_metas_crear(pUsuarioId INT, pNombre VARCHAR(120), pMontoObjetivo DECIMAL(12,2), pFechaInicio DATETIME, pFechaFin DATETIME, pActiva BOOLEAN)`
  - Devuelve `{ metaId }`.
- `sp_metas_obtener(pMetaId INT)` → fila completa o `NO_ENCONTRADO`.
- `sp_metas_actualizar(pMetaId INT, pUsuarioId INT, pNombre VARCHAR(120), pMontoObjetivo DECIMAL(12,2), pAhorroReal DECIMAL(12,2), pFechaInicio DATETIME, pFechaFin DATETIME, pActiva BOOLEAN)` → `{ actualizado BOOLEAN }`.
- `sp_metas_eliminar(pMetaId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }` (eliminar lógico recomendado).

## Contrato por endpoint
### GET /api/v1/metas
- Auth: JWT.
- Scopes: `metas:leer`.
- Query: `usuarioId` (opcional admin), `desde`, `hasta`, `activa` (`true|false`), `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`fechaInicio|fechaFin|creadoEn|montoObjetivo|porcentajeAvance[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "metaId": 7,
      "usuarioId": 23,
      "nombre": "Vacaciones 2026",
      "montoObjetivo": 150000.00,
      "ahorroReal": 35000.00,
      "porcentajeAvance": 23.33,
      "activa": true,
      "fechaInicio": "2025-01-01T00:00:00Z",
      "fechaFin": "2026-12-31T23:59:59Z",
      "creadoEn": "2025-01-05T10:45:00Z",
      "actualizadoEn": "2025-04-01T08:10:00Z"
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
- Errores: `DATOS_INVALIDOS(422)` por filtros inválidos, `PERMISO_DENEGADO(403)` sin scope admin.
- SP: `CALL sp_metas_listar(...)`.

### POST /api/v1/metas
- Auth: JWT.
- Scopes: `metas:escribir`.
- Body:
```json
{
  "usuarioId": 23,
  "nombre": "Vacaciones 2026",
  "montoObjetivo": 150000.00,
  "fechaInicio": "2025-01-01T00:00:00Z",
  "fechaFin": "2026-12-31T23:59:59Z",
  "activa": true
}
```
- Validaciones: `nombre` requerido máx. 120 caracteres, `montoObjetivo > 0`, `fechaFin` opcional pero ≥ `fechaInicio`, `activa` default `true`.
- Respuesta 201: `{ "ok": true, "data": { "metaId": 7 } }`.
- Errores: `DATOS_INVALIDOS(422)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_metas_crear(...)`.

### GET /api/v1/metas/:id
- Auth: JWT.
- Scopes: `metas:leer`.
- Respuesta 200: igual estructura que POST agregando `ahorroReal`, `porcentajeAvance`, `creadoEn`, `actualizadoEn`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_metas_obtener(pMetaId)`.

### PATCH /api/v1/metas/:id
- Auth: JWT.
- Scopes: `metas:escribir`.
- Body parcial; campos soportados: `nombre`, `montoObjetivo`, `ahorroReal`, `fechaInicio`, `fechaFin`, `activa`.
- Reglas: `ahorroReal` no puede superar `montoObjetivo` sin scope admin; recalcular `porcentajeAvance` en aplicación o SP.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `DATOS_INVALIDOS(422)`, `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_metas_actualizar(...)`.

### DELETE /api/v1/metas/:id
- Auth: JWT.
- Scopes: `metas:escribir`.
- Reglas: implementar soft delete (`fechaEliminacion`) para no romper dashboard histórico.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_metas_eliminar(pMetaId, pUsuarioId)`.

## Criterios de aceptación
- DTOs validan formatos y reglas de negocio.
- SPs devuelven alias en español y levantan `SIGNAL` con códigos acordados.
- Swagger/Postman documentan casos de éxito, filtros, actualización parcial y errores.

## Riesgos
- Calcular `porcentajeAvance` en SP puede generar división por cero si `montoObjetivo` es cero; validar antes.
- Concurrencia al actualizar `ahorroReal`; considerar bloqueo optimista (`updatedAt`).

## Pruebas sugeridas
- Crear meta, listar filtrando por `activa`, actualizar avance, cerrar meta (`activa=false`), eliminar y validar que dashboard sigue funcionando; probar error por falta de permisos y validación de fechas.
