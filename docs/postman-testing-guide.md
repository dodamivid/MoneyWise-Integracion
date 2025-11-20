# Guía de Pruebas en Postman - MoneyWise API

Esta guía te ayudará a probar los endpoints de Usuarios y Metas en Postman.

## Configuración Inicial

### 1. Variables de Entorno (Opcional pero Recomendado)

Crea un entorno en Postman con estas variables:

```
base_url = http://localhost:3000
api_key = test-x-api-key
user_id = 1
test_user_id = 1
```

## Headers Requeridos para Todas las Peticiones

Todas las peticiones bajo `/api/*` requieren estos headers:

```
x-api-key: test-x-api-key
```

Para endpoints de usuarios y metas, también necesitas headers de autenticación mock:

```
x-mw-user: 1
x-mw-scopes: usuarios:leer,usuarios:escribir,admin:usuarios
```

---

## API de Usuarios (v1)

Base path: `/api/v1/usuarios`

### 1. GET - Obtener Perfil de Usuario

**Endpoint:** `GET /api/v1/usuarios/:id`

**URL:** `http://localhost:3000/api/v1/usuarios/1`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: usuarios:leer
```

**Respuesta Esperada (200):**
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
    "creadoEn": "2024-01-01T00:00:00.000Z",
    "actualizadoEn": "2024-01-01T00:00:00.000Z",
    "activo": true
  }
}
```

**Casos de Error:**

- **Usuario no existe (404):**
  ```
  GET /api/v1/usuarios/9999
  ```
  Respuesta:
  ```json
  {
    "ok": false,
    "mensaje": "Usuario con id 9999 no encontrado",
    "codigo": 404,
    "traceId": "..."
  }
  ```

- **Sin permisos (403):**
  ```
  GET /api/v1/usuarios/2
  Headers:
    x-mw-user: 1  (intentando acceder a usuario 2)
    x-mw-scopes: usuarios:leer  (sin admin:usuarios)
  ```
  Respuesta:
  ```json
  {
    "ok": false,
    "mensaje": "No tienes permiso para acceder a este recurso",
    "codigo": 403
  }
  ```

---

### 2. PUT - Actualizar Perfil de Usuario

**Endpoint:** `PUT /api/v1/usuarios/:id`

