# [API] Catálogos — Frecuencias de ingresos/egresos (CRUD)
**Fecha:** 2025-10-31

## Objetivo
Mantener el catálogo de periodicidades (diario, semanal, mensual, etc.) usado para ingresos y egresos recurrentes.

## Supuestos y seguridad
- JWT obligatorio; scopes `catalogos:leer` y `catalogos:escribir`.
- Catálogo global (no por usuario) con valores iniciales: `Diario`, `Semanal`, `Quincenal`, `Mensual`, `Bimestral`, `Trimestral`, `Semestral`, `Anual`.
- Sólo usuarios con scope admin pueden agregar/editar/eliminar frecuencias; clientes estándar las consumen en modo lectura.
- Nombres únicos (case-insensitive), `VARCHAR(60)`.

## Arquitectura
```
src/routes/catalogos.routes.ts
src/controllers/catalogos.controller.ts
src/services/catalogos.service.ts
src/repositories/catalogos.repository.ts
src/dtos/catalogos.dto.ts
```

## SPs requeridos
- `sp_frecuencias_listar(pBuscar VARCHAR(60), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Result set `{ frecuenciaId, nombre, creadoEn, actualizadoEn }` + `totalRegistros`.
- `sp_frecuencias_crear(pNombre VARCHAR(60))` → `{ frecuenciaId, nombre }`.
- `sp_frecuencias_actualizar(pFrecuenciaId INT, pNombre VARCHAR(60))` → `{ actualizado BOOLEAN }`.
- `sp_frecuencias_eliminar(pFrecuenciaId INT)` → `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/catalogos/frecuencias
- Auth: JWT.
- Scopes: `catalogos:leer`.
- Query: `buscar`, `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`nombre|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "frecuenciaId": 1,
      "nombre": "Mensual",
      "creadoEn": "2025-01-01T00:00:00Z",
      "actualizadoEn": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "tamanoPagina": 20,
      "total": 8
    }
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por paginación u orden incorrecto.
- SP: `CALL sp_frecuencias_listar(...)`.

### POST /api/v1/catalogos/frecuencias
- Auth: JWT.
- Scopes: `catalogos:escribir` + `admin:catalogos`.
- Body: `{ "nombre": "Bimestral" }`.
- Regla: 3–60 caracteres, sin duplicados.
- Respuesta 201: `{ "ok": true, "data": { "frecuenciaId": 9, "nombre": "Bimestral" } }`.
- Errores: `PERMISO_DENEGADO(403)` sin scope admin, `DUPLICADO(409)`, `DATOS_INVALIDOS(422)`.
- SP: `CALL sp_frecuencias_crear(pNombre)`.

### PUT /api/v1/catalogos/frecuencias/:id
- Auth: JWT.
- Scopes: `catalogos:escribir` + `admin:catalogos`.
- Body: `{ "nombre": "Mensual fijo" }`.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_frecuencias_actualizar(pFrecuenciaId, pNombre)`.

### DELETE /api/v1/catalogos/frecuencias/:id
- Auth: JWT.
- Scopes: `catalogos:escribir` + `admin:catalogos`.
- Reglas: impedir eliminar frecuencias ligadas a movimientos (SP debe validar y enviar `EN_USO(409)`).
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `EN_USO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_frecuencias_eliminar(pFrecuenciaId)`.

## Criterios de aceptación
- DTOs aplican validaciones y restringen acciones a scopes admin.
- SPs devuelven alias en español y controlan integridad (`EN_USO` cuando existan referencias).
- Swagger/Postman incluyen lectura pública y operaciones admin, además de intentos de eliminación con frecuencia en uso.

## Riesgos
- Deprecación de frecuencias usadas requiere migraciones; evaluar bandera `activo` en lugar de delete físico.
- Frontend debe cachear catálogo global con invalidación tras modificaciones admin.

## Pruebas sugeridas
- Listar catálogo, crear frecuencia nueva (admin), validar duplicado, renombrar, intentar eliminar en uso, eliminar exitosa.
