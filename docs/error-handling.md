# Sistema de Manejo de Errores - MoneyWise API

Este documento describe el sistema centralizado de manejo de errores implementado en la API de MoneyWise, incluyendo el sistema de rastreo con `traceId`.

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Sistema de TraceId](#sistema-de-traceid)
4. [Tipos de Errores](#tipos-de-errores)
5. [Formato de Respuestas](#formato-de-respuestas)
6. [Uso en Código](#uso-en-código)
7. [Ejemplos](#ejemplos)
8. [Debugging](#debugging)

## Descripción General

El sistema de manejo de errores de MoneyWise proporciona:

- ✅ **Manejo centralizado** de todos los errores de la aplicación
- ✅ **Rastreo de requests** mediante `traceId` único
- ✅ **Formato consistente** de respuestas de error
- ✅ **Diferenciación** entre desarrollo y producción
- ✅ **Logging estructurado** con información de contexto
- ✅ **Tipos de error personalizados** para diferentes escenarios

## Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. traceIdMiddleware                              │
│     └─> Genera UUID único por request              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  2. Rutas y Controladores                          │
│     └─> Lanzan errores o llaman next(error)        │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  3. notFoundHandler                                │
│     └─> Captura rutas no definidas (404)           │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  4. errorHandler                                   │
│     ├─> Identifica tipo de error                   │
│     ├─> Formatea respuesta con traceId             │
│     ├─> Registra en logs                           │
│     └─> Envía respuesta al cliente                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Orden de Middlewares en app.ts

```typescript
// 1. TraceId - PRIMERO (antes de todo)
app.use(traceIdMiddleware);

// 2. Middlewares generales
app.use(express.json());

// 3. Rutas
app.use('/health', healthRouter);
app.use('/api/users', usersRouter);

// 4. NotFound - después de todas las rutas
app.use(notFoundHandler);

// 5. ErrorHandler - AL FINAL
app.use(errorHandler);
```

## Sistema de TraceId

### ¿Qué es el TraceId?

El `traceId` es un identificador único (UUID v4) generado para cada request HTTP que permite:

- **Rastrear** un request a través de toda la aplicación
- **Correlacionar** logs, errores y respuestas
- **Debugging** más fácil en producción
- **Monitoreo** y análisis de errores

### Implementación

#### 1. Generación Automática

El middleware `traceIdMiddleware` genera automáticamente un `traceId` para cada request:

```typescript
// Se ejecuta automáticamente para cada request
req.traceId = randomUUID(); // ej: "550e8400-e29b-41d4-a716-446655440000"
```

#### 2. Header de Respuesta

El `traceId` también se incluye en el header de respuesta:

```http
X-Trace-Id: 550e8400-e29b-41d4-a716-446655440000
```

#### 3. Disponibilidad

El `traceId` está disponible en cualquier parte del flujo del request:

```typescript
// En controladores
async getById(req: Request, res: Response, next: NextFunction) {
  console.log(`Processing request ${req.traceId}`);
  // ...
}

// En servicios (si pasas req)
async findById(id: string, req: Request) {
  console.log(`[${req.traceId}] Buscando usuario ${id}`);
  // ...
}
```

## Tipos de Errores

### Errores Personalizados (AppError)

Todos los errores personalizados heredan de `AppError` y tienen un `statusCode` asociado:

#### NotFoundError (404)

```typescript
throw new NotFoundError('Usuario', userId);
// Mensaje: "Usuario con id {userId} no encontrado"
```

#### ValidationError (400)

```typescript
throw new ValidationError('El formato del email es inválido');
// Mensaje personalizado de validación
```

#### BadRequestError (400)

```typescript
throw new BadRequestError('El email ya está en uso');
// Para errores generales de request
```

#### InternalServerError (500)

```typescript
throw new InternalServerError('Falló la conexión a la base de datos');
// Para errores internos del servidor
```

### Errores de Zod

Los errores de validación de Zod se capturan automáticamente:

```typescript
// Se convierte automáticamente a formato consistente
UserSchema.parse(data); // Si falla, se maneja en errorHandler
```

### Errores Inesperados

Cualquier error no manejado se convierte en error 500:

```typescript
throw new Error('Algo inesperado ocurrió');
// Se convierte a: "Ocurrió un error inesperado" (producción)
// O muestra el mensaje real (desarrollo)
```

## Formato de Respuestas

### Estructura de Error

Todas las respuestas de error siguen este formato:

```typescript
interface ErrorResponseDTO {
  status: "error";
  message: string;
  statusCode?: number;
  traceId?: string;
  details?: Record<string, any>;
}
```

### Ejemplos de Respuestas

#### Error 404 - Not Found

```json
{
  "status": "error",
  "message": "Usuario con id 123 no encontrado",
  "statusCode": 404,
  "details": {
    "traceId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

#### Error 400 - Validation Error

```json
{
  "status": "error",
  "message": "Validación fallida",
  "statusCode": 400,
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Formato de correo electrónico inválido"
      }
    ],
    "traceId": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

#### Error 500 - Internal Server Error

**Producción:**
```json
{
  "status": "error",
  "message": "Ocurrió un error inesperado",
  "statusCode": 500,
  "details": {
    "traceId": "770e8400-e29b-41d4-a716-446655440002"
  }
}
```

**Desarrollo:**
```json
{
  "status": "error",
  "message": "Cannot read property 'name' of undefined",
  "statusCode": 500,
  "details": {
    "name": "TypeError",
    "stack": "TypeError: Cannot read property...",
    "traceId": "770e8400-e29b-41d4-a716-446655440002"
  }
}
```

## Uso en Código

### En Controladores

```typescript
import { userService } from '../services/user.service';

export class UserController {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // El servicio puede lanzar NotFoundError, ValidationError, etc.
      const user = await userService.findById(id);

      res.status(200).json({
        status: "success",
        data: user
      });
    } catch (error) {
      // Pasar error al middleware de errores
      next(error);
    }
  }
}
```

### En Servicios

```typescript
import { NotFoundError, ValidationError } from '../utils/errors';

export class UserService {
  async findById(id: string): Promise<User> {
    // Validar formato
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Formato de ID inválido: ${id}`);
    }

    // Buscar usuario
    const user = await userRepository.findById(id);

    // Lanzar error si no existe
    if (!user) {
      throw new NotFoundError('Usuario', id);
    }

    return user;
  }
}
```

### Creando Errores Personalizados

```typescript
import { AppError } from '../utils/errors';

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// Uso
throw new ConflictError('El recurso ya existe');
```

## Ejemplos

### Ejemplo 1: Request Exitoso con TraceId

```http
GET /api/users/550e8400-e29b-41d4-a716-446655440000

Response Headers:
X-Trace-Id: 123e4567-e89b-12d3-a456-426614174000

Response Body (200):
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Ejemplo 2: Error de Validación

```http
POST /api/users
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "123"
}

Response Headers:
X-Trace-Id: 234e5678-e89b-12d3-a456-426614174001

Response Body (400):
{
  "status": "error",
  "message": "Validación fallida",
  "statusCode": 400,
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Formato de correo electrónico inválido"
      },
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ],
    "traceId": "234e5678-e89b-12d3-a456-426614174001"
  }
}
```

### Ejemplo 3: Usuario No Encontrado

```http
GET /api/users/999-invalid-id

Response Headers:
X-Trace-Id: 345e6789-e89b-12d3-a456-426614174002

Response Body (404):
{
  "status": "error",
  "message": "Usuario con id 999-invalid-id no encontrado",
  "statusCode": 404,
  "details": {
    "traceId": "345e6789-e89b-12d3-a456-426614174002"
  }
}
```

### Ejemplo 4: Ruta No Encontrada

```http
GET /api/nonexistent

Response Headers:
X-Trace-Id: 456e7890-e89b-12d3-a456-426614174003

Response Body (404):
{
  "status": "error",
  "message": "Ruta no encontrada: GET /api/nonexistent",
  "statusCode": 404,
  "details": {
    "traceId": "456e7890-e89b-12d3-a456-426614174003"
  }
}
```

## Debugging

### Rastreo de Errores con TraceId

Cuando un cliente reporta un error, puede proporcionar el `traceId` para rastrear exactamente qué ocurrió:

1. **Cliente recibe error** con `traceId`
2. **Cliente reporta** el `traceId` al soporte
3. **Equipo de soporte busca** en logs por `traceId`
4. **Se encuentra** toda la información del request

### Logs del Sistema

Los logs incluyen el `traceId` automáticamente:

```javascript
// Console log del errorHandler
{
  traceId: "550e8400-e29b-41d4-a716-446655440000",
  name: "NotFoundError",
  message: "Usuario con id 123 no encontrado",
  path: "/api/users/123",
  method: "GET"
}
```

### Buscar en Logs

```bash
# Buscar por traceId específico
grep "550e8400-e29b-41d4-a716-446655440000" logs/app.log

# Ver todos los errores 404
grep "NotFoundError" logs/app.log

# Filtrar por ruta específica
grep "/api/users" logs/app.log | grep "error"
```

## Mejores Prácticas

### ✅ DO

- **Siempre** usar `next(error)` en controladores para pasar errores
- **Siempre** lanzar errores específicos (`NotFoundError`, `ValidationError`, etc.)
- **Siempre** incluir mensajes descriptivos en los errores
- **Usar** el `traceId` en logs personalizados para correlación
- **Validar** entrada de usuario antes de procesarla

### ❌ DON'T

- **No** enviar respuestas de error manualmente en controladores
- **No** usar `res.status(500).json(...)` directamente
- **No** exponer stack traces o información sensible en producción
- **No** ignorar errores con `try/catch` vacíos
- **No** usar errores genéricos cuando existen específicos

## Resumen

El sistema de manejo de errores de MoneyWise proporciona:

1. **TraceId único** por request para rastreo completo
2. **Formato consistente** de respuestas de error
3. **Tipos de error específicos** para diferentes escenarios
4. **Logging estructurado** con contexto completo
5. **Diferenciación** entre desarrollo y producción
6. **Facilidad de debugging** con correlación de logs

Para más información sobre componentes específicos, consulta:
- [error.middleware.ts](../src/middlewares/error.middleware.ts) - Implementación de middlewares
- [errors.ts](../src/utils/errors.ts) - Clases de error personalizadas
- [user.dto.ts](../src/dtos/user.dto.ts) - Formato de respuestas
