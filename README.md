# MoneyWise – Equipo de Integración (Endpoints)

## Proyecto Backend – Sprint 0  
Tecnológico de Chihuahua II – Equipo de Integración  

Desarrollo del backend en **Node.js + TypeScript + Express** con enfoque en endpoints base, autenticación, logging, manejo de errores, pruebas unitarias y CI/CD.

---

## Objetivo general
Tener un servidor Express en TypeScript con endpoints base de usuarios, autenticación simple, logging y pruebas integradas con CI.

---

## Estructura esperada del proyecto

moneywise-integracion/
│
├── src/
│ ├── index.ts
│ ├── routes/
│ ├── controllers/
│ ├── middlewares/
│ ├── utils/
│ └── tests/
│
├── package.json
├── tsconfig.json
├── Dockerfile
├── .github/workflows/ci.yml
└── README.md

yaml
Copiar código

---

## Roadmap – Sprint 0

A continuación se detallan los 10 tickets oficiales del sprint 0, con su descripción técnica, pasos y entregables esperados.

---

### Ticket 1 – Define API Contract: Users Service

**Objetivo:**  
Definir el contrato OpenAPI/Swagger de la API de usuarios.

**Detalles técnicos:**
- Crear el archivo `openapi.yaml` o `openapi.json` dentro de `/docs/`.
- Incluir los endpoints:
  - `POST /api/users` → crear usuario.
  - `GET /api/users/{id}` → obtener usuario por ID.
- Definir los esquemas de request/response:

```yaml
User:
  type: object
  properties:
    id: { type: string }
    name: { type: string }
    email: { type: string }
  required: [name, email]
Entregable:
Archivo OpenAPI validado en Swagger Editor con ambos endpoints documentados.

Ticket 2 – Set up Express TS Server Skeleton
Objetivo:
Configurar la estructura base del servidor Express con TypeScript.

Pasos:

Inicializar proyecto:

bash
Copiar código
npm init -y
npm install express pino
npm install -D typescript ts-node-dev @types/node @types/express
npx tsc --init
Crear el archivo src/index.ts:

ts
Copiar código
import express from 'express';
const app = express();
app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));
app.listen(3000, () => console.log('Server running on port 3000'));
Agregar scripts en package.json:

json
Copiar código
"scripts": {
  "dev": "ts-node-dev --respawn src/index.ts"
}
Entregable:
Servidor funcional con npm run dev y endpoint /health respondiendo { "status": "ok" }.

Ticket 3 – Implement GET /api/users/:id
Objetivo:
Implementar el endpoint que obtiene un usuario por su ID (almacenado en memoria).

Detalles técnicos:

Crear carpetas /src/routes/ y /src/controllers/.

Simular una base de datos en memoria:

ts
Copiar código
const users = [{ id: '1', name: 'David', email: 'david@tec2.mx' }];
Implementar endpoint:

ts
Copiar código
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});
Entregable:
Petición GET a /api/users/1 devuelve los datos correctos del usuario.

Ticket 4 – Implement POST /api/users (in-memory)
Objetivo:
Crear el endpoint que permita registrar un nuevo usuario en memoria.

Pasos técnicos:

Validar que name y email existan en el body.

Generar un ID con uuid.

Retornar el nuevo usuario con código 201.

Ejemplo:

ts
Copiar código
import { v4 as uuid } from 'uuid';
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: 'Missing fields' });
  const newUser = { id: uuid(), name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});
Entregable:
POST válido devuelve código 201 y el nuevo usuario en formato JSON.

Ticket 5 – Auth Middleware (API Key Placeholder)
Objetivo:
Agregar un middleware que valide la cabecera x-api-key.

Pasos:

Crear /src/middlewares/auth.ts.

Middleware de autenticación:

ts
Copiar código
export function auth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== '123456') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
Aplicar en las rutas /api/users.

Entregable:
Solicitudes sin API key válida devuelven 401 Unauthorized.

Ticket 6 – Logging and Request Correlation
Objetivo:
Agregar sistema de logs con identificador único por petición.

Pasos:

Instalar Pino:

bash
Copiar código
npm install pino pino-http
Integrar en src/index.ts:

ts
Copiar código
import pinoHttp from 'pino-http';
app.use(pinoHttp());
app.use((req, res, next) => {
  res.setHeader('x-correlation-id', req.id);
  next();
});
Entregable:
Cada request genera un x-correlation-id único y logs con el mismo identificador.

Ticket 7 – Error Handling and Response Format
Objetivo:
Centralizar el manejo de errores con formato estándar.

Pasos:

Crear middleware global al final del flujo:

ts
Copiar código
app.use((err, req, res, next) => {
  req.log.error(err);
  res.status(500).json({
    error: true,
    message: err.message,
    traceId: req.id
  });
});
Entregable:
Errores muestran formato unificado { error, message, traceId }.

Ticket 8 – Unit Tests for Users Endpoints
Objetivo:
Asegurar el funcionamiento correcto de los endpoints mediante Jest y Supertest.

Pasos:

bash
Copiar código
npm install -D jest supertest ts-jest
npx ts-jest config:init
Prueba ejemplo:

ts
Copiar código
import request from 'supertest';
import app from '../src/index';

describe('Users API', () => {
  it('should create user successfully', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@mail.com' });
    expect(res.status).toBe(201);
  });
});
Entregable:
Pruebas corren con npm test y cobertura mínima del 70%.

Ticket 9 – Dockerfile and Container Run
Objetivo:
Empaquetar el proyecto en un contenedor Docker.

Ejemplo de Dockerfile:

dockerfile
Copiar código
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev
CMD ["node", "dist/index.js"]
Entregable:
El contenedor debe construirse y correr correctamente con:

bash
Copiar código
docker build -t moneywise-api .
docker run -p 3000:3000 moneywise-api
Ticket 10 – CI Workflow: Typecheck, Lint, Test
Objetivo:
Configurar integración continua con GitHub Actions para validar el código automáticamente.

Archivo: .github/workflows/ci.yml

yaml
Copiar código
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build --if-present
      - run: npm run lint --if-present
      - run: npm test
Entregable:
Los workflows se ejecutan automáticamente en cada push o pull request, verificando build, lint y tests.

Recomendaciones generales
Utilizar ramas con el formato feature/<nombre-ticket>.

Cada integrante debe crear su PR indicando qué issue cierra (Closes #x).

Mantener commits claros y descriptivos.

Documentar cambios relevantes directamente en los PR.

Usar tipado estricto en TypeScript y comentarios JSDoc donde sea necesario.

Criterios de finalización del Sprint 0
API funcional localmente y en contenedor.

Pruebas unitarias ejecutadas con al menos 70% de cobertura.

Flujo de CI ejecutando correctamente typecheck, lint y tests.

Todos los tickets #1 al #10 cerrados en GitHub Projects.

Resultado esperado
Al finalizar este sprint, el equipo debe tener un backend funcional, tipado, con endpoints operativos, autenticación básica, logs estructurados, pruebas unitarias y pipeline CI/CD automatizado.


