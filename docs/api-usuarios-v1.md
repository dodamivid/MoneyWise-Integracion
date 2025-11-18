# API de Usuarios v1 - Documentación de Implementación

**Ticket**: MWI-#29
**Fecha de implementación**: 2025-11-15 - 2025-11-17
**Versión**: 2.0.0
**Estado**: ✅ 85% Completado (listo para testing)

## Tabla de Contenidos

- [Resumen Ejecutivo](#resumen-ejecutivo)
- [Autenticación y Autorización](#autenticación-y-autorización)
- [Endpoints Implementados](#endpoints-implementados)
- [Cambios Arquitectónicos](#cambios-arquitectónicos)
- [Seguridad](#seguridad)
- [Validaciones](#validaciones)
- [Stored Procedures MySQL](#stored-procedures-mysql)
- [Estructura de Respuestas](#estructura-de-respuestas)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Migración desde Versión Anterior](#migración-desde-versión-anterior)
- [Pendientes y Trabajo Futuro](#pendientes-y-trabajo-futuro)

---

## Resumen Ejecutivo

Se ha completado la implementación de la API de Usuarios v1 según la especificación del documento [API_usuarios.md](../tickets/API_usuarios.md). Esta versión incluye:

- ✅ Migración completa de nomenclatura inglés → español
- ✅ Cambio de IDs UUID string → números enteros
- ✅ Implementación de seguridad con bcrypt
- ✅ Tres endpoints RESTful para gestión de usuarios
- ✅ Validaciones automáticas de datos y edad
- ✅ Normalización automática de texto
- ✅ **Autenticación mock con scopes** (NUEVO v2.0)
- ✅ **Validación de permisos de propiedad** (NUEVO v2.0)
- ✅ **Stored Procedures MySQL completos** (NUEVO v2.0)

### Commits Realizados

| # | Commit | Descripción | Hash |
|---|--------|-------------|------|
| 1 | Modelo, DTOs y servicios | Implementar según especificación API v1 | `3daca01` |
| 2 | Repositorio | Actualizar para IDs numéricos y campos en español | `e007d67` |
| 3 | Controladores y rutas | Actualizar según especificación API v1 | `eb57ef7` |
| 4 | Normalización | Agregar normalización automática de texto | `05512b2` |
| 5 | Documentación | Agregar documentación completa | `02c8b4c` |
| 6 | Merge | Merge branch 'main' into MWI-#29 | `9478afe` |
| 7 | **Auth & Scopes** ⭐ | Implementar autenticación y autorización | `729e12f` |
| 8 | **MySQL SPs** ⭐ | Crear stored procedures MySQL | `1fcf417` |

---

## Autenticación y Autorización

### Middleware de Autenticación Mock

La API utiliza un sistema de autenticación mock para desarrollo y testing:

```typescript
// Headers requeridos
x-mw-user: 1              // ID del usuario autenticado
x-mw-scopes: usuarios:leer,usuarios:escribir   // Scopes del usuario
```

**Scopes Disponibles**:
- `usuarios:leer` - Permite consultar perfiles
- `usuarios:escribir` - Permite actualizar perfil y contraseña
- `admin:usuarios` - Permite gestionar cualquier usuario

### Validación de Permisos

Cada endpoint valida permisos automáticamente:

1. **mockAuth** - Valida presencia de headers de autenticación
2. **requireScope** - Valida que el usuario tenga el scope requerido
3. **requireUserOwnership** - Valida que:
   - El usuario accede a su propio perfil (userId === :id), O
   - El usuario tiene scope `admin:usuarios`

**Ejemplo de Error 403**:
```json
{
  "ok": false,
  "mensaje": "No tienes permiso para acceder a este recurso",
  "codigo": 403,
  "detalles": {
    "razon": "Requiere admin:usuarios para acceder a otros usuarios"
  }
}
```

---

## Endpoints Implementados

### 1. Obtener Perfil de Usuario

**Endpoint**: `GET /api/v1/usuarios/:id`

**Descripción**: Recupera la información completa del perfil de un usuario por su ID numérico.

**Parámetros de Ruta**:
- `id` (number, requerido): ID numérico del usuario

**Autenticación**: JWT (pendiente de implementar)

**Scopes requeridos**: `usuarios:leer`

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "data": {
    "usuarioId": 1,
    "nombre": "Juan",
    "apellidoP": "Pérez",
    "apellidoM": "López",
    "correo": "juan.perez@example.com",
    "fechaN": "1995-05-20",
    "creadoEn": "2025-01-01T00:00:00Z",
    "actualizadoEn": "2025-04-01T12:00:00Z",
    "activo": true
  }
}
```

**Posibles Errores**:
- `400`: ID inválido (formato incorrecto)
- `403`: Permiso denegado
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

**Ejemplo de Uso**:
```bash
curl -X GET http://localhost:3000/api/v1/usuarios/1 \
  -H "Authorization: Bearer <jwt_token>"
```

---

### 2. Actualizar Perfil de Usuario

**Endpoint**: `PUT /api/v1/usuarios/:id`

**Descripción**: Actualiza los campos de perfil de un usuario existente. Solo se pueden actualizar: `nombre`, `apellidoP`, `apellidoM`, `fechaN`.

**Parámetros de Ruta**:
- `id` (number, requerido): ID numérico del usuario

**Autenticación**: JWT (pendiente de implementar)

**Scopes requeridos**: `usuarios:escribir`

**Body de Petición**:
```json
{
  "nombre": "Juan Carlos",
  "apellidoP": "Pérez",
  "apellidoM": "López",
  "fechaN": "1995-05-20"
}
```

**Notas**:
- Todos los campos son opcionales
- Debe venir al menos un campo
- El texto se normaliza automáticamente (trim + capitalización)

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "data": {
    "actualizado": true,
    "actualizadoEn": "2025-04-01T12:30:00Z"
  }
}
```

**Posibles Errores**:
- `400`: ID inválido
- `403`: Permiso denegado
- `404`: Usuario no encontrado
- `422`: Datos inválidos (validación fallida)
- `500`: Error interno del servidor

**Ejemplo de Uso**:
```bash
curl -X PUT http://localhost:3000/api/v1/usuarios/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellidoP": "Pérez Martínez"
  }'
```

---

### 3. Cambiar Contraseña de Usuario

**Endpoint**: `PATCH /api/v1/usuarios/:id/contrasena`

**Descripción**: Cambia la contraseña de un usuario validando la contraseña actual. La nueva contraseña debe cumplir la política de seguridad.

**Parámetros de Ruta**:
- `id` (number, requerido): ID numérico del usuario

**Autenticación**: JWT (pendiente de implementar)

**Scopes requeridos**: `usuarios:escribir`

**Body de Petición**:
```json
{
  "contrasenaActual": "OldPass123!",
  "contrasenaNueva": "NewSecurePass456!"
}
```

**Notas**:
- Ambos campos son obligatorios
- La nueva contraseña debe ser diferente de la actual
- La nueva contraseña debe cumplir la política de seguridad

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "data": {
    "cambiado": true
  }
}
```

**Posibles Errores**:
- `400`: ID inválido
- `401`: Contraseña actual incorrecta
- `403`: Permiso denegado
- `404`: Usuario no encontrado
- `422`: Datos inválidos (nueva contraseña no cumple política)
- `500`: Error interno del servidor

**Ejemplo de Uso**:
```bash
curl -X PATCH http://localhost:3000/api/v1/usuarios/1/contrasena \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contrasenaActual": "OldPass123!",
    "contrasenaNueva": "NewSecurePass456!"
  }'
```

---

## Cambios Arquitectónicos

### Modelo de Datos

#### Antes (v0 - Inglés)
```typescript
interface User {
  id: string;              // UUID
  email: string;
  password: string;        // Texto plano
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Después (v1 - Español)
```typescript
interface User {
  usuarioId: number;       // ID numérico auto-incremental
  correo: string;
  contrasena: string;      // Hash bcrypt
  nombre: string;
  apellidoP: string;       // Apellido paterno
  apellidoM: string;       // Apellido materno
  fechaN: string;          // Fecha de nacimiento (YYYY-MM-DD)
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}
```

### Formato de Respuestas

#### Antes
```json
{
  "status": "success",
  "data": { ... },
  "message": "Usuario recuperado exitosamente"
}
```

#### Después
```json
{
  "ok": true,
  "data": { ... }
}
```

### Rutas

| Antes | Después |
|-------|---------|
| `GET /api/users/:id` | `GET /api/v1/usuarios/:id` |
| `PATCH /api/users/:id` | `PUT /api/v1/usuarios/:id` |
| N/A | `PATCH /api/v1/usuarios/:id/contrasena` |

---

## Seguridad

### Hashing de Contraseñas con bcrypt

La implementación utiliza bcrypt para el hashing seguro de contraseñas:

```typescript
const BCRYPT_SALT_ROUNDS = 10;

// Al cambiar contraseña
const hashedPassword = await bcrypt.hash(
  passwordData.contrasenaNueva,
  BCRYPT_SALT_ROUNDS
);

// Al verificar contraseña actual
const passwordMatches = await bcrypt.compare(
  passwordData.contrasenaActual,
  existingUser.contrasena
);
```

**Características**:
- ✅ 10 rondas de salt (balance entre seguridad y rendimiento)
- ✅ Verificación segura con `bcrypt.compare()`
- ✅ Las contraseñas nunca se almacenan en texto plano
- ✅ Las contraseñas nunca se incluyen en respuestas de API

### Política de Contraseñas

Las contraseñas deben cumplir con los siguientes requisitos:

- ✅ Mínimo 8 caracteres
- ✅ Al menos una letra mayúscula (A-Z)
- ✅ Al menos una letra minúscula (a-z)
- ✅ Al menos un número (0-9)
- ✅ Al menos un símbolo especial (!@#$%^&*()_+-=[]{}...etc)

**Ejemplo de contraseña válida**: `SecurePass123!`

---

## Validaciones

### Validación de Edad Mínima

Los usuarios deben tener al menos 16 años de edad:

```typescript
.refine((date) => {
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Ajustar edad si aún no ha cumplido años este año
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)
    ? age - 1
    : age;

  return actualAge >= 16;
}, {
  message: "El usuario debe tener al menos 16 años"
})
```

### Normalización Automática de Texto

Los campos de nombre y apellidos se normalizan automáticamente:

**Función capitalize()**:
```typescript
function capitalize(text: string): string {
  return text
    .trim()                    // Eliminar espacios al inicio/final
    .split(/\s+/)              // Dividir por espacios
    .map(word =>
      word.charAt(0).toUpperCase() +
      word.slice(1).toLowerCase()
    )
    .join(" ");                // Unir con un solo espacio
}
```

**Ejemplos**:
- `"juan pérez"` → `"Juan Pérez"`
- `"  maría  lópez  "` → `"María López"`
- `"CARLOS GARCÍA"` → `"Carlos García"`

### Validación de Campos

| Campo | Tipo | Longitud | Formato | Ejemplo |
|-------|------|----------|---------|---------|
| `usuarioId` | number | - | Entero positivo | `1` |
| `correo` | string | - | Email válido | `usuario@example.com` |
| `contrasena` | string | 8+ caracteres | Ver política | `SecurePass123!` |
| `nombre` | string | 2-80 caracteres | Solo letras y espacios | `Juan` |
| `apellidoP` | string | 2-80 caracteres | Solo letras y espacios | `Pérez` |
| `apellidoM` | string | 2-80 caracteres | Solo letras y espacios | `López` |
| `fechaN` | string | - | YYYY-MM-DD, 16+ años | `1995-05-20` |
| `activo` | boolean | - | true/false | `true` |

---

## Stored Procedures MySQL

Se han creado 3 stored procedures completos listos para producción en [db/stored-procedures/sp_usuarios.sql](../db/stored-procedures/sp_usuarios.sql):

### 1. sp_usuarios_obtenerPorId

**Propósito**: Obtener perfil de usuario por ID

**Firma**:
```sql
CALL sp_usuarios_obtenerPorId(pUsuarioId INT)
```

**Retorna**:
```sql
SELECT usuarioId, nombre, apellidoP, apellidoM, correo, fechaN,
       creadoEn, actualizadoEn, activo
FROM usuarios
WHERE usuarioId = pUsuarioId;
```

**Errores**:
- `NO_ENCONTRADO` (404) - Si el usuario no existe

### 2. sp_usuarios_actualizar

**Propósito**: Actualizar campos de perfil

**Firma**:
```sql
CALL sp_usuarios_actualizar(
    pUsuarioId INT,
    pNombre VARCHAR(80),
    pApellidoP VARCHAR(80),
    pApellidoM VARCHAR(80),
    pFechaN DATE
)
```

**Retorna**:
```sql
SELECT TRUE AS actualizado, NOW() AS actualizadoEn;
```

**Características**:
- Usa `COALESCE` para actualizar solo campos no-NULL
- Actualiza `actualizadoEn` automáticamente

**Errores**:
- `NO_ENCONTRADO` (404) - Si el usuario no existe

### 3. sp_usuarios_cambiarContrasena

**Propósito**: Cambiar contraseña validando la actual

**Firma**:
```sql
CALL sp_usuarios_cambiarContrasena(
    pUsuarioId INT,
    pHashViejo VARCHAR(72),  -- Hash bcrypt actual
    pHashNuevo VARCHAR(72)   -- Hash bcrypt nuevo
)
```

**Retorna**:
```sql
SELECT TRUE AS cambiado;
```

**Características**:
- Valida que el hash actual coincida
- Actualiza `actualizadoEn` automáticamente

**Errores**:
- `NO_ENCONTRADO` (404) - Si el usuario no existe
- `CONTRASENA_INCORRECTA` (401) - Si la contraseña actual no coincide

**Nota**: La validación con `bcrypt.compare()` se hace en el servicio de Node.js antes de llamar al SP.

### Uso desde Node.js (Ejemplo)

```typescript
// Ejemplo de integración futura
import { pool } from '../config/db';

async findById(id: number): Promise<User | null> {
  try {
    const [rows] = await pool.execute('CALL sp_usuarios_obtenerPorId(?)', [id]);
    return rows[0] || null;
  } catch (error: any) {
    if (error.sqlMessage === 'NO_ENCONTRADO') {
      return null;
    }
    throw error;
  }
}
```

---

## Estructura de Respuestas

### Respuestas Exitosas

Todas las respuestas exitosas siguen el formato:

```typescript
{
  ok: true,
  data: {
    // Datos específicos del endpoint
  }
}
```

### Respuestas de Error

Todas las respuestas de error siguen el formato:

```typescript
{
  ok: false,
  mensaje: string,
  codigo?: number,
  traceId?: string,
  detalles?: Record<string, any>
}
```

**Ejemplos**:

#### Error 404 - Usuario No Encontrado
```json
{
  "ok": false,
  "mensaje": "Usuario no encontrado",
  "codigo": 404,
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Error 401 - Contraseña Incorrecta
```json
{
  "ok": false,
  "mensaje": "La contraseña actual es incorrecta",
  "codigo": 401,
  "traceId": "660e8400-e29b-41d4-a716-446655440001"
}
```

#### Error 422 - Validación Fallida
```json
{
  "ok": false,
  "mensaje": "El usuario debe tener al menos 16 años",
  "codigo": 422,
  "traceId": "770e8400-e29b-41d4-a716-446655440002",
  "detalles": {
    "campo": "fechaN",
    "valor": "2015-01-01"
  }
}
```

---

## Ejemplos de Uso

### Caso de Uso 1: Consultar Perfil Propio

```javascript
// Frontend - Obtener perfil del usuario autenticado
const obtenerMiPerfil = async (userId, token) => {
  try {
    const response = await fetch(`/api/v1/usuarios/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Perfil:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.mensaje);
      throw new Error(data.mensaje);
    }
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    throw error;
  }
};
```

### Caso de Uso 2: Actualizar Nombre y Apellidos

```javascript
// Frontend - Actualizar datos personales
const actualizarDatosPersonales = async (userId, token, datos) => {
  try {
    const response = await fetch(`/api/v1/usuarios/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: datos.nombre,
        apellidoP: datos.apellidoP,
        apellidoM: datos.apellidoM
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Perfil actualizado:', data.data.actualizadoEn);
      return true;
    } else {
      console.error('Error:', data.mensaje);
      return false;
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return false;
  }
};
```

### Caso de Uso 3: Cambiar Contraseña

```javascript
// Frontend - Cambiar contraseña del usuario
const cambiarContrasena = async (userId, token, passwords) => {
  try {
    const response = await fetch(`/api/v1/usuarios/${userId}/contrasena`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contrasenaActual: passwords.actual,
        contrasenaNueva: passwords.nueva
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Contraseña cambiada exitosamente');
      return true;
    } else {
      if (data.codigo === 401) {
        alert('La contraseña actual es incorrecta');
      } else if (data.codigo === 422) {
        alert('La nueva contraseña no cumple con los requisitos de seguridad');
      }
      return false;
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return false;
  }
};
```

---

## Migración desde Versión Anterior

### Guía de Migración para Clientes de API

Si estás migrando desde la versión anterior de la API, sigue estos pasos:

#### 1. Actualizar URLs de Endpoints

```javascript
// Antes
const API_BASE = '/api/users';

// Después
const API_BASE = '/api/v1/usuarios';
```

#### 2. Actualizar Referencias a Campos

```javascript
// Antes
const getUserEmail = (user) => user.email;
const getUserId = (user) => user.id; // UUID string

// Después
const getUserEmail = (user) => user.correo;
const getUserId = (user) => user.usuarioId; // number
```

#### 3. Actualizar Formato de Respuestas

```javascript
// Antes
if (response.status === 'success') {
  const data = response.data;
}

// Después
if (response.ok) {
  const data = response.data;
}
```

#### 4. Actualizar Manejo de Errores

```javascript
// Antes
if (response.status === 'error') {
  console.error(response.message, response.statusCode);
}

// Después
if (!response.ok) {
  console.error(response.mensaje, response.codigo);
  console.log('Trace ID:', response.traceId);
}
```

#### 5. Actualizar Estructura de Usuario

```javascript
// Antes
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // ...
}

// Después
interface Usuario {
  usuarioId: number;
  correo: string;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  fechaN: string;
  // ...
}
```

---

## Pendientes y Trabajo Futuro

### ✅ Completado Recientemente

- [x] **Autenticación Mock** - Middleware `mockAuth` con headers `x-mw-user` y `x-mw-scopes`
- [x] **Sistema de Scopes** - `usuarios:leer`, `usuarios:escribir`, `admin:usuarios`
- [x] **Validación de Permisos** - Middleware `requireUserOwnership` verifica userId === :id o admin:usuarios
- [x] **Stored Procedures MySQL** - 3 SPs creados en `db/stored-procedures/sp_usuarios.sql`
  - [x] `sp_usuarios_obtenerPorId(pUsuarioId INT)` ✅
  - [x] `sp_usuarios_actualizar(pUsuarioId INT, ...)` ✅
  - [x] `sp_usuarios_cambiarContrasena(pUsuarioId INT, ...)` ✅

### 📋 Próximos Pasos

1. **Base de Datos MySQL** (Alta prioridad)
   - Migrar repositorio de in-memory a MySQL
   - Integrar stored procedures en el repositorio
   - Implementar manejo de errores SIGNAL desde stored procedures
   - Mapear errores MySQL a errores de aplicación (NotFoundError, BadRequestError)

3. **Pruebas** (Media prioridad)
   - Pruebas unitarias para servicios
   - Pruebas de integración para endpoints
   - Pruebas de validación de contraseñas
   - Pruebas de normalización de texto
   - Pruebas de edad mínima

4. **Documentación** (Media prioridad)
   - Documentación Swagger/OpenAPI
   - Colección de Postman actualizada
   - Guía de pruebas de API

5. **Mejoras de Seguridad** (Baja prioridad)
   - Rate limiting para endpoints de cambio de contraseña
   - Notificaciones por email al cambiar contraseña
   - Log de auditoría de cambios de perfil
   - Reautenticación obligatoria después de cambio de contraseña

### ⚠️ Limitaciones Conocidas

- **Sin persistencia**: Los datos se pierden al reiniciar el servidor (usando Map en memoria)
  - ✅ **Solución lista**: Stored procedures creados, solo falta migrar repositorio
- **Autenticación Mock**: Usa headers HTTP en lugar de JWT real
  - ℹ️ **Para testing**: Suficiente para desarrollo y pruebas
  - 🔄 **Para producción**: Reemplazar `mockAuth` con middleware JWT real
- **Sin datos seed**: No hay usuarios de prueba precargados
  - 💡 **Workaround**: Crear usuarios manualmente o usar script de seed

---

## Arquitectura de Archivos

```
src/
├── models/
│   └── user.model.ts              # Esquemas Zod y tipos TypeScript
├── dtos/
│   └── user.dto.ts                # DTOs de respuesta API
├── repositories/
│   └── user.repository.ts         # Capa de acceso a datos (in-memory)
├── services/
│   └── user.service.ts            # Lógica de negocio y bcrypt
├── controllers/
│   └── user.controller.ts         # Manejo de peticiones HTTP
├── routes/
│   └── users.routes.ts            # Definición de rutas Express
├── middlewares/
│   └── auth.middleware.ts         # Auth mock y validación de scopes ✅ NUEVO
└── db/
    └── stored-procedures/
        └── sp_usuarios.sql        # Stored Procedures MySQL ✅ NUEVO
```

### Flujo de Datos

```
Request (HTTP)
   ↓
Middlewares
   ├─ mockAuth (x-mw-user, x-mw-scopes) ✅ NUEVO
   ├─ requireScope('usuarios:leer') ✅ NUEVO
   └─ requireUserOwnership ✅ NUEVO
   ↓
Routes (users.routes.ts)
   ↓
Controller (user.controller.ts)
   ├─ Extrae params (id)
   ├─ Extrae body
   └─ Formatea respuestas con DTOs
   ↓
Service (user.service.ts)
   ├─ Validación Zod
   ├─ Lógica de negocio
   └─ bcrypt para contraseñas
   ↓
Repository (user.repository.ts)
   ↓
In-Memory Map (temporal)
   ↓ [Futuro: MySQL SPs] ✅ SPs LISTOS
Response (formatted with DTOs)
```

---

## Contacto y Soporte

**Equipo**: Equipo de Integración Money Wise
**Versión de Documentación**: 2.0.0
**Última Actualización**: 2025-11-17
**Branch**: MWI-#29

### Historial de Cambios

**v2.0.0** (2025-11-17)
- ✅ Implementada autenticación mock con scopes
- ✅ Agregado middleware de validación de permisos
- ✅ Creados stored procedures MySQL completos
- ✅ Actualizada documentación con nuevas funcionalidades

**v1.0.0** (2025-11-15)
- ✅ Implementación inicial de API v1
- ✅ Modelo, DTOs, servicios, controladores y rutas
- ✅ Validaciones con Zod y bcrypt
- ✅ Normalización de texto automática

Para preguntas o issues, consultar el repositorio del proyecto.
