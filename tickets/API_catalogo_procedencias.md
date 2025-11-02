# [API] Catálogos — Procedencias de Ingreso (CRUD)
**Fecha:** 2025-10-31

## Objetivo
Administrar las fuentes de ingreso (empresa, cliente, negocio) por usuario, con opciones predeterminadas para onboarding rápido.

## Supuestos y seguridad
- JWT requerido; scopes `catalogos:leer`/`catalogos:escribir`, con `admin:catalogos` para operar en nombre de otros usuarios.
- Procedencias por defecto para nuevos usuarios: `Empresa`, `Freelance`, `Negocio propio`.
- Nombres `VARCHAR(100)` únicos por usuario (case-insensitive). Se almacena `usuarioId` (`NULL` para presets globales).

## Arquitectura
```
src/routes/catalogos.routes.ts
src/controllers/catalogos.controller.ts
src/services/catalogos.service.ts
src/repositories/catalogos.repository.ts
src/dtos/catalogos.dto.ts
```

## SPs requeridos
- `sp_procedencias_listar(pUsuarioId INT, pBuscar VARCHAR(100), pPagina INT, pTam INT, pOrden VARCHAR(30))`
  - Alias: `procedenciaId`, `usuarioId`, `nombre`, `esPorDefecto`, `creadoEn`, `actualizadoEn`; incluye `totalRegistros`.
- `sp_procedencias_crear(pUsuarioId INT, pNombre VARCHAR(100))` → `{ procedenciaId, nombre }`.
- `sp_procedencias_actualizar(pProcedenciaId INT, pUsuarioId INT, pNombre VARCHAR(100))` → `{ actualizado BOOLEAN }`.
- `sp_procedencias_eliminar(pProcedenciaId INT, pUsuarioId INT)` → `{ eliminado BOOLEAN }`.

## Contrato por endpoint
### GET /api/v1/catalogos/procedencias
- Auth: JWT.
- Scopes: `catalogos:leer`.
- Query: `buscar`, `pagina` (default 1), `tamanoPagina` (default 20, máx. 100), `orden` (`nombre|creadoEn[:asc|:desc]`).
- Respuesta 200:
```json
{
  "ok": true,
  "data": [
    {
      "procedenciaId": 1,
      "usuarioId": null,
      "nombre": "Empresa",
      "esPorDefecto": true,
      "creadoEn": "2025-01-01T00:00:00Z",
      "actualizadoEn": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "tamanoPagina": 20,
      "total": 3
    }
  }
}
```
- Errores: `DATOS_INVALIDOS(422)` en filtros, `PERMISO_DENEGADO(403)` sin scope admin.
- SP: `CALL sp_procedencias_listar(...)`.

### POST /api/v1/catalogos/procedencias
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Plataforma de cursos" }`.
- Reglas: 3–100 caracteres, sin duplicados (global+usuario).
- Respuesta 201: `{ "ok": true, "data": { "procedenciaId": 7, "nombre": "Plataforma de cursos" } }`.
- Errores: `DATOS_INVALIDOS(422)`, `DUPLICADO(409)`.
- SP: `CALL sp_procedencias_crear(pUsuarioId, pNombre)`.

### PUT /api/v1/catalogos/procedencias/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Body: `{ "nombre": "Empresa ABC" }`.
- Reglas: no editar presets globales (sólo admin); mantener unicidad.
- Respuesta 200: `{ "ok": true, "data": { "actualizado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `DUPLICADO(409)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_procedencias_actualizar(pProcedenciaId, pUsuarioId, pNombre)`.

### DELETE /api/v1/catalogos/procedencias/:id
- Auth: JWT.
- Scopes: `catalogos:escribir`.
- Regla: soft delete; bloquear presets globales.
- Respuesta 200: `{ "ok": true, "data": { "eliminado": true } }`.
- Errores: `NO_ENCONTRADO(404)`, `PERMISO_DENEGADO(403)`.
- SP: `CALL sp_procedencias_eliminar(pProcedenciaId, pUsuarioId)`.

## Criterios de aceptación
- Paginación consistente con meta.
- DTOs impiden duplicados/ediciones indebidas.
- Swagger/Postman cubren alta, búsqueda, actualización, duplicados y permisos.

## Riesgos
- Cambios pueden afectar ingresos existentes; definir comportamiento (re-asignar a “Sin procedencia”).
- Presets globales: mantener script de seed en ticket de BD.

## Pruebas sugeridas
- Crear procedencia personalizada, buscar por texto, intentar duplicado, actualizar, eliminar y validar restricciones de presets.
