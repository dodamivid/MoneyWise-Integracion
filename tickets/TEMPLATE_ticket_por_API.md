# [API] <Nombre del Recurso> — <Acciones>
**Fecha:** 2025-10-31

## Objetivo
Exponer y documentar los endpoints de **<Nombre del Recurso>** en **MoneyWise API v1** (Node.js + TypeScript + Express), capa delgada que llama SPs MySQL. Respuestas envueltas, JWT, CORS, DTOs en español y contratos estables.

## Alcance (endpoints)
- `GET /api/v1/<ruta-base>` …
- `POST /api/v1/<ruta-base>` …
- `GET /api/v1/<ruta-base>/{id}` …
- `PATCH /api/v1/<ruta-base>/{id}` …
- `DELETE /api/v1/<ruta-base>/{id}` …

## Arquitectura (archivos y carpetas a crear/editar)
```
src/
  routes/<recurso>.routes.ts
  controllers/<recurso>.controller.ts
  services/<recurso>.service.ts
  repositories/<recurso>.repository.ts
  dtos/<recurso>.dto.ts
  middlewares/{auth.ts,scopes.ts,validate.ts,errorHandler.ts}
  config/{db.ts,env.ts}
```

## Contrato por endpoint (DTOs EN ESPAÑOL + SP)
Para cada endpoint especificar:
- **Método + Ruta**
- **Auth + Scopes**
- **Query/Body (entrada)** con tipos/validación
- **Respuesta 200/201 (salida)** con ejemplo JSON
- **Errores** (`codigo` + HTTP)
- **SP**: `CALL sp_*` **firma** y **SELECT** con alias en español
- **Notas de rendimiento e índices** / **casos borde**

## Criterios de Aceptación
- Respuestas éxito: `{ "ok": true, "data": {...}, "meta": { "paginacion": { "pagina":1,"tamanoPagina":20,"total":0 } } }`
- Respuestas error: `{ "ok": false, "error": { "codigo":"STRING_CODE", "mensaje":"Descripción" } }`
- Fechas ISO-8601 UTC; montos numéricos; paginación `?pagina&tamanoPagina&orden`.
- Swagger (OpenAPI) actualizado.

## Pruebas (Postman)
- Casos de éxito, errores de validación, bordes y permisos.

## Riesgos
- SPs no listos, FKs inválidas, auth/scopes.

## DoD
- Endpoints operando, validaciones activas, errores uniformes, Swagger y colección Postman al día.
