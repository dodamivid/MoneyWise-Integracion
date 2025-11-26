# MoneyWise API - Guía para Frontend

Base URL: `https://moneywise-integracion-production.up.railway.app`  
Header requerido en todas las peticiones a `/api`: `x-api-key: api-key-moneywise-7af3b1b6-2c6f-4f3d-9b2b-7b8c9d1e5f42`

## Auth
- `POST /api/v1/auth/registro`  
  Body:
  ```json
  { "nombre": "Test", "apellidoP": "Uno", "apellidoM": "Demo", "correo": "mail@example.com", "fechaN": "2000-01-01", "contrasena": "TuPass123" }
  ```
- `POST /api/v1/auth/acceso`  
  Body:
  ```json
  { "correo": "mail@example.com", "contrasena": "TuPass123" }
  ```

## Usuarios
- `GET /api/users/:id`
- `PUT /api/users/:id` (body opcional: nombre, apellidoP, apellidoM, fechaN)
- `PATCH /api/users/:id/contrasena`

## Ingresos / Egresos / Inversiones / Metas
- Ingresos: `GET|POST|PATCH|DELETE /api/v1/ingresos`
- Egresos: `GET|POST|PATCH|DELETE /api/v1/egresos`
- Inversiones: `GET|POST|PATCH|DELETE /api/v1/inversiones`
- Metas: `GET|POST|PATCH|DELETE /api/v1/metas`

## Catálogos y otros
- `GET /api/v1/catalogos` (incluye procedencias y tipos egreso)
- `GET /api/v1/tipos-ingreso`
- `GET /api/v1/dashboard`
- `GET /api/v1/version`

## Health
- `GET /health`

## Ejemplo de request (fetch)
```js
const res = await fetch(
  "https://moneywise-integracion-production.up.railway.app/api/v1/auth/acceso",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "api-key-moneywise-7af3b1b6-2c6f-4f3d-9b2b-7b8c9d1e5f42",
    },
    body: JSON.stringify({ correo: "mail@example.com", contrasena: "TuPass123" }),
  }
);
const data = await res.json();
```
