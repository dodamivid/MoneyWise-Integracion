# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Descripción del Proyecto

MoneyWise es una API backend de Node.js + TypeScript + Express para el Equipo de Integración (endpoints) del Tecnológico de Chihuahua II. Este repositorio implementa una API RESTful siguiendo principios de arquitectura limpia.

**Persistencia**: la mayoría de los módulos usan **MySQL real** (Railway) a través de stored procedures, con un **fallback en memoria** que se activa automáticamente cuando `DB_ENABLED`/`USE_DB` está apagado (así corren los tests). La excepción es el módulo legacy `/api/users` (`user.repository.ts`), que sigue siendo **puro en memoria** sin ninguna conexión a base de datos — ver sección "Capa de Base de Datos" abajo.

## Comandos Esenciales

### Desarrollo
```bash
npm run dev          # Iniciar servidor de desarrollo con recarga automática (ts-node-dev)
npm run build         # Compilar TypeScript a dist/ (tsc)
npm start             # Correr el build compilado (node dist/src/index.js)
```

### Pruebas
```bash
npm test             # Ejecutar todas las pruebas
npm run test:watch   # Ejecutar pruebas en modo observación
npm run test:coverage # Ejecutar pruebas con reporte de cobertura
npm run test:ci      # Ejecutar pruebas en modo CI (silencioso, con cobertura)
npm run test:verbose # Ejecutar pruebas con salida detallada
```

### Base de datos (MySQL en Railway)
```bash
# Importar/recrear el esquema completo (DROP + CREATE DATABASE, destructivo)
DB_HOST=<host> DB_PORT=<port> DB_USER=<user> DB_PASS=<password> node scripts/import-db.js
```
Las credenciales reales viven en Railway → Variables de cada servicio (web y MySQL), nunca en archivos del repo (ver "Problemas Conocidos"). `db/moneywise_schema.sql` es la **única** fuente de verdad del esquema — cualquier otro dump en el repo (`docs/historico/`) es legado y no debe importarse.

### Limitaciones Actuales
- `npm run lint` (ESLint) está **configurado pero roto**: `eslint.config.js` usa `import` de ES modules sin que `package.json` tenga `"type": "module"` — crashea al correr, no da warnings, no corre en absoluto.
- `npm run format` (Prettier) sí corre y sí está configurado, pero no se aplica de forma consistente (encontró ~110 archivos con problemas de estilo la última vez que se corrió).

## Arquitectura

Esta base de código sigue un patrón de **arquitectura en capas** con clara separación de responsabilidades:

```
Rutas → Controladores → Servicios → Repositorios → Modelos
```

### Responsabilidades de las Capas

1. **Rutas** (`src/routes/`)
   - Definen los endpoints HTTP y los mapean a controladores
   - Un archivo de rutas por módulo (`ingresos.routes.ts`, `egresos.routes.ts`, `inversiones.routes.ts`, `metas.routes.ts`, `auth.routes.ts`, `dashboard.routes.ts`, `catalogos.routes.ts`, `catalogosProcedencia.routes.ts`, `tiposEgreso.routes.ts`, `tiposIngreso.routes.ts`, `users.routes.ts`, `version.routes.ts`, `health.ts`)
   - Ver "Mapa de Endpoints" más abajo para la lista completa con sus prefijos

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
   - **La mayoría usan MySQL real** (vía stored procedures) con fallback en memoria: `if (db.enabled && db.pool) { await db.call(...) } else { /* memoria */ }`. Conectados así: `ingresos`, `egresos`, `inversiones`, `metas`, `destinos`, `frecuencias`, `procedencias`, `tipos_egreso`, `tipos_ingreso`.
   - **Excepción real**: `user.repository.ts` (usado por el módulo legacy `/api/users`) es **puro en memoria** (`Map`), sin ninguna conexión a BD, y sin endpoint de creación vía API — ver "Problemas Conocidos".
   - Ver la sección "Capa de Base de Datos" más abajo para la convención de `db.call()`.

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

### Capa de Base de Datos (`src/config/db.ts`)

