# [API] Ingresos — CRUD con filtros
**Fecha:** 2025-10-31

## Objetivo
Gestionar los ingresos del usuario con filtros por periodo, tipo, procedencia y rango de montos.

## Supuestos y seguridad
- JWT obligatorio salvo aclaración; `sub` determina el `usuarioId` salvo que el scope admin permita trabajar con otros usuarios.
- Scopes base: `ingresos:leer` para lecturas, `ingresos:escribir` para altas/ediciones/bajas; `admin:ingresos` habilita operar sobre `usuarioId` distinto.
- Validar montos positivos (`DECIMAL(12,2)`), fechas UTC ISO y `fechaInicio <= fechaFin`.
- Respuestas y errores siguen el contrato global `{ ok, data/meta }` y `{ ok:false, error }`.
- SPs deben usar `SIGNAL` con códigos `DATOS_INVALIDOS`, `FK_INEXISTENTE`, `NO_ENCONTRADO`, `PERMISO_DENEGADO`, `DUPLICADO`.

## Arquitectura
```
src/routes/ingresos.routes.ts
src/controllers/ingresos.controller.ts
src/services/ingresos.service.ts
src/repositories/ingresos.repository.ts
src/dtos/ingresos.dto.ts
```

## SPs requeridos
- `sp_ingresos_listar(pUsuarioId INT, pDesde DATETIME, pHasta DATETIME, pTipoId INT, pProcedenciaId INT, pMontoMin DECIMAL(12,2), pMontoMax DECIMAL(12,2), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Devuelve filas con alias en español (`ingresoId`, `usuarioId`, `tipoId`, `procedenciaId`, `monto`, `descripcion`, `fechaInicio`, `fechaFin`, `creadoEn`, `actualizadoEn`) y un `SELECT totalRegistros`.
- `sp_ingresos_crear(pUsuarioId INT, pTipoId INT, pProcedenciaId INT, pMonto DECIMAL(12,2), pFechaInicio DATETIME, pFechaFin DATETIME, pDescripcion VARCHAR(255))` → `{ ingresoId }`.
- `sp_ingresos_obtener(pIngresoId INT)` → fila única o `SIGNAL` `NO_ENCONTRADO`.
- `sp_ingresos_actualizar(pIngresoId INT, pUsuarioId INT, pTipoId INT, pProcedenciaId INT, pMonto DECIMAL(12,2), pFechaInicio DATETIME, pFechaFin DATETIME, pDescripcion VARCHAR(255))` → `{ actualizado BOOLEAN }`.
- `sp_ingresos_eliminar(pIngresoId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }` (delete lógico recomendado).

## Contrato por endpoint
### GET /api/v1/ingresos
- Auth: JWT.
- Scopes: `ingresos:leer`.
- Query params: `usuarioId` (opcional, sólo para `admin:ingresos`), `desde`, `hasta`, `tipoId`, `procedenciaId`, `min`, `max`, `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`creadoEn|fechaInicio|monto[:asc|:desc]`).
- Validaciones: `min <= max`, `desde <= hasta`, filtrar texto en blanco, sanear `orden`.
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "ingresoId": 101,
      "usuarioId": 23,
      "tipoId": 2,
      "procedenciaId": 5,
      "monto": 18500.00,
      "descripcion": "Sueldo abril",
      "fechaInicio": "2025-04-01T00:00:00Z",
      "fechaFin": "2025-04-30T23:59:59Z",
      "creadoEn": "2025-04-01T12:00:00Z",
      "actualizadoEn": "2025-04-02T09:30:00Z"
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
- Errores: `DATOS_INVALIDOS(422)` por query malformada, `PERMISO_DENEGADO(403)` sin scope admin sobre terceros.
- SP: `CALL sp_ingresos_listar(...)`.

### POST /api/v1/ingresos
- Auth: JWT.
- Scopes: `ingresos:escribir`.
- Body:
```json
{
  "usuarioId": 23,
  "tipoId": 2,
  "procedenciaId": 5,
  "monto": 18500.00,
  "descripcion": "Sueldo abril",
  "fechaInicio": "2025-04-01T00:00:00Z",
  "fechaFin": "2025-04-30T23:59:59Z"
}
```
- Reglas: `usuarioId` opcional para usuarios finales (usar `sub`), `procedenciaId` opcional (nulo permitido), `descripcion` máx. 255, `fechaFin` opcional.
- Respuesta 201: `{ "ok": true, "data": { "ingresoId": 101 } }`.
- Errores: `DATOS_INVALIDOS(422)`, `FK_INEXISTENTE(422)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_ingresos_crear(...)`.

### GET /api/v1/ingresos/:id
- Auth: JWT.
- Scopes: `ingresos:leer`.
- Respuesta 200:
```json
{
  "ok": true,
  "data": {
    "ingresoId": 101,
    "usuarioId": 23,
    "tipoId": 2,
    "procedenciaId": 5,
    "monto": 18500.00,
    "descripcion": "Sueldo abril",
    "fechaInicio": "2025-04-01T00:00:00Z",
    "fechaFin": "2025-04-30T23:59:59Z",
    "creadoEn": "2025-04-01T12:00:00Z",
    "actualizadoEn": "2025-04-02T09:30:00Z"
  }
}
```
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_ingresos_obtener(pIngresoId)`.

### PATCH /api/v1/ingresos/:id
- Auth: JWT.
- Scopes: `ingresos:escribir`.
- Body: parcial; validar que al menos un campo venga y que la modificación no rompa reglas (`monto` positivo, fechas coherentes).
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `DATOS_INVALIDOS(422)`, `FK_INEXISTENTE(422)`, `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_ingresos_actualizar(...)`.

### DELETE /api/v1/ingresos/:id
- Auth: JWT.
- Scopes: `ingresos:escribir`.
- Regla: eliminar lógico recomendado para mantener reportería (campo `fechaEliminacion`).
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)` o `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_ingresos_eliminar(pIngresoId, pUsuarioId)`.

## Criterios de aceptación
- Validaciones server-side + DTOs; respuestas con `meta.paginacion`.
- Historial auditable (`creadoEn`, `actualizadoEn`).
- Swagger + Postman cubren escenarios: filtros, sin resultados, error de permisos, error de FK.

## Riesgos
- Sincronizar `procedenciaId` nulo cuando el catálogo se elimina.
- Volumen alto requiere índices en `(usuario_id, fecha_inicio)` y `(usuario_id, tipo_id)` como se indica en ticket de BD.

## Pruebas sugeridas
- Escenarios de creación/listado/edición/eliminación; filtros combinados; validación de rango; consulta de otro usuario sin scope admin.
