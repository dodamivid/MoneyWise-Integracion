# [API] Egresos — CRUD con filtros
**Fecha:** 2025-10-31

## Objetivo
Registrar, consultar, actualizar y eliminar egresos del usuario con filtros por periodo, tipo y destino.

## Supuestos y seguridad
- Todos los endpoints requieren `Authorization: Bearer <jwt>` emitido por MoneyWise; se toma `sub` del token como `usuarioId` por defecto.
- Scopes mínimos: `egresos:leer` para lecturas, `egresos:escribir` para POST/PATCH/DELETE; `admin:egresos` habilita operar sobre `usuarioId` distinto al del token.
- Respuestas éxito siguen `{ "ok": true, "data": ..., "meta": { "paginacion": {...} } }`; errores usan `{ "ok": false, "error": { "codigo": "...", "mensaje": "..." } }`.
- Validar que el monto sea `DECIMAL(12,2)` positivo, fechas en ISO-8601 (`YYYY-MM-DD` o fecha-tiempo), y que `fechaInicio <= fechaFin` cuando ambos existen.
- FKs (`usuarioId`, `tipoId`, `destinoId`) deben existir; el repositorio convierte errores de SP con `SIGNAL` a HTTP correspondientes.

## Arquitectura
```
src/routes/egresos.routes.ts
src/controllers/egresos.controller.ts
src/services/egresos.service.ts
src/repositories/egresos.repository.ts
src/dtos/egresos.dto.ts
```

## SPs requeridos
- `sp_egresos_listar(pUsuarioId INT, pDesde DATETIME, pHasta DATETIME, pTipoId INT, pDestinoId INT, pMontoMin DECIMAL(12,2), pMontoMax DECIMAL(12,2), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Result set: columnas alias en español (`egresoId`, `usuarioId`, `tipoId`, `destinoId`, `monto`, `fechaInicio`, `fechaFin`, `creadoEn`, `actualizadoEn`, `descripcion`) + fila con `totalRegistros`.
- `sp_egresos_crear(pUsuarioId INT, pTipoId INT, pDestinoId INT, pMonto DECIMAL(12,2), pFechaInicio DATETIME, pFechaFin DATETIME, pDescripcion VARCHAR(255))`
  - Result set único: `{ egresoId }`.
- `sp_egresos_obtener(pEgresoId INT)`
  - Result set: egreso completo; `SIGNAL SQLSTATE '45000'` con `NO_ENCONTRADO`.
- `sp_egresos_actualizar(pEgresoId INT, pUsuarioId INT, pTipoId INT, pDestinoId INT, pMonto DECIMAL(12,2), pFechaInicio DATETIME, pFechaFin DATETIME, pDescripcion VARCHAR(255))`
  - Result set: `{ actualizado BOOLEAN }`.
- `sp_egresos_eliminar(pEgresoId INT, pUsuarioId INT)`
  - Result set: `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/egresos
- Auth: JWT obligatorio.
- Scopes: `egresos:leer`.
- Query params:
  - `usuarioId` (opcional) — sólo visible para quien tenga `admin:egresos`; si se omite se usa `sub`.
  - `desde`, `hasta` — fechas ISO opcionales para filtrar; ambos o ninguno; validar rango.
  - `tipoId`, `destinoId` — enteros opcionales.
  - `min`, `max` — montos decimales; exigir `min <= max` si ambos existen.
  - `pagina`, `tamanoPagina` — enteros con defaults `1` y `20` (máximo 100).
  - `orden` — `creadoEn|fechaInicio|monto` + sufijo `:asc|:desc`; validar contra lista blanca.
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "egresoId": 15,
      "usuarioId": 23,
      "tipoId": 4,
      "destinoId": 9,
      "monto": 1250.50,
      "descripcion": "Renta",
      "fechaInicio": "2025-03-01T00:00:00Z",
      "fechaFin": "2025-03-31T00:00:00Z",
      "creadoEn": "2025-03-01T12:00:00Z",
      "actualizadoEn": "2025-03-05T16:45:00Z"
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
- Errores comunes: `DATOS_INVALIDOS(422)` para query inválida, `PERMISO_DENEGADO(403)` cuando un usuario sin scope admin intenta consultar otro `usuarioId`.
- SP: `CALL sp_egresos_listar(...)`.

### POST /api/v1/egresos
- Auth: JWT obligatorio.
- Scopes: `egresos:escribir`.
- Body esperado:
```json
{
  "usuarioId": 23,
  "tipoId": 4,
  "destinoId": 9,
  "monto": 1250.50,
  "descripcion": "Renta mensual",
  "fechaInicio": "2025-03-01T00:00:00Z",
  "fechaFin": "2025-03-31T00:00:00Z"
}
```
- Validaciones: `usuarioId` omitible para usuarios estándar (backend usa `sub`); `destinoId` opcional; `descripcion` máx. 255 caracteres; `fechaFin` opcional pero debe ser ≥ `fechaInicio`.
- Respuesta 201:
```json
{ "ok": true, "data": { "egresoId": 42 } }
```
- Errores: `DATOS_INVALIDOS(422)` por payload inválido, `FK_INEXISTENTE(422)` si `tipoId` o `destinoId` no existen, `PERMISO_DENEGADO(403)` si intenta crear para otro usuario sin scope admin.
- SP: `CALL sp_egresos_crear(...)`.

### GET /api/v1/egresos/:id
- Auth: JWT obligatorio.
- Scopes: `egresos:leer`.
- Reglas: sólo dueño o admin puede leer.
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "egresoId": 42,
    "usuarioId": 23,
    "tipoId": 4,
    "destinoId": 9,
    "monto": 1250.50,
    "descripcion": "Renta mensual",
    "fechaInicio": "2025-03-01T00:00:00Z",
    "fechaFin": "2025-03-31T00:00:00Z",
    "creadoEn": "2025-03-01T12:00:00Z",
    "actualizadoEn": "2025-03-05T16:45:00Z"
  }
}
```
- Errores: `NO_ENCONTRADO(404)` si el SP levanta la señal, `PERMISO_DENEGADO(403)` para accesos cruzados.
- SP: `CALL sp_egresos_obtener(pEgresoId)`.

### PATCH /api/v1/egresos/:id
- Auth: JWT obligatorio.
- Scopes: `egresos:escribir`.
- Body parcial con los mismos campos de POST; backend valida que al menos un campo venga y recalcula montos/fechas.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `DATOS_INVALIDOS(422)`, `FK_INEXISTENTE(422)`, `NO_ENCONTRADO(404)` y `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_egresos_actualizar(...)`.

### DELETE /api/v1/egresos/:id
- Auth: JWT obligatorio.
- Scopes: `egresos:escribir`.
- Reglas: eliminar lógico en SP (marcar `fechaEliminacion`) o hard delete según definición del DBA.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)` o `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_egresos_eliminar(pEgresoId, pUsuarioId)`.

## Criterios de aceptación
- Paginación consistente con formato de `meta`.
- Ordenación segura; se rechaza `orden` fuera de la lista.
- Montos devueltos siempre con dos decimales; fechas en UTC.
- Swagger y colección Postman cubren casos de éxito, validación, permisos y FKs.

## Riesgos
- SPs deben aplicar la validación de dueño; documentar en README de BD.
- Si se eliminan destinos, garantizar que SP `sp_egresos_crear` maneje `destinoId` nulo.

## Pruebas sugeridas
- Crear egreso, listar por rango, obtener/actualizar/eliminar y casos de error (`FK_INEXISTENTE`, `PERMISO_DENEGADO`).
