# [API] Catálogos — Destinos (CRUD)
**Fecha:** 2025-10-31

## Objetivo
Gestionar el catálogo de destinos de egresos (p. ej. Renta, Luz, Colegiatura) por usuario, con opciones por defecto y validaciones de unicidad.

## Supuestos y seguridad
- JWT requerido; scopes `catalogos:leer` y `catalogos:escribir`. `admin:catalogos` permite leer/editar catálogos de otros usuarios.
- Existen destinos predefinidos para nuevos usuarios: `Renta`, `Servicios`, `Transporte`, `Alimentación`.
- Los nombres son `VARCHAR(100)` en mayúscula título; se guarda `usuarioId` para destinos personalizados y `null` para los globales.
- Respuestas usan el formato estándar con paginación y errores uniformes.

## Arquitectura
```
src/routes/catalogos.routes.ts
src/controllers/catalogos.controller.ts
src/services/catalogos.service.ts
src/repositories/catalogos.repository.ts
src/dtos/catalogos.dto.ts
```

## SPs requeridos
- `sp_destinos_listar(pUsuarioId INT, pBuscar VARCHAR(100), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Devuelve filas `{ destinoId, usuarioId, nombre, esPorDefecto BOOLEAN, creadoEn, actualizadoEn }` + `totalRegistros`.
  - Si `pUsuarioId` es nulo devuelve catálogos globales; con scope admin se puede pasar otro usuario.
- `sp_destinos_crear(pUsuarioId INT, pNombre VARCHAR(100))` → `{ destinoId, nombre }`; valida unicidad por usuario (incluye globales).
- `sp_destinos_actualizar(pDestinoId INT, pUsuarioId INT, pNombre VARCHAR(100))` → `{ actualizado BOOLEAN }`.
- `sp_destinos_eliminar(pDestinoId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }` (soft delete recomendado).

## Contrato por endpoint
### GET /api/v1/catalogos/destinos
- Auth: JWT.
- Scopes: `catalogos:leer`.
- Query: `buscar` (opcional, like `%texto%`), `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`nombre|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "destinoId": 1,
      "usuarioId": null,
      "nombre": "Renta",
      "esPorDefecto": true,
      "creadoEn": "2025-01-01T00:00:00Z",
      "actualizadoEn": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "tamanoPagina": 20,
      "total": 4
    }
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` por paginación/orden inválidos, `PERMISO_DENEGADO(403)` sin scope admin cuando se consulta otro usuario.
- SP: `CALL sp_destinos_listar(...)`.

### POST /api/v1/catalogos/destinos
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body:
```json
{
  "nombre": "Suscripciones"
}
```
- Reglas: nombre requerido 3–100 caracteres, sin duplicados (case-insensitive) considerando catálogos globales + del usuario.
- Respuesta 201:
```json
{ "ok": true, "data": { "destinoId": 9, "nombre": "Suscripciones" } }
```
- Errores: `DATOS_INVALIDOS(422)` por longitud/formato, `DUPLICADO(409)` si ya existe, `PERMISO_DENEGADO(403)` si intenta crear para otro usuario sin scope admin.
- SP: `CALL sp_destinos_crear(pUsuarioId, pNombre)`.

### PUT /api/v1/catalogos/destinos/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Gastos Médicos" }`.
- Reglas: no se permite editar destinos por defecto globales salvo scope admin; validar unicidad.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `DATOS_INVALIDOS(422)`, `NO_ENCONTRADO(404)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_destinos_actualizar(pDestinoId, pUsuarioId, pNombre)`.

### DELETE /api/v1/catalogos/destinos/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Regla: soft delete (`activo=0` o `fechaEliminacion`); bloquear eliminación de destinos por defecto.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_destinos_eliminar(pDestinoId, pUsuarioId)`.

## Criterios de aceptación
- DTOs validan nombre y permisos; SPs devuelven alias en español.
- Swagger/Postman incluyen ejemplos para búsqueda, paginación, duplicados y restricciones de destinos por defecto.

## Riesgos
- Cambios en catálogos pueden afectar egresos/inversiones; definir estrategia de cascada (re-asignar a “Sin destino” o bloquear).
- Si se maneja cache en frontend, invalidar tras crear/editar/eliminar.

## Pruebas sugeridas
- Listar sin filtros y con `buscar`, crear destino nuevo, intentar duplicado, actualizar nombre, eliminar destino y validar restricción en destino por defecto.
