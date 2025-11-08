import express, { NextFunction, Request, Response } from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import fechasCorteRouter from "./routes/fechasCorte.routes";
// import egresosRouter from "./routes/egresos.routes"; // TODO: descomentar cuando main tenga este archivo
import { requestLogger, notFoundHandler, errorHandler } from "./middlewares/error.middleware";
// import { db } from "./config/db"; // TODO: descomentar cuando main tenga este archivo

// Boot the Express application
const app = express();
const port = Number(process.env.PORT ?? 3000);

// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express.json());
app.use(requestLogger);

// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Health check routes mounted under /health
app.use("/health", healthRouter);

// User routes mounted under /api/users
app.use("/api/users", usersRouter);

// Fechas de corte routes mounted under /api/v1/ahorro/fechas-corte
app.use("/api/v1/ahorro/fechas-corte", fechasCorteRouter);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;