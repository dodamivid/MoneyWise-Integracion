import express, { NextFunction, Request, Response } from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import catalogosRouter from "./routes/catalogos.routes";

// Boot the Express application
const app = express();
const port = Number(process.env.PORT ?? 3000);

// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging middleware (optional, pero muy útil)
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API", version: "1.0.0" });
});

// Health check routes mounted under /health
app.use("/health", healthRouter);

// User routes mounted under /api/users
app.use("/api/users", usersRouter);

// Catalog routes mounted under /api/v1/catalogos
app.use("/api/v1/catalogos", catalogosRouter);

// Consistent JSON 404 for any route that is not defined
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    status: "error",
    message: "Route not found",
  });
});

// Final error handler to catch unexpected failures
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({
    ok: false,
    status: "error",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

export default app;