# MoneyWise - Guía rápida de despliegue y consumo

Este README resume cómo dejamos la API en Railway y qué necesitan  para consumirla con la base de datos incluida.

## 1. URL y clave
- **Base URL**: `https://moneywise-integracion-production.up.railway.app`
- **Header obligatorio**: `x-api-key: <ver Railway → MoneyWise-Integracion → Variables → API_KEY>`

> ⚠️ Este repo es público. Nunca pegues aquí el valor real de `API_KEY`,
> `JWT_SECRET` ni `DB_PASSWORD` — pídelos a alguien del equipo con acceso a
> Railway, o consúltalos tú mismo en la pestaña Variables. Si alguna vez se
> comitea un valor real por error, hay que rotarlo (no basta con borrarlo del
> archivo, hay que asumir que ya quedó expuesto).

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
  - `GET /api/v1/catalogos`, `GET /api/v1/catalogos/tipos-ingreso`
  - `GET/POST/PATCH/DELETE /api/v1/ingresos`, `/api/v1/egresos`, `/api/v1/inversiones`, `/api/v1/metas`
  - `GET /api/v1/dashboard`, `GET /api/v1/version`

## 3. Variables de entorno usadas en Railway (servicio Web)
```
PORT=3000
NODE_ENV=production
API_KEY=<valor real solo en Railway → Variables>
JWT_SECRET=<valor real solo en Railway → Variables>
BCRYPT_ROUNDS=12
USE_DB=true
DB_ENABLED=true
DB_HOST=mainline.proxy.rlwy.net
DB_PORT=43732
DB_USER=root
DB_PASSWORD=<valor real solo en Railway → Variables>
DB_NAME=moneywise
APP_URL=https://moneywise-integracion-production.up.railway.app
```

## 4. Base de datos
- **Fuente autoritativa del esquema**: `db/moneywise_schema.sql` (incluye tablas, seeds y SPs). Es el único script de esquema soportado; cualquier otro dump en el repo (p. ej. `docs/historico/`) es legado y no debe importarse.
- Ya está importado en la instancia MySQL de Railway con DB `moneywise`.
- Si alguien necesita recrear la DB (usa el `DB_PASSWORD` real de Railway → Variables, no lo pegues en ningún archivo):
  ```
  mysql -h mainline.proxy.rlwy.net -P 43732 -u root -p moneywise < db/moneywise_schema.sql
  ```
  (con `-p` sin valor pegado, `mysql` lo pide interactivo; o usa `scripts/import-db.js` con `DB_HOST/DB_PORT/DB_USER/DB_PASS` como variables de entorno de tu terminal).

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