**URL:** `http://localhost:3000/api/v1/usuarios/1`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: usuarios:escribir
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Juan Carlos",
  "apellidoP": "Pérez",
  "apellidoM": "López",
  "fechaN": "1995-05-20"
}
```

**Respuesta Esperada (200):**
```json
{
  "ok": true,
  "mensaje": "Perfil actualizado exitosamente",
  "actualizadoEn": "2024-01-15T10:30:00.000Z"
}
```

**Casos de Error:**

- **Edad menor a 16 años (422):**
  ```json
  {
    "fechaN": "2015-01-01"
  }
  ```
  Respuesta:
  ```json
  {
    "ok": false,
    "mensaje": "Datos inválidos",
    "codigo": 422,
    "detalles": {
      "campo": "fechaN",
      "razon": "El usuario debe tener al menos 16 años"
    }
  }
  ```

- **Nombre con caracteres inválidos (422):**
  ```json
  {
    "nombre": "Juan123"
  }
  ```

---

### 3. PATCH - Cambiar Contraseña

**Endpoint:** `PATCH /api/v1/usuarios/:id/contrasena`

**URL:** `http://localhost:3000/api/v1/usuarios/1/contrasena`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: usuarios:escribir
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "contrasenaActual": "Password123!",
  "contrasenaNueva": "NewPassword456@"
}
```

**Respuesta Esperada (200):**
```json
{
  "ok": true,
  "mensaje": "Contraseña cambiada exitosamente"
}
```

**Casos de Error:**

- **Contraseña actual incorrecta (401):**
  ```json
  {
    "contrasenaActual": "WrongPassword123!",
    "contrasenaNueva": "NewPassword456@"
  }
  ```
  Respuesta:
  ```json
  {
    "ok": false,
    "mensaje": "La contraseña actual es incorrecta",
    "codigo": 401
  }
  ```

- **Contraseña débil (422):**
  ```json
  {
    "contrasenaActual": "Password123!",
    "contrasenaNueva": "weak"
  }
  ```
  Respuesta:
  ```json
  {
    "ok": false,
    "mensaje": "Datos inválidos",
    "codigo": 422,
    "detalles": {
      "campo": "contrasenaNueva",
      "razon": "Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos"
    }
  }
  ```

---

## API de Metas (v1)

Base path: `/api/v1/metas`

### 1. GET - Listar Metas del Usuario

**Endpoint:** `GET /api/v1/metas`

**URL:** `http://localhost:3000/api/v1/metas?pagina=1&tamanoPagina=10`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: metas:leer
```

**Query Parameters:**
- `pagina` (opcional): Número de página, default: 1
- `tamanoPagina` (opcional): Items por página, default: 10
- `orden` (opcional): `asc` o `desc`, default: `desc`
- `activa` (opcional): `true` o `false`, filtra por estado

**Respuesta Esperada (200):**
```json
{
  "ok": true,
  "data": [
    {
      "metaId": 1,
      "usuarioId": 1,
      "nombre": "Vacaciones 2024",
      "montoObjetivo": 10000,
      "ahorroReal": 5000,
      "fechaInicio": "2024-01-01",
      "fechaFin": "2024-12-31",
      "activa": true,
      "creadoEn": "2024-01-01T00:00:00.000Z",
      "actualizadoEn": "2024-01-01T00:00:00.000Z"
    }
  ],
  "paginacion": {
    "paginaActual": 1,
    "tamanoPagina": 10,
    "totalElementos": 1,
    "totalPaginas": 1
  }
}
```

---

### 2. GET - Obtener Meta por ID

**Endpoint:** `GET /api/v1/metas/:id`

**URL:** `http://localhost:3000/api/v1/metas/1`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: metas:leer
```

**Respuesta Esperada (200):**
```json
{
  "ok": true,
  "data": {
    "metaId": 1,
    "usuarioId": 1,
    "nombre": "Vacaciones 2024",
    "montoObjetivo": 10000,
    "ahorroReal": 5000,
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31",
    "activa": true,
    "creadoEn": "2024-01-01T00:00:00.000Z",
    "actualizadoEn": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. POST - Crear Nueva Meta

**Endpoint:** `POST /api/v1/metas`

**URL:** `http://localhost:3000/api/v1/metas`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: metas:escribir
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Fondo de Emergencia",
  "montoObjetivo": 50000,
  "fechaInicio": "2024-02-01",
  "fechaFin": "2024-12-31"
}
```

**Respuesta Esperada (201):**
```json
{
  "ok": true,
  "data": {
    "metaId": 2,
    "usuarioId": 1,
    "nombre": "Fondo De Emergencia",
    "montoObjetivo": 50000,
    "ahorroReal": 0,
    "fechaInicio": "2024-02-01",
    "fechaFin": "2024-12-31",
    "activa": true,
    "creadoEn": "2024-02-01T10:00:00.000Z",
    "actualizadoEn": "2024-02-01T10:00:00.000Z"
  }
}
```

**Casos de Error:**

- **Monto negativo (400):**
  ```json
  {
    "nombre": "Meta Inválida",
    "montoObjetivo": -1000,
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31"
  }
  ```

- **Fecha fin antes de fecha inicio (400):**
  ```json
  {
    "nombre": "Meta con Fechas Inválidas",
    "montoObjetivo": 10000,
    "fechaInicio": "2024-12-31",
    "fechaFin": "2024-01-01"
  }
  ```

---

### 4. PATCH - Actualizar Meta

**Endpoint:** `PATCH /api/v1/metas/:id`

**URL:** `http://localhost:3000/api/v1/metas/1`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: metas:escribir
Content-Type: application/json
```

**Body (JSON) - Actualizar ahorro:**
```json
{
  "ahorroReal": 7500
}
```

**Body (JSON) - Actualizar nombre y fecha fin:**
```json
{
  "nombre": "Vacaciones Europa 2024",
  "fechaFin": "2024-11-30"
}
```

**Body (JSON) - Desactivar meta:**
```json
{
  "activa": false
}
```

**Respuesta Esperada (200):**
```json
{
  "ok": true,
  "mensaje": "Meta actualizada exitosamente"
}
```

**Casos de Error:**

- **Ahorro real > monto objetivo (sin permisos admin) (400):**
  ```json
  {
    "ahorroReal": 15000
  }
  ```
  Para una meta con `montoObjetivo: 10000`

---

### 5. DELETE - Eliminar Meta

**Endpoint:** `DELETE /api/v1/metas/:id`

**URL:** `http://localhost:3000/api/v1/metas/1`

**Headers:**
```
x-api-key: test-x-api-key
x-mw-user: 1
x-mw-scopes: metas:escribir
```

**Respuesta Esperada (200):**
```json
{
  "ok": true,
  "mensaje": "Meta eliminada exitosamente"
}
```

**Casos de Error:**

- **Intentar eliminar meta de otro usuario (400):**
  ```
  DELETE /api/v1/metas/5
  Headers:
    x-mw-user: 1  (la meta 5 pertenece al usuario 2)
  ```
  Respuesta:
  ```json
  {
    "ok": false,
    "mensaje": "No tiene permisos para eliminar esta meta",
    "codigo": 400
  }
  ```

---

## Scopes de Autorización

### Scopes de Usuarios
- `usuarios:leer` - Permite GET de perfiles
- `usuarios:escribir` - Permite PUT y PATCH
- `admin:usuarios` - Permite acceso a cualquier usuario (bypass ownership)

### Scopes de Metas
- `metas:leer` - Permite GET de metas
- `metas:escribir` - Permite POST, PATCH, DELETE
- `admin:metas` - Permite operaciones administrativas

### Ejemplos de Headers con Scopes

**Solo lectura:**
```
x-mw-scopes: usuarios:leer,metas:leer
```

**Lectura y escritura:**
```
x-mw-scopes: usuarios:leer,usuarios:escribir,metas:leer,metas:escribir
```

**Permisos completos (admin):**
```
x-mw-scopes: usuarios:leer,usuarios:escribir,admin:usuarios,metas:leer,metas:escribir,admin:metas
```

---

## Colección de Postman Pre-configurada

Puedes importar esta colección JSON en Postman:

```json
{
  "info": {
    "name": "MoneyWise API - Usuarios y Metas",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Usuarios",
      "item": [
        {
          "name": "Obtener Perfil",
          "request": {
            "method": "GET",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "usuarios:leer"}
            ],
            "url": {
              "raw": "http://localhost:3000/api/v1/usuarios/1",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "usuarios", "1"]
            }
          }
        },
        {
          "name": "Actualizar Perfil",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "usuarios:escribir"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nombre\": \"Juan Carlos\",\n  \"apellidoP\": \"Pérez\",\n  \"apellidoM\": \"López\",\n  \"fechaN\": \"1995-05-20\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/usuarios/1",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "usuarios", "1"]
            }
          }
        },
        {
          "name": "Cambiar Contraseña",
          "request": {
            "method": "PATCH",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "usuarios:escribir"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"contrasenaActual\": \"Password123!\",\n  \"contrasenaNueva\": \"NewPassword456@\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/usuarios/1/contrasena",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "usuarios", "1", "contrasena"]
            }
          }
        }
      ]
    },
    {
      "name": "Metas",
      "item": [
        {
          "name": "Listar Metas",
          "request": {
            "method": "GET",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "metas:leer"}
            ],
            "url": {
              "raw": "http://localhost:3000/api/v1/metas?pagina=1&tamanoPagina=10",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "metas"],
              "query": [
                {"key": "pagina", "value": "1"},
                {"key": "tamanoPagina", "value": "10"}
              ]
            }
          }
        },
        {
          "name": "Obtener Meta por ID",
          "request": {
            "method": "GET",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "metas:leer"}
            ],
            "url": {
              "raw": "http://localhost:3000/api/v1/metas/1",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "metas", "1"]
            }
          }
        },
        {
          "name": "Crear Meta",
          "request": {
            "method": "POST",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "metas:escribir"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nombre\": \"Fondo de Emergencia\",\n  \"montoObjetivo\": 50000,\n  \"fechaInicio\": \"2024-02-01\",\n  \"fechaFin\": \"2024-12-31\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/metas",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "metas"]
            }
          }
        },
        {
          "name": "Actualizar Meta",
          "request": {
            "method": "PATCH",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "metas:escribir"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"ahorroReal\": 7500\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/metas/1",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "metas", "1"]
            }
          }
        },
        {
          "name": "Eliminar Meta",
          "request": {
            "method": "DELETE",
            "header": [
              {"key": "x-api-key", "value": "test-x-api-key"},
              {"key": "x-mw-user", "value": "1"},
              {"key": "x-mw-scopes", "value": "metas:escribir"}
            ],
            "url": {
              "raw": "http://localhost:3000/api/v1/metas/1",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "metas", "1"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## Troubleshooting

### Error: "Missing x-api-key header"
- **Causa:** Falta el header `x-api-key`
- **Solución:** Agregar header `x-api-key: test-x-api-key`

### Error: "No tienes permiso para acceder a este recurso" (403)
- **Causa:** Intentas acceder a datos de otro usuario sin scopes de admin
- **Solución:** Usar el mismo ID en `x-mw-user` que en la URL, o agregar `admin:usuarios` a los scopes

### Error: "Insufficient scopes" (403)
- **Causa:** Faltan scopes necesarios en `x-mw-scopes`
- **Solución:** Agregar los scopes requeridos (ej: `usuarios:leer`, `metas:escribir`)

### Endpoint no encontrado (404)
- **Causa:** URL incorrecta o servidor no está corriendo
- **Solución:** Verificar que el servidor esté corriendo en `http://localhost:3000` con `npm run dev`

---

## Notas Importantes

1. **Almacenamiento en Memoria:** Los datos de usuarios son volátiles. Al reiniciar el servidor, se pierden todos los cambios.

2. **IDs Numéricos:** Los IDs de usuarios son números enteros (1, 2, 3...), no UUIDs.

3. **Capitalización Automática:** Los nombres y apellidos se capitalizan automáticamente (ej: "juan" → "Juan").

4. **Validación de Edad:** Los usuarios deben tener al menos 16 años según `fechaN`.

5. **Contraseñas:** Las contraseñas deben tener:
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula
   - Al menos 1 minúscula
   - Al menos 1 número
   - Al menos 1 símbolo especial

6. **Headers Mock:** Los headers `x-mw-user` y `x-mw-scopes` simulan autenticación JWT para desarrollo. En producción se reemplazarán con JWT real.
