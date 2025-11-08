<<<<<<< HEAD
import express, { NextFunction, Request, Response } from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes"; 
=======
import app from './app';
>>>>>>> 805c8c2129ee344a2e22d655dbbd75e60aa19f9b

const port = Number(process.env.PORT ?? 3000);

<<<<<<< HEAD
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

// Start the HTTP server
=======
>>>>>>> 805c8c2129ee344a2e22d655dbbd75e60aa19f9b
app.listen(port, () => {
  console.log(`MoneyWise API running at http://localhost:${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
  console.log(`Users endpoint available at http://localhost:${port}/api/users`);
});