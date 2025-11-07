import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import dashboardRouter from "./routes/dashboard.routes";
import { db } from "./config/db";

// Boot the Express application
const app = express();
const port = Number(process.env.PORT ?? 3000);

// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express.json());

// Inicializa la conexión a BD si está habilitada
if (db.enabled) {
  // init ya es invocado en el módulo, pero forzamos para arrancar temprano
  db.init().catch((e) => console.error("DB init error:", e.message));
}

// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Swagger UI at /docs reading docs/api/openapi.yaml
try {
  const openapiPath = path.join(__dirname, "../docs/api/openapi.yaml");
  const file = fs.readFileSync(openapiPath, "utf8");
  const spec = yaml.load(file) as object;
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
} catch (e) {
  console.warn("Swagger UI no disponible:", (e as Error).message);
}

// Health check routes mounted under /health
app.use("/health", healthRouter);

// User routes mounted under /api/users
app.use("/api/users", usersRouter);

// Dashboard (read-only) routes mounted under /api/v1/dashboard
app.use("/api/v1/dashboard", dashboardRouter);

// Consistent JSON 404 for any route that is not defined
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Final error handler to catch unexpected failures
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export default app;