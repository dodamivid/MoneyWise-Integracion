import express, { NextFunction, Request, Response } from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import catalogosRouter from "./routes/catalogos.routes";

const app = express();

// Basic config
app.disable("x-powered-by");
app.use(express.json());

// Root banner
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Routes
app.use("/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/v1/catalogos", catalogosRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

export default app;
