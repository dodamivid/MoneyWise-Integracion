# MoneyWise - Guía rápida de despliegue y consumo

Este README resume cómo dejamos la API en Railway y qué necesitan  para consumirla con la base de datos incluida.

## 1. URL y clave
- **Base URL**: `https://moneywise-integracion-production.up.railway.app`
- **Header obligatorio**: `x-api-key: api-key-moneywise-7af3b1b6-2c6f-4f3d-9b2b-7b8c9d1e5f42`

## 2. Endpoints básicos
- Health: `GET /health`
- Auth:
  - Registro: `POST /api/v1/auth/registro`
  - Login: `POST /api/v1/auth/acceso`
- Usuarios:
  - `GET /api/users/:id`
  - `PUT /api/users/:id`
  - `PATCH /api/users/:id/contrasena`
- Catálogos y otros:
  - `GET /api/v1/catalogos`, `GET /api/v1/tipos-ingreso`
  - `GET/POST/PATCH/DELETE /api/v1/ingresos`, `/api/v1/egresos`, `/api/v1/inversiones`, `/api/v1/metas`
  - `GET /api/v1/dashboard`, `GET /api/v1/version`

## 3. Variables de entorno usadas en Railway (servicio Web)
```
PORT=3000
NODE_ENV=production
API_KEY=api-key-moneywise-7af3b1b6-2c6f-4f3d-9b2b-7b8c9d1e5f42
JWT_SECRET=jwt-moneywise-1c7f7fb0-6e3c-4ad7-a6c1-5f9f3a7c8b21
BCRYPT_ROUNDS=12
USE_DB=true
DB_ENABLED=true
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=43732
DB_USER=root
DB_PASSWORD=ilutdjheSPGSvbMdYJAJbFuaoHnLzNTN
DB_NAME=moneywise
APP_URL=https://moneywise-integracion-production.up.railway.app
```

## 4. Base de datos
- Script: `db/moneywise_schema.sql` (incluye tablas, seeds y SPs).
- Ya está importado en la instancia MySQL de Railway con DB `moneywise`.
- Si alguien necesita recrear la DB:
  ```
  mysql -h mainline.proxy.rlwy.net -P 43732 -u root -p<DB_PASSWORD> moneywise < db/moneywise_schema.sql
  ```

## 5. Cómo probar rápido en Postman
1) Crear usuario:
```
POST {{base}}/api/v1/auth/registro
Headers: x-api-key: <clave>, Content-Type: application/json
Body:
{
  "nombre": "Test",
  "apellidoP": "Uno",
  "apellidoM": "Demo",
  "correo": "algun-correo@example.com",
  "fechaN": "2000-01-01",
  "contrasena": "TuPass123"
}
```
2) Consultar usuario:
```
GET {{base}}/api/users/<usuarioId>
Headers: x-api-key: <clave>
```
3) Login:
```
POST {{base}}/api/v1/auth/acceso
Headers: x-api-key: <clave>, Content-Type: application/json
Body: { "correo": "<correo>", "contrasena": "<pwd>" }
```

## 6. Notas
- El middleware de API Key aplica a todo `/api`.
- Los scopes para pruebas vienen simulados en headers `x-mw-user` y `x-mw-scopes` si se necesitan, pero para `/api/users` ya hay mock con scopes básicos.
- Swagger no está expuesto porque falta `docs/api/openapi.yaml`; las rutas se documentan en `src/app.ts`.
