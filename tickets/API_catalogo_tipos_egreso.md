# [API] Catálogos — Tipos de egreso (CRUD)
**Fecha:** 2025-10-31

## Objetivo
Administrar los tipos de egreso (categorías de gasto) utilizados en egresos, dashboards y reportes.

## Supuestos y seguridad
- JWT requerido; scopes `catalogos:leer` y `catalogos:escribir`. `admin:catalogos` necesario para modificar tipos globales.
- Tipos por defecto del plan: `Efectivo`, `Transferencia`, `Cheque`, `Tarjeta`, `Vales`, `Bonos`.
- Catálogo mixto (global + por usuario); nombres únicos 3–60 caracteres.

## Arquitectura
```
src/routes/catalogos.routes.ts
src/controllers/catalogos.controller.ts
src/services/catalogos.service.ts
src/repositories/catalogos.repository.ts
src/dtos/catalogos.dto.ts
```

## SPs requeridos
- `sp_tiposEgreso_listar(pUsuarioId INT, pBuscar VARCHAR(60), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Alias: `tipoEgresoId`, `usuarioId`, `nombre`, `esPorDefecto`, `creadoEn`, `actualizadoEn`, `totalRegistros`.
- `sp_tiposEgreso_crear(pUsuarioId INT, pNombre VARCHAR(60))` → `{ tipoEgresoId, nombre }`.
- `sp_tiposEgreso_actualizar(pTipoEgresoId INT, pUsuarioId INT, pNombre VARCHAR(60))` → `{ actualizado BOOLEAN }`.
- `sp_tiposEgreso_eliminar(pTipoEgresoId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/catalogos/tipos-egreso
- Auth: JWT.
- Scopes: `catalogos:leer`.
- Query: `buscar`, `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`nombre|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "tipoEgresoId": 1,
      "usuarioId": null,
      "nombre": "Efectivo",
      "esPorDefecto": true,
      "creadoEn": "2025-01-01T00:00:00Z",
      "actualizadoEn": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "tamanoPagina": 20,
      "total": 6
    }
  }
}
```
- Errores: `DATOS_INVALIDOS(422)`, `PERMISO_DENEGADO(403)` sin scope admin.
- SP: `CALL sp_tiposEgreso_listar(...)`.

### POST /api/v1/catalogos/tipos-egreso
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Servicios" }`.
- Reglas: 3–60 caracteres, sin duplicados (global + usuario).
- Respuesta 201: `{ "ok": true, "data": { "tipoEgresoId": 9, "nombre": "Servicios" } }`.
- Errores: `DATOS_INVALIDOS(422)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_tiposEgreso_crear(pUsuarioId, pNombre)`.

### PUT /api/v1/catalogos/tipos-egreso/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Renta" }`.
- Reglas: no modificar por defecto salvo admin; validar duplicados.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_tiposEgreso_actualizar(pTipoEgresoId, pUsuarioId, pNombre)`.

### DELETE /api/v1/catalogos/tipos-egreso/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Reglas: soft delete; bloquear tipos por defecto y validar referencias (`EN_USO(409)`).
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `EN_USO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_tiposEgreso_eliminar(pTipoEgresoId, pUsuarioId)`.

## Criterios de aceptación
- DTOs + SPs garantizan unicidad y protegen tipos por defecto.
- Swagger/Postman cubren lectura, creación, edición, eliminación, duplicados y caso `EN_USO`.

## Riesgos
- Cambiar tipos afecta dashboards; definir comportamiento (remapeo a “Sin tipo”).
- Muchos usuarios/herencia de catálogos: revisar estrategia de cache.

## Pruebas sugeridas
- Crear tipo personalizado, intentar duplicado, editar, eliminar en uso (debe fallar), eliminar sin uso y consultar permisos.
