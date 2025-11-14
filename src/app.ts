import express, { NextFunction, Request, Response } from "express";

// Rutas
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import catalogosRouter from "./routes/catalogos.routes";
import metasRouter from "./routes/metas.routes"; // ⭐ IMPORTANTE

const app = express();

// Config básica
app.disable("x-powered-by");
app.use(express.json());

// Root
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Montar rutas
app.use("/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/v1/catalogos", catalogosRouter);
app.use("/api/v1/metas", metasRouter); // ⭐ AQUÍ SE ARREGLA EL ERROR DE LOS TESTS

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
