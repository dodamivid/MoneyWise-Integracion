import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { apiKeyAuth } from "./middlewares/apiKeyAuth"; // ✅ middleware de autenticacióngit add .

import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";

// 🔹 Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();
const port = Number(process.env.PORT ?? 3000);

// Seguridad y parseo de JSON
app.disable("x-powered-by");
app.use(express.json());

// Ruta base (sin protección)
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// ✅ Aplica el middleware a rutas protegidas
app.use("/api", apiKeyAuth);

// Rutas del proyecto
app.use("/health", healthRouter);
app.use("/api/users", usersRouter);

// Manejo de rutas inexistentes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Manejador de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error inesperado:", err.message);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
  console.log(`🩺 Health check en http://localhost:${port}/health`);
  console.log(`👥 Users endpoint en http://localhost:${port}/api/users`);
});

export default app;
