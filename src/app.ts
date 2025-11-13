import express from "express";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import egresosRouter from "./routes/egresos.routes";
import inversionesRouter from "./routes/inversiones.routes";
import metasRouter from "./routes/metas.routes";
import versionRoutes from "./routes/version.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { db } from "./config/db";
import { logger } from "./config/logger";
import {
  traceIdMiddleware,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

// Boot the Express application
const app = express();

// Middleware de traceId y logger - deben ir primero
app.use(traceIdMiddleware);
app.use(requestLogger);

// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express.json());

// Inicializa la conexión a BD si está habilitada
if (db.enabled) {
  db.init().catch((e) =>
    logger.error({ err: e, module: "db" }, "DB init error")
  );
}

// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Swagger UI (dev/build): leer docs/api/openapi.yaml desde la raíz del proyecto
try {
  const candidates = [
    process.env.OPENAPI_PATH,
    path.join(process.cwd(), "docs", "api", "openapi.yaml"),
    path.join(process.cwd(), "docs", "api", "openapi.yml"),
  ].filter((p): p is string => !!p);

  const apiSpecPath = candidates.find((p) => fs.existsSync(p));

  if (apiSpecPath) {
    const file = fs.readFileSync(apiSpecPath, "utf8");
    const spec = YAML.parse(file);
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
    logger.info({ specPath: apiSpecPath }, "Swagger UI disponible en /docs");
  } else {
    logger.warn({ triedPaths: candidates }, "Swagger UI no disponible: docs/api/openapi.yaml no encontrado");
  }
} catch (e: any) {
  logger.warn({ err: e }, "Swagger UI no disponible");
}

// Health check routes mounted under /health
app.use("/health", healthRouter);

// User routes mounted under /api/users
app.use("/api/users", usersRouter);

// Egresos routes mounted under /api/v1/egresos
app.use("/api/v1/egresos", egresosRouter);

// Inversiones routes mounted under /api/v1/inversiones
app.use("/api/v1/inversiones", inversionesRouter);

// Metas routes mounted under /api/v1/metas
app.use("/api/v1/metas", metasRouter);

// Version routes mounted under /api/v1/version
app.use("/api/v1/version", versionRoutes);

// Dashboard routes mounted under /api/v1/dashboard
app.use("/api/v1/dashboard", dashboardRoutes);

// Manejador de rutas no encontradas (404) - DEBE ir después de todas las rutas
app.use(notFoundHandler);

// Manejador centralizado de errores - DEBE ir al final
app.use(errorHandler);

export default app;

