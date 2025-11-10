import express from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import egresosRouter from "./routes/egresos.routes";
import inversionesRouter from "./routes/inversiones.routes";
import versionRoutes from "./routes/version.routes";
import { db } from "./config/db";
import {
  traceIdMiddleware,
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

// Boot the Express application
const app = express();

// Middleware de traceId - DEBE ir primero para rastrear todas las requests
app.use(traceIdMiddleware);

// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express.json());

// Inicializa la conexión a BD si está habilitada
if (db.enabled) {
  db.init().catch((e) => console.error("DB init error:", e.message));
}

// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Health check routes mounted under /health
app.use("/health", healthRouter);

// User routes mounted under /api/users
app.use("/api/users", usersRouter);

// Egresos routes mounted under /api/v1/egresos
app.use("/api/v1/egresos", egresosRouter);

// Inversiones routes mounted under /api/v1/inversiones
app.use("/api/v1/inversiones", inversionesRouter);

// Version routes mounted under /api/v1/version
app.use("/api/v1/version", versionRoutes);

// Manejador de rutas no encontradas (404) - DEBE ir después de todas las rutas
app.use(notFoundHandler);

// Manejador centralizado de errores - DEBE ir al final
app.use(errorHandler);

export default app;
