# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Descripción del Proyecto

MoneyWise es una API backend de Node.js + TypeScript + Express para el Equipo de Integración (endpoints) del Tecnológico de Chihuahua II. Este repositorio implementa una API RESTful con almacenamiento de datos en memoria siguiendo principios de arquitectura limpia.

## Comandos Esenciales

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo con recarga automática (ts-node-dev)
```

### Pruebas
```bash
npm test             # Ejecutar todas las pruebas
npm run test:watch   # Ejecutar pruebas en modo observación
npm run test:coverage # Ejecutar pruebas con reporte de cobertura
npm run test:ci      # Ejecutar pruebas en modo CI (silencioso, con cobertura)
npm run test:verbose # Ejecutar pruebas con salida detallada
```

### Limitaciones Actuales
- No hay comando de build todavía (no hay compilación de TypeScript a dist/)
- No hay linting configurado
- No hay herramientas de formateo (Prettier/ESLint) configuradas

## Arquitectura

Esta base de código sigue un patrón de **arquitectura en capas** con clara separación de responsabilidades:

```
Rutas → Controladores → Servicios → Repositorios → Modelos
```

### Responsabilidades de las Capas

1. **Rutas** (`src/routes/`)
   - Definen los endpoints HTTP y los mapean a controladores
   - Todas las rutas de usuarios están montadas bajo `/api/users`
   - Ubicadas en: `users.routes.ts`, `health.ts`

2. **Controladores** (`src/controllers/`)
   - Manejan la lógica de petición/respuesta HTTP
   - Extraen parámetros y datos del body
   - Delegan la lógica de negocio a los servicios
   - Formatean respuestas usando DTOs
   - Pasan errores al middleware de errores mediante `next(error)`

3. **Servicios** (`src/services/`)
   - Contienen la lógica de negocio
   - Validan entrada usando esquemas Zod
   - Lanzan errores personalizados (NotFoundError, ValidationError, BadRequestError)
   - Coordinan entre múltiples repositorios si es necesario

4. **Repositorios** (`src/repositories/`)
   - Capa de abstracción de acceso a datos
   - Actualmente usan **almacenamiento en memoria** (basado en Map)
   - **IMPORTANTE**: Todos los datos se pierden al reiniciar el servidor
   - En producción, estos serán reemplazados con implementaciones de base de datos

5. **Modelos** (`src/models/`)
   - Definen estructuras de datos con esquemas Zod
   - Exportan tipos TypeScript inferidos de los esquemas
   - Contienen reglas de validación embebidas en los esquemas

6. **DTOs** (`src/dtos/`)
   - Definen formatos de respuesta de la API
   - Eliminan datos sensibles (contraseñas) de las respuestas
   - Aseguran estructura de respuesta consistente en todos los endpoints

7. **Manejo de Errores** (`src/utils/errors.ts`)
   - Clases de error personalizadas: `NotFoundError`, `ValidationError`, `BadRequestError`, `InternalServerError`
   - Todas heredan de `AppError` con propiedad `statusCode`
   - Usar el type guard `isAppError()` para verificar tipos de error
   - Middleware global de errores en `app.ts` captura y formatea todos los errores

### Patrones Críticos

1. **Patrón Singleton**: Los servicios, repositorios y controladores se exportan como instancias singleton (ej. `export const userService = new UserService()`)

2. **Flujo de Validación**:
   - Los esquemas Zod en los modelos definen las reglas de validación
   - Los servicios realizan validación antes de las operaciones del repositorio
   - Los errores de validación se lanzan como `ValidationError` con mensajes útiles

3. **Propagación de Errores**:
   - Los controladores capturan errores y los pasan a `next(error)`
   - El middleware de errores en `app.ts` maneja el formateo y códigos de estado
   - Los errores personalizados se mapean automáticamente a los códigos HTTP correctos

4. **Alias de Rutas**:
   - `@/*` mapea a `src/*`
   - `@tests/*` mapea a `__tests__/*`
   - Configurado en `tsconfig.json`

## Framework de Pruebas

- **Test Runner**: Jest con preset ts-jest
- **Pruebas HTTP**: Supertest para pruebas de endpoints de la API
- **Ubicación de Pruebas**: `__tests__/tests/integration/`
- **Meta de Cobertura**: Mínimo 70% (según el roadmap)
- **Timeout de Pruebas**: 10 segundos

### Estructura de Pruebas
Las pruebas son pruebas de integración que:
1. Importan la app Express directamente
2. Usan supertest para hacer peticiones HTTP
3. Verifican códigos de estado y formatos de respuesta
4. Verifican integridad de datos

## Notas Importantes

1. **Almacenamiento en Memoria**: El `UserRepository` usa un Map para almacenamiento. Todos los datos son volátiles y se reinician al reiniciar. Al agregar nuevas características, ten en cuenta que:
   - `userRepository.clear()` se usa en pruebas para resetear el estado
   - No existe persistencia de datos actualmente

2. **Seguridad de Contraseñas**: Las contraseñas actualmente se almacenan en texto plano. El código tiene comentarios TODO indicando que el hashing de contraseñas debería implementarse en producción (ver [user.service.ts:244-246](src/services/user.service.ts#L244-L246))

3. **Formato de Respuestas**: Todas las respuestas de la API siguen un formato consistente:
   - Éxito: `{ status: "success", data: {...}, message?: string }`
   - Error: `{ status: "error", message: string, statusCode: number, details: { traceId, ... } }`

4. **Sistema de TraceId**: Cada request tiene un `traceId` único (UUID v4) para rastreo:
   - Generado automáticamente por `traceIdMiddleware`
   - Incluido en todas las respuestas de error en `details.traceId`
   - Incluido en el header de respuesta `X-Trace-Id`
   - Usado en logs para correlacionar requests con errores
   - Ver [docs/error-handling.md](docs/error-handling.md) para documentación completa

5. **Uso de UUID**: Todos los IDs de usuario son UUIDs (v4) generados usando `crypto.randomUUID()` de Node

6. **Documentación Completa**: Todos los archivos tienen comentarios JSDoc extensivos. Al leer código desconocido, la documentación proporciona explicaciones detalladas de propósito, parámetros y ejemplos.

## Contexto del Roadmap

Este proyecto sigue un roadmap de 10 tickets (ver [docs/roadmap.md](docs/roadmap.md)) para construir:
- Servidor Express TypeScript con health checks ✓
- Endpoints de API de usuarios (POST, GET) ✓
- Pruebas con Jest/Supertest ✓
- Workflow de CI ✓
- Manejo centralizado de errores con traceId ✓
- Pendiente: Middleware de API key, logging avanzado, Dockerfile

El equipo usa GitHub Projects con etiquetas: `integration`, `backend`, `ts`, `express`, `backlog`
