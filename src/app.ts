import express from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import {
  traceIdMiddleware,
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware";

// Boot the Express application
const app = express();
const port = Number(process.env.PORT ?? 3000);

// Middleware de traceId - DEBE ir primero para rastrear todas las requests
app.use(traceIdMiddleware);

// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express.json());

// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Health check routes mounted under /health
app.use("/health", healthRouter);

// User routes mounted under /api/users
app.use("/api/users", usersRouter);

// Manejador de rutas no encontradas (404) - DEBE ir después de todas las rutas
app.use(notFoundHandler);

// Manejador centralizado de errores - DEBE ir al final
app.use(errorHandler);

export default app;