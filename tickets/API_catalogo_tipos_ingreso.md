# [API] Catálogos — Tipos de ingreso (CRUD)
**Fecha:** 2025-10-31

## Objetivo
Administrar los tipos de ingreso (forma de entrada de dinero) para clasificarlos en reportes y dashboards.

## Supuestos y seguridad
- JWT requerido; scopes `catalogos:leer` y `catalogos:escribir`. `admin:catalogos` permite administrar catálogos globales.
- Catálogo mixto: valores globales (por defecto) y valores por usuario.
- Tipos por defecto sugeridos en el plan: `Efectivo`, `Transferencia`, `Cheque`, `Tarjeta`, `Vales`, `Bonos`.
- Nombres únicos (case-insensitive), longitud 3–60 caracteres.

## Arquitectura
```
src/routes/catalogos.routes.ts
src/controllers/catalogos.controller.ts
src/services/catalogos.service.ts
src/repositories/catalogos.repository.ts
src/dtos/catalogos.dto.ts
```

## SPs requeridos
- `sp_tiposIngreso_listar(pUsuarioId INT, pBuscar VARCHAR(60), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Alias: `tipoIngresoId`, `usuarioId`, `nombre`, `esPorDefecto`, `creadoEn`, `actualizadoEn` + `totalRegistros`.
- `sp_tiposIngreso_crear(pUsuarioId INT, pNombre VARCHAR(60))` → `{ tipoIngresoId, nombre }`.
- `sp_tiposIngreso_actualizar(pTipoIngresoId INT, pUsuarioId INT, pNombre VARCHAR(60))` → `{ actualizado BOOLEAN }`.
- `sp_tiposIngreso_eliminar(pTipoIngresoId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/catalogos/tipos-ingreso
- Auth: JWT.
- Scopes: `catalogos:leer`.
- Query: `buscar`, `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`nombre|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "tipoIngresoId": 1,
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
- Errores: `DATOS_INVALIDOS(422)`, `PERMISO_DENEGADO(403)` al consultar otro usuario sin scope admin.
- SP: `CALL sp_tiposIngreso_listar(...)`.

### POST /api/v1/catalogos/tipos-ingreso
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Comisiones" }`.
- Reglas: 3–60 caracteres, sin duplicados considerando globales + usuario.
- Respuesta 201: `{ "ok": true, "data": { "tipoIngresoId": 9, "nombre": "Comisiones" } }`.
- Errores: `DATOS_INVALIDOS(422)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_tiposIngreso_crear(pUsuarioId, pNombre)`.

### PUT /api/v1/catalogos/tipos-ingreso/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Salario" }`.
- Reglas: no modificar tipos por defecto sin scope admin; mantener unicidad.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_tiposIngreso_actualizar(pTipoIngresoId, pUsuarioId, pNombre)`.

### DELETE /api/v1/catalogos/tipos-ingreso/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Regla: soft delete y bloqueo de tipos por defecto.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_tiposIngreso_eliminar(pTipoIngresoId, pUsuarioId)`.

## Criterios de aceptación
- DTOs validan nombre y permisos; se documenta script de seed en ticket BD.
- Swagger/Postman incluyen lectura, creación personalizada, duplicados, edición y eliminación.

## Riesgos
- Eliminar o renombrar tipos afecta clasificaciones históricas; definir comportamiento (cascada o remapeo).
- Para catálogos globales, considerar feature flag para ocultarlos si negocio cambia.

## Pruebas sugeridas
- Consumir catálogo con usuario sin scope admin, crear tipo personalizado, intentar duplicado, editar, eliminar y validar error al tocar tipo por defecto.
