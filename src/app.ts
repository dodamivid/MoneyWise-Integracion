import express, { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import egresosRouter from "./routes/egresos.routes";
import inversionesRouter from "./routes/inversiones.routes";
import metasRouter from "./routes/metas.routes";
import versionRoutes from "./routes/version.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import catalogosRoutes from "./routes/catalogos.routes";
import authRoutes from "./routes/auth.routes";
import { db } from "./config/db";
import {
  traceIdMiddleware,
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

const app = express();

// Middlewares de seguridad y parsing
app.use(traceIdMiddleware);
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Inicializar BD si está habilitada
if (db.enabled) {
  db.init().catch((e) => console.error("DB init error:", e.message));
}

// Root endpoint
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API", version: "1.0.0" });
});

// Swagger UI - carga dinámico para no romper si no están instaladas las dependencias
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerUi = require("swagger-ui-express");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const YAML = require("yaml");

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
    console.log(`✓ Swagger UI disponible en /docs`);
  }
} catch (e) {
  // Silenciar si swagger no está instalado; no debe romper la app
  // console.debug("Swagger no disponible:", (e as Error).message);
}

// Routes
app.use("/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/egresos", egresosRouter);
app.use("/api/v1/inversiones", inversionesRouter);
app.use("/api/v1/metas", metasRouter);
app.use("/api/v1/version", versionRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/catalogos", catalogosRoutes);

// Error handlers (orden importante)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;