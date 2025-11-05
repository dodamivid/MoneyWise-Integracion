# [API] Fechas de Corte de Ahorro — CRUD
**Fecha:** 2025-10-31

## Objetivo
Registrar fechas clave para cerrar periodos de análisis de ahorro y alimentar dashboards de balance.

## Supuestos y seguridad
- JWT obligatorio; `sub` define `usuarioId`. Sólo `admin:ahorro` puede operar sobre terceros.
- Scopes: `ahorro:leer` (GET) y `ahorro:escribir` (POST/DELETE).
- Se maneja zona horaria UTC (`fechaCorte` en ISO-8601). No se permite duplicar fechas para un mismo usuario.
- Las respuestas siguen formato estándar y los SPs emiten `SIGNAL` para errores.

## Arquitectura
```
src/routes/fechasCorte.routes.ts
src/controllers/fechasCorte.controller.ts
src/services/fechasCorte.service.ts
src/repositories/fechasCorte.repository.ts
src/dtos/fechasCorte.dto.ts
```

## SPs requeridos
- `sp_fechasCorte_listar(pUsuarioId INT, pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Devuelve filas con alias `fechaCorteId`, `usuarioId`, `fechaCorte`, `creadoEn` y `totalRegistros`.
- `sp_fechasCorte_crear(pUsuarioId INT, pFechaCorte DATETIME)` → `{ fechaCorteId }`; valida duplicados (`DUPLICADO`).
- `sp_fechasCorte_eliminar(pFechaCorteId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/ahorro/fechas-corte
- Auth: JWT.
- Scopes: `ahorro:leer`.
- Query: `usuarioId` (opcional, sólo admins), `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`fechaCorte|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "fechaCorteId": 5,
      "usuarioId": 23,
      "fechaCorte": "2025-03-31T23:59:59Z",
      "creadoEn": "2025-03-01T10:00:00Z"
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
- Errores: `PERMISO_DENEGADO(403)` sin scope admin, `DATOS_INVALIDOS(422)` por paginación u orden incorrecto.
- SP: `CALL sp_fechasCorte_listar(...)`.

### POST /api/v1/ahorro/fechas-corte
- Auth: JWT.
- Scopes: `ahorro:escribir`.
- Body:
```json
{
  "usuarioId": 23,
  "fechaCorte": "2025-03-31T23:59:59Z"
}
```
- Validaciones: `fechaCorte` obligatoria, debe ser posterior a la última `fechaCorte` registrada (regla de negocio opcional), no permitir duplicados.
- Respuesta 201: `{ "ok": true, "data": { "fechaCorteId": 5 } }`.
- Errores: `DUPLICADO(409)` si la fecha ya existe, `DATOS_INVALIDOS(422)` por formato, `PERMISO_DENEGADO(403)` sin scope.
- SP: `CALL sp_fechasCorte_crear(...)`.

### DELETE /api/v1/ahorro/fechas-corte/:id
- Auth: JWT.
- Scopes: `ahorro:escribir`.
- Reglas: evitar borrar la fecha usada por dashboard; confirmar con negocio si se requiere soft-delete.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_fechasCorte_eliminar(pFechaCorteId, pUsuarioId)`.

## Criterios de aceptación
- DTOs controlan formatos; SPs garantizan unicidad por usuario.
- Swagger/Postman cubren creación, listado paginado, eliminación, duplicados y permisos.

## Riesgos
- Dashboard depende de la última fecha de corte; definir mecanismo para recalcular si se elimina.
- Reglas de negocio sobre frecuencia mínima entre fechas (mensual/trimestral) pueden requerir validación adicional.

## Pruebas sugeridas
- Crear fecha, listar con y sin `usuarioId`, intentar duplicado, eliminar y validar error al acceder sin permisos admin.
