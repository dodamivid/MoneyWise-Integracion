import express, { NextFunction, Request, Response } from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import egresosRouter from "./routes/egresos.routes";
import { db } from "./config/db";

// Boot the Express application
const app = express();
const port = Number(process.env.PORT ?? 3000);

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