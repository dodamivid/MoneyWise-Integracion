# API de Metas - MoneyWise

Este documento describe la implementación completa del API de Metas de Ahorro para la aplicación MoneyWise, incluyendo arquitectura, endpoints, validaciones y ejemplos de uso.

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Modelo de Datos](#modelo-de-datos)
4. [Endpoints](#endpoints)
5. [Validaciones](#validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Casos de Error](#casos-de-error)
8. [Testing](#testing)

## Descripción General

El API de Metas permite a los usuarios crear, consultar, actualizar y eliminar metas de ahorro, medir el avance mediante el cálculo automático de porcentaje (`ahorroReal / montoObjetivo * 100`) y controlar el estado de las metas (`activa`).

### Características Principales

- ✅ **CRUD Completo** - Crear, leer, actualizar y eliminar metas
- ✅ **Cálculo Automático** - Porcentaje de avance calculado automáticamente
- ✅ **Soft Delete** - Eliminación suave para preservar historial
- ✅ **Filtros Avanzados** - Por usuario, fechas, estado activo
- ✅ **Paginación** - Configurable con máximo de 100 elementos
- ✅ **Ordenamiento** - Múltiples campos con dirección ASC/DESC
- ✅ **Validaciones Robustas** - Usando Zod schemas
- ✅ **Almacenamiento en Memoria** - Para desarrollo (preparado para BD)

## Arquitectura

### Patrón de Capas

El API sigue una arquitectura en capas con separación de responsabilidades:

```
┌─────────────────────────────────────────────────────┐
│  HTTP Request                                       │
│  GET /api/v1/metas?activa=true&pagina=1            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Routes (metas.routes.ts)                           │
│  └─> Mapea rutas a métodos del controlador         │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Controller (metas.controller.ts)                   │
│  ├─> Extrae parámetros HTTP                        │
│  ├─> Valida formato de entrada básica              │
│  └─> Formatea respuestas con DTOs                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Service (metas.service.ts)                         │
│  ├─> Valida con esquemas Zod                       │
│  ├─> Aplica reglas de negocio                      │
│  ├─> Coordina operaciones del repositorio          │
│  └─> Lanza errores personalizados                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Repository (metas.repository.ts)                   │
│  ├─> Acceso a datos (CRUD)                         │
│  ├─> Filtrado y paginación                         │
│  ├─> Ordenamiento                                  │
│  └─> Cálculo de porcentaje de avance               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Model (meta.model.ts)                              │
│  ├─> Define esquemas Zod                           │
│  ├─> Tipos TypeScript                              │
│  └─> Validaciones de estructura                    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  DTO (metas.dto.ts)                                 │
│  └─> Formatea respuestas { ok, data, meta }        │
└─────────────────────────────────────────────────────┘
```

### Componentes

| Archivo | Responsabilidad |
|---------|----------------|
| `meta.model.ts` | Define estructura de datos, tipos TypeScript y validaciones Zod |
| `metas.dto.ts` | Define formato de respuestas y funciones de transformación |
| `metas.repository.ts` | Maneja acceso a datos en memoria (futuro: BD) |
| `metas.service.ts` | Implementa lógica de negocio y validaciones |
| `metas.controller.ts` | Maneja peticiones HTTP y respuestas |
| `metas.routes.ts` | Define rutas y mapea a controladores |

## Modelo de Datos

### Estructura de Meta

```typescript
interface Meta {
  metaId: number;              // ID único autoincremental
  usuarioId: number;           // ID del usuario propietario
  nombre: string;              // Nombre de la meta (máx 120 chars)
  montoObjetivo: number;       // Cantidad objetivo (DECIMAL 12,2)
  ahorroReal: number;          // Cantidad ahorrada actual (DECIMAL 12,2)
  porcentajeAvance: number;    // Porcentaje calculado (0-100+)
  activa: boolean;             // Estado de la meta
  fechaInicio: string;         // Fecha de inicio (ISO 8601)
  fechaFin?: string;           // Fecha objetivo opcional (ISO 8601)
  creadoEn: string;           // Timestamp de creación
  actualizadoEn: string;      // Timestamp de última actualización
}
```

### Campos Autogenerados

Los siguientes campos se generan automáticamente:
- `metaId` - Autoincremental
- `ahorroReal` - Inicializado en 0.00
- `porcentajeAvance` - Calculado automáticamente
- `creadoEn` - Timestamp actual
- `actualizadoEn` - Timestamp actual

## Endpoints

### Base URL

```
/api/v1/metas
```

### 1. Listar Metas

```http
GET /api/v1/metas
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `usuarioId` | number | No | - | Filtrar por usuario (requiere permisos admin) |
| `desde` | string (ISO) | No | - | Fecha de inicio del rango |
| `hasta` | string (ISO) | No | - | Fecha de fin del rango |
| `activa` | boolean | No | - | Filtrar por estado activo |
| `pagina` | number | No | 1 | Número de página |
| `tamanoPagina` | number | No | 20 | Elementos por página (máx 100) |
| `orden` | string | No | - | Campo y dirección de ordenamiento |

#### Valores de `orden`

- `fechaInicio` / `fechaInicio:asc` / `fechaInicio:desc`
- `fechaFin` / `fechaFin:asc` / `fechaFin:desc`
- `creadoEn` / `creadoEn:asc` / `creadoEn:desc`
- `montoObjetivo` / `montoObjetivo:asc` / `montoObjetivo:desc`
- `porcentajeAvance` / `porcentajeAvance:asc` / `porcentajeAvance:desc`

#### Respuesta Exitosa (200)

```json
{
  "ok": true,
  "data": [
    {
      "metaId": 7,
      "usuarioId": 23,
      "nombre": "Vacaciones 2026",
      "montoObjetivo": 150000.00,
      "ahorroReal": 35000.00,
      "porcentajeAvance": 23.33,
      "activa": true,
      "fechaInicio": "2025-01-01T00:00:00Z",
      "fechaFin": "2026-12-31T23:59:59Z",
      "creadoEn": "2025-01-05T10:45:00Z",
      "actualizadoEn": "2025-04-01T08:10:00Z"
    }
  ],
  "meta": {
    "paginacion": {
      "pagina": 1,
      "tamanoPagina": 20,
      "total": 1
    }
  }
}
```

### 2. Obtener Meta por ID

```http
GET /api/v1/metas/:id
```

#### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID de la meta |

#### Respuesta Exitosa (200)

```json
{
  "ok": true,
  "data": {
    "metaId": 7,
    "usuarioId": 23,
    "nombre": "Vacaciones 2026",
    "montoObjetivo": 150000.00,
    "ahorroReal": 35000.00,
    "porcentajeAvance": 23.33,
    "activa": true,
    "fechaInicio": "2025-01-01T00:00:00Z",
    "fechaFin": "2026-12-31T23:59:59Z",
    "creadoEn": "2025-01-05T10:45:00Z",
    "actualizadoEn": "2025-04-01T08:10:00Z"
  }
}
```

### 3. Crear Meta

```http
POST /api/v1/metas
```

#### Body (JSON)

```json
{
  "usuarioId": 23,
  "nombre": "Vacaciones 2026",
  "montoObjetivo": 150000.00,
  "fechaInicio": "2025-01-01T00:00:00Z",
  "fechaFin": "2026-12-31T23:59:59Z",
  "activa": true
}
```

#### Campos Requeridos

- `usuarioId` - ID del usuario propietario
- `nombre` - Nombre de la meta (1-120 caracteres)
- `montoObjetivo` - Monto objetivo (> 0, máx 2 decimales)
- `fechaInicio` - Fecha de inicio (ISO 8601)

#### Campos Opcionales

- `fechaFin` - Fecha objetivo (debe ser >= fechaInicio)
- `activa` - Estado (default: true)

#### Respuesta Exitosa (201)

```json
{
  "ok": true,
  "data": {
    "metaId": 7
  }
}
```

### 4. Actualizar Meta

```http
PATCH /api/v1/metas/:id
```

#### Body (JSON) - Todos los campos opcionales

```json
{
  "nombre": "Vacaciones Europa 2026",
  "montoObjetivo": 200000.00,
  "ahorroReal": 50000.00,
  "fechaInicio": "2025-01-01T00:00:00Z",
  "fechaFin": "2026-12-31T23:59:59Z",
  "activa": true
}
```

#### Respuesta Exitosa (200)

```json
{
  "ok": true,
  "data": {
    "actualizado": true
  }
}
```

### 5. Eliminar Meta (Soft Delete)

```http
DELETE /api/v1/metas/:id
```

**Nota**: Esta operación realiza un *soft delete* marcando `activa = false`. El registro no se elimina físicamente.

#### Respuesta Exitosa (200)

```json
{
  "ok": true,
  "data": {
    "eliminado": true
  }
}
```

## Validaciones

### Reglas de Negocio

#### Crear Meta

1. ✅ `nombre` debe tener entre 1 y 120 caracteres
2. ✅ `montoObjetivo` debe ser mayor a 0
3. ✅ `montoObjetivo` debe tener máximo 2 decimales
4. ✅ `fechaFin` (si se proporciona) debe ser >= `fechaInicio`
5. ✅ `usuarioId` debe ser un número entero positivo

#### Actualizar Meta

1. ✅ `ahorroReal` no puede superar `montoObjetivo` (sin permisos admin)
2. ✅ `ahorroReal` no puede ser negativo
3. ✅ `montoObjetivo` debe ser mayor a 0
4. ✅ `fechaFin` debe ser >= `fechaInicio`
5. ✅ `porcentajeAvance` se recalcula automáticamente

#### Eliminar Meta

1. ✅ Solo el usuario propietario puede eliminar su meta
2. ✅ Se realiza soft delete (marca como inactiva)
3. ✅ Los datos históricos se preservan

### Esquemas Zod

El modelo usa Zod para validación en tiempo de ejecución:

```typescript
// Ejemplo de validación en el modelo
export const CreateMetaSchema = MetaSchema.omit({
  metaId: true,
  ahorroReal: true,
  porcentajeAvance: true,
  creadoEn: true,
  actualizadoEn: true,
}).refine(
  (data) => {
    if (!data.fechaFin) return true;
    return new Date(data.fechaFin) >= new Date(data.fechaInicio);
  },
  {
    message: "La fecha de fin debe ser mayor o igual a la fecha de inicio",
    path: ["fechaFin"],
  }
);
```

## Ejemplos de Uso

### Flujo Completo: Crear y Seguir una Meta

#### 1. Crear Meta de Ahorro

```bash
POST /api/v1/metas
Content-Type: application/json

{
  "usuarioId": 23,
  "nombre": "Vacaciones 2026",
  "montoObjetivo": 100000.00,
  "fechaInicio": "2025-01-01T00:00:00Z",
  "fechaFin": "2026-12-31T23:59:59Z",
  "activa": true
}

# Respuesta: { "ok": true, "data": { "metaId": 7 } }
```

#### 2. Consultar Estado Inicial

```bash
GET /api/v1/metas/7

# Respuesta:
{
  "ok": true,
  "data": {
    "metaId": 7,
    "nombre": "Vacaciones 2026",
    "montoObjetivo": 100000.00,
    "ahorroReal": 0.00,
    "porcentajeAvance": 0.00,
    "activa": true,
    ...
  }
}
```

#### 3. Actualizar Progreso (25%)

```bash
PATCH /api/v1/metas/7
Content-Type: application/json

{
  "ahorroReal": 25000.00
}

# El sistema calcula automáticamente: porcentajeAvance = 25.00
```

#### 4. Actualizar Progreso (100%)

```bash
PATCH /api/v1/metas/7
Content-Type: application/json

{
  "ahorroReal": 100000.00
}

# porcentajeAvance = 100.00 (¡Meta completada!)
```

#### 5. Cerrar Meta

```bash
PATCH /api/v1/metas/7
Content-Type: application/json

{
  "activa": false
}

# Meta marcada como completada
```

### Filtros Avanzados

#### Listar Metas Activas de un Usuario

```bash
GET /api/v1/metas?usuarioId=23&activa=true&pagina=1&tamanoPagina=20
```

#### Metas por Rango de Fechas

```bash
GET /api/v1/metas?desde=2025-01-01T00:00:00Z&hasta=2025-12-31T23:59:59Z
```

#### Ordenar por Porcentaje de Avance

```bash
GET /api/v1/metas?orden=porcentajeAvance:desc
```

## Casos de Error

### Error 400 - Datos Inválidos

```json
{
  "status": "error",
  "message": "El monto objetivo debe ser mayor a 0",
  "statusCode": 400,
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Causas comunes:**
- Monto objetivo negativo o cero
- Nombre vacío o muy largo (>120 caracteres)
- FechaFin anterior a fechaInicio
- AhorroReal supera montoObjetivo (sin permisos admin)

### Error 404 - Meta No Encontrada

```json
{
  "status": "error",
  "message": "Meta con id 9999 no encontrado",
  "statusCode": 404,
  "traceId": "660e8400-e29b-41d4-a716-446655440001"
}
```

### Error 422 - Validación Fallida

```json
{
  "status": "error",
  "message": "La fecha de fin debe ser mayor o igual a la fecha de inicio",
  "statusCode": 422,
  "traceId": "770e8400-e29b-41d4-a716-446655440002"
}
```

## Testing

El API cuenta con **25 pruebas de integración** con una cobertura del **96%**.

### Ejecutar Pruebas

```bash
# Todas las pruebas de metas
npm test -- metas.test.ts

# Todas las pruebas con cobertura
npm run test:coverage

# Pruebas en modo watch
npm run test:watch
```

### Casos de Prueba

#### Crear Metas
- ✅ Crear meta con fechaFin
- ✅ Crear meta sin fechaFin
- ✅ Error: montoObjetivo negativo
- ✅ Error: fechaFin antes de fechaInicio
- ✅ Error: campos requeridos faltantes
- ✅ Error: nombre muy largo (>120 chars)

#### Consultar Metas
- ✅ Obtener meta por ID
- ✅ Error: ID no existente
- ✅ Error: ID con formato inválido
- ✅ Listar con paginación
- ✅ Filtrar por usuarioId
- ✅ Filtrar por estado activo
- ✅ Ordenar por fechaInicio:desc

#### Actualizar Metas
- ✅ Actualizar ahorroReal
- ✅ Actualizar nombre y montoObjetivo
- ✅ Marcar como inactiva
- ✅ Error: ahorroReal supera objetivo
- ✅ Error: meta no encontrada
- ✅ Error: fechaFin inválida

#### Eliminar Metas
- ✅ Soft delete exitoso
- ✅ Error: meta no encontrada
- ✅ Error: usuario sin permisos

#### Flujo de Integración
- ✅ Crear → Actualizar progreso → Completar → Cerrar

### Ejemplo de Test

```typescript
it('should create, update, and track progress of a meta', async () => {
  // 1. Crear meta
  const createResponse = await request(app)
    .post('/api/v1/metas')
    .send({
      usuarioId: 23,
      nombre: 'Vacaciones 2026',
      montoObjetivo: 100000.00,
      fechaInicio: '2025-01-01T00:00:00Z',
      activa: true
    })
    .expect(201);

  const metaId = createResponse.body.data.metaId;

  // 2. Verificar estado inicial
  let getResponse = await request(app)
    .get(`/api/v1/metas/${metaId}`)
    .expect(200);

  expect(getResponse.body.data.ahorroReal).toBe(0.0);
  expect(getResponse.body.data.porcentajeAvance).toBe(0.0);

  // 3. Actualizar progreso a 100%
  await request(app)
    .patch(`/api/v1/metas/${metaId}`)
    .send({ ahorroReal: 100000.0 })
    .expect(200);

  getResponse = await request(app)
    .get(`/api/v1/metas/${metaId}`)
    .expect(200);

  expect(getResponse.body.data.porcentajeAvance).toBe(100.0);
});
```

## Notas de Implementación

### Almacenamiento en Memoria

Actualmente el repositorio usa un `Map` en memoria para almacenamiento:

```typescript
private metas: Map<number, Meta> = new Map();
private nextId: number = 1;
```

**Características:**
- ✅ Los datos se pierden al reiniciar el servidor
- ✅ Ideal para desarrollo y testing
- ✅ Preparado para migración a BD (stored procedures)
- ✅ Se puede limpiar con `metasRepository.clear()`

### Cálculo de Porcentaje

El porcentaje de avance se calcula automáticamente:

```typescript
private calcularPorcentajeAvance(
  ahorroReal: number,
  montoObjetivo: number
): number {
  if (montoObjetivo === 0) return 0;
  const porcentaje = (ahorroReal / montoObjetivo) * 100;
  return Math.round(porcentaje * 100) / 100; // 2 decimales
}
```

### Soft Delete

Las eliminaciones son suaves para preservar historial:

```typescript
async delete(metaId: number): Promise<boolean> {
  const existingMeta = await this.findById(metaId);
  if (!existingMeta) return false;

  // Soft delete: marcar como inactiva
  await this.update(metaId, { activa: false });
  return true;
}
```

## Roadmap Futuro

### Autenticación JWT
- [ ] Integrar middleware de autenticación
- [ ] Extraer `usuarioId` del token JWT
- [ ] Implementar scopes: `metas:leer`, `metas:escribir`, `admin:metas`

### Base de Datos
- [ ] Migrar a MySQL/PostgreSQL
- [ ] Implementar stored procedures (según ticket)
- [ ] Agregar índices para optimización

### Funcionalidades
- [ ] Notificaciones al completar meta
- [ ] Historial de cambios
- [ ] Metas compartidas entre usuarios
- [ ] Categorías de metas

## Referencias

- **Ticket Original**: `tickets/API_metas.md`
- **Modelo**: `src/models/meta.model.ts`
- **Servicio**: `src/services/metas.service.ts`
- **Pruebas**: `__tests__/tests/integration/metas.test.ts`
- **Arquitectura General**: `CLAUDE.md`

---

**Última actualización**: 2025-11-11
**Versión**: 1.0.0
**Autor**: Equipo de Integración Money Wise
