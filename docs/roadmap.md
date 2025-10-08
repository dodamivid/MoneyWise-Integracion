# Roadmap – Equipo de Integración (Endpoints)

Este roadmap cubre los primeros 10 tickets para levantar el backend en TypeScript + Node.js con Express.

## Objetivo del sprint 0
- Tener un servidor Express en TypeScript con endpoints base de usuarios, autenticación simple, logging y pruebas, todo integrado con CI.

## Hitos y tickets

1. Infraestructura del servidor (Issue: "Set up Express TS server skeleton")
   - Crear proyecto Node + TS, tsconfig, nodemon/ts-node para dev.
   - Endpoint GET /health -> 200 { status: "ok" }.

2. Contrato de API de Usuarios (Issue: "Define API contract: Users service")
   - Definir OpenAPI para POST /api/users y GET /api/users/{id}.
   - Esquemas de request/response con validaciones.

3. POST /api/users (memoria) (Issue: "Implement POST /api/users (in-memory)")
   - Validar payload, retornar 201 y usuario creado con id.

4. GET /api/users/{id} (Issue: "Implement GET /api/users/:id")
   - Manejar 404 con formato de error estándar.

5. Middleware de API key (Issue: "Auth middleware (API key placeholder)")
   - Revisar header `x-api-key`, rechazar cuando falta.

6. Logging + correlación (Issue: "Logging and request correlation")
   - pino, `x-correlation-id` en responses y logs.

7. Manejador centralizado de errores (Issue: "Error handling and response format")
   - Responder `{ error, message, traceId }`.

8. Tests de endpoints (Issue: "Unit tests for users endpoints")
   - Jest + supertest para POST/GET, cobertura mínima del 70%.

9. Contenedor (Issue: "Dockerfile and container run")
   - Dockerfile multi-stage, doc de ejecución.

10. CI (Issue: "CI workflow: typecheck, lint, test")
    - GitHub Actions en push/PR a main y feature/*.

## Riesgos y dependencias
- Definiciones del dominio de usuarios (propiedades mínimas).
- API key temporal; autenticación real puede cambiar luego.

## Hecho/Done
- Todos los tickets del 1 al 10 cerrados y API corriendo localmente y en contenedor.
