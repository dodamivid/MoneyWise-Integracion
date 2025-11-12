// src/app.ts
import express, { NextFunction, Request, Response } from "express";
import { correlationIdMiddleware } from "./middlewares/correlationId";
import httpLogger from "./middlewares/logger";

import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";

const app = express();

// Configuración base
app.disable("x-powered-by");
app.use(express.json());

// Middlewares de observabilidad
app.use(correlationIdMiddleware);
app.use(httpLogger);

// Ruta raíz
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Health check
app.use("/health", healthRouter);

// Rutas de usuarios
app.use("/api/users", usersRouter);

// Manejo de rutas inexistentes (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    error: {
      codigo: "NOT_FOUND",
      mensaje: "Ruta no encontrada",
    },
  });
});

// Manejador global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    error: {
      codigo: "INTERNAL_ERROR",
      mensaje: "Error interno del servidor", // ← mensaje fijo según contrato OpenAPI
    },
  });
});

export default app;