- `db.enabled`: `true` cuando `DB_ENABLED` o `USE_DB` son `"true"` en el entorno. `db.pool`: pool de `mysql2` (solo existe si `db.enabled`).
- `db.call(spName, params)`: invoca un stored procedure. **Pasa solo el nombre del SP** (ej. `"sp_ingresos_listar"`), nunca con paréntesis/placeholders incluidos — `db.call()` arma `CALL sp_nombre(?, ?, ...)` con un placeholder por cada elemento de `params`. Es defensivo (si algún caller pasa un nombre con `(` ya incluido, lo recorta), pero la convención correcta es nombre limpio.
- **Fechas**: cualquier valor de fecha/hora que se le pase a un SP debe pasar por `toMySQLDateTime()` (`src/utils/mysqlDate.ts`) primero. MySQL rechaza el formato ISO-8601 (`2026-01-01T00:00:00Z`) que manda el cliente; hay que convertirlo a `"YYYY-MM-DD HH:MM:SS"`.
- **SPs `_listar` con paginación + total**: siguen el patrón `(SELECT ... ORDER BY ... LIMIT ? OFFSET ?) UNION ALL SELECT ... COUNT(*) AS totalRegistros ...` — el primer `SELECT` **debe** ir entre paréntesis (MySQL exige esto cuando ese `SELECT` no es el último de un `UNION` y trae `ORDER BY`/`LIMIT`; sin paréntesis es un error de sintaxis real). El código que mapea el resultado debe descartar la última fila (la de `totalRegistros`) del array de datos, no tratarla como un registro real.
- **SPs `_crear` de catálogos por-usuario** (destinos, procedencias, tipos_ingreso, tipos_egreso): `es_por_defecto` debe insertarse siempre como `0` — estos SPs los llama la API con el usuario autenticado real, nunca para sembrar catálogos globales (eso son los `INSERT` sueltos al inicio de `db/moneywise_schema.sql`, con `es_por_defecto = 1` explícito).
- **Manejo de errores de los SPs**: cuando un SP lanza `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CODIGO:mensaje'`, `error.message` en el catch de Node es exactamente ese texto (ej. `"DUPLICADO:La procedencia ya existe"`) y `error.errno` trae el código HTTP del `SIGNAL`. Los services deben usar `error.message?.includes("CODIGO")` para mapear a la clase de error correcta (`ConflictError`, `NotFoundError`, `ForbiddenError`, etc.) — comparar con `===` exacto no funciona.
- **No tragar errores del SP en silencio**: si `db.enabled` está activo, un error real de la base debe propagarse como error real (mapeado por el service/controller). Un patrón peligroso que existió aquí y ya se corrigió: capturar cualquier error no reconocido y devolver un ID/dato falso como si la operación hubiera tenido éxito. El fallback en memoria (con IDs simulados) solo debe usarse cuando `db.enabled` es `false` (tests, dev sin BD).

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

1. **Almacenamiento en Memoria (solo el módulo legacy `/api/users`)**: `user.repository.ts` (usado por las rutas `/api/users/*`, distinto del módulo `auth` que sí usa MySQL) usa un `Map` para almacenamiento, sin conexión a BD. Todos sus datos son volátiles y se pierden al reiniciar. Además:
   - No tiene ningún endpoint de creación (`POST`) — no hay forma de poblarlo vía API; solo existen `GET/PUT/PATCH /api/users/:id`.
   - `userRepository.clear()` se usa en pruebas para resetear el estado.
   - El resto de los repositorios (`ingresos`, `egresos`, `inversiones`, `metas`, catálogos) ya usan MySQL real — ver "Capa de Base de Datos" arriba.

2. **Seguridad de Contraseñas**: las contraseñas **sí se hashean con bcrypt**, tanto en el módulo legacy (`user.service.ts`, usa `BCRYPT_SALT_ROUNDS`) como en el módulo `auth` real (`auth.service.ts`, usa `bcryptConfig.saltRounds` de `src/config/jwt.config.ts`). No se almacenan en texto plano.

3. **Formato de Respuestas — NO es uniforme**: distintos módulos usan formas distintas de éxito/error (`{ok, data}` vs `{status, data}`, `mensaje` vs `message`, `codigo` plano vs `error.codigo`). No asumas una sola forma al integrar un cliente nuevo — revisa la respuesta real del endpoint específico. El middleware de errores (`src/middlewares/error.middleware.ts`) sí agrega `X-Trace-Id` de forma consistente en todas las respuestas.

4. **Sistema de TraceId**: Cada request tiene un `traceId` único (UUID v4) para rastreo:
   - Generado automáticamente por `traceIdMiddleware`
   - Incluido en todas las respuestas de error en `details.traceId`
   - Incluido en el header de respuesta `X-Trace-Id`
   - Usado en logs para correlacionar requests con errores
   - Ver [docs/error-handling.md](docs/error-handling.md) para documentación completa

5. **IDs de usuario NO son UUID**: son enteros autoincrementales (`Map<number, User>` en el módulo legacy; `AUTO_INCREMENT INT` en la tabla `usuarios` real). `crypto.randomUUID()` sí se usa en el proyecto, pero para `traceId`/`correlationId` (middlewares) y para tokens de recuperación de contraseña (`auth.service.ts`) — no para IDs de usuario.

6. **Documentación Completa**: Todos los archivos tienen comentarios JSDoc extensivos. Al leer código desconocido, la documentación proporciona explicaciones detalladas de propósito, parámetros y ejemplos.

## Mapa de Endpoints

Todas las rutas bajo `/api/*` requieren el header `x-api-key` (middleware `requireApiKey`, aplicado globalmente en `app.ts`). Los módulos marcados con auth abajo además requieren `mockAuth` + `requireScope` (headers `x-mw-user`/`x-mw-scopes` en este entorno de integración simulado).

| Prefijo | Módulo | Auth (`mockAuth`/`requireScope`) | Persistencia |
|---|---|---|---|
| `/health` | Health check | No | N/A |
| `/api/users/:id` | Usuarios (legacy) | No | En memoria (`Map`), sin endpoint de creación |
| `/api/v1/auth/*` | Registro, login, recuperación de contraseña | No (es el punto de entrada de auth) | MySQL (`sp_usuarios_registrar`, `sp_auth_*`) |
| `/api/v1/ingresos` | Ingresos | Sí | MySQL |
| `/api/v1/egresos` | Egresos | Sí | MySQL |
| `/api/v1/inversiones` | Inversiones | Sí | MySQL |
| `/api/v1/metas` | Metas de ahorro | **No** (problema conocido, ver abajo) | MySQL |
| `/api/v1/version` | Versión del servicio | No | N/A |
| `/api/v1/dashboard/resumen`, `/balance`, `/metas-vs-ahorro` | Dashboard | Sí | MySQL. `/balance` requiere una fecha de corte registrada en `fechas_corte_ahorro`, y **no existe ningún endpoint para crearla** (problema conocido) |
| `/api/v1/catalogos/destinos` | Catálogo de destinos | Sí | MySQL |
| `/api/v1/catalogos/frecuencias` | Catálogo de frecuencias | Sí (escritura requiere `admin:catalogos`, es global) | MySQL |
| `/api/v1/catalogos/procedencias` | Catálogo de procedencias | Sí | MySQL |
| `/api/v1/catalogos/tipos-egreso` | Catálogo de tipos de egreso | Sí | MySQL |
| `/api/v1/catalogos/tipos-ingreso` | Catálogo de tipos de ingreso | Sí | MySQL |

## Convenciones Acordadas

- **Ramas**: `Integration/MWI-<issue>/<slug-descriptivo>` por cada issue trabajado.
- **Flujo por issue**: rama → commit(s) → PR con descripción detallada → squash merge a `main` → verificar en vivo contra Railway después del deploy.
- **Nunca commitear credenciales reales** (`API_KEY`, `JWT_SECRET`, `DB_PASSWORD`, tokens JWT de ejemplo). Usar placeholders en docs/ejemplos y apuntar a "Railway → Variables". Si algo real se llega a commitear, hay que **rotarlo**, no solo borrarlo del archivo (el repo es público).
- **Atribución en commits/PRs**: los commits y PRs generados con ayuda de Claude Code cierran con `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` (commits) y `🤖 Generated with [Claude Code](https://claude.com/claude-code)` (descripción de PR).
- Ver la sección "Capa de Base de Datos" arriba para las convenciones de `db.call()`, fechas, y SPs `_listar`/`_crear`.

## Problemas Conocidos (vigentes)

- **`/api/v1/metas` sin auth**: `metas.routes.ts` no aplica `mockAuth`/`requireScope` en ninguna ruta. `POST`/`GET` confían en el `usuarioId` que manda el propio cliente; `PATCH` no valida dueño en absoluto (`DELETE` sí). Issue relacionado: #89 (en GitHub aparece cerrado, pero el fix no está en el código — verificar antes de asumir que está resuelto).
- **`/api/v1/dashboard/balance` es una función muerta**: depende de `fechas_corte_ahorro`, pero no existe ningún endpoint (`routes`/`controller`/`service`/`repository`) para crear/listar fechas de corte, aunque los stored procedures (`sp_fechasCorte_*`) sí existen en el esquema. Spec original en `tickets/API_fechas_corte.md`. Issue: #91.
- **`/api/users/*` (legacy) sigue en memoria**: sin conexión a BD y sin endpoint de creación — solo se puede consultar/editar un usuario que ya exista en el `Map`, y no hay forma de meter uno ahí vía API. Es un módulo separado de `auth` (que sí es real).
- **`npm run lint` crasheado**: ver "Limitaciones Actuales" arriba.
- **Formato de respuesta no uniforme entre módulos**: ver nota en "Notas Importantes".
- **Corrimiento de zona horaria observado (~6h) en algunas fechas leídas de vuelta** desde MySQL — no confirmado a fondo, posible tema de timezone de sesión MySQL vs. UTC.

## Contexto del Roadmap

Este proyecto sigue un roadmap de 10 tickets (ver [docs/roadmap.md](docs/roadmap.md)) para construir:
- Servidor Express TypeScript con health checks ✓
- Endpoints de API de usuarios (POST, GET) ✓
- Pruebas con Jest/Supertest ✓
- Workflow de CI ✓
- Manejo centralizado de errores con traceId ✓
- Middleware de API key ✓ (`requireApiKey`, aplicado a todo `/api`)
- Logging (pino) ✓ (`src/utils/logger.ts`, `logger.middleware.ts`)
- Dockerfile ✓ (existe en la raíz del repo)
- Persistencia real en MySQL para la mayoría de los módulos ✓ (ver "Capa de Base de Datos")
- Pendiente: exponer `fechas_corte_ahorro` por API, auth real en `/metas`, arreglar `npm run lint`

El equipo usa GitHub Projects con etiquetas: `integration`, `backend`, `ts`, `express`, `backlog`
