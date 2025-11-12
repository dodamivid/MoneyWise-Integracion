import express, { NextFunction, Request, Response } from "express";
import { db } from "./config/db";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import egresosRouter from "./routes/egresos.routes";
import ingresosRouter from "./routes/ingresos.routes";

// 🚀 Inicialización de Express
const app = express();
const port = Number(process.env.PORT ?? 3000);

// ⚙️ Configuración base
app.disable("x-powered-by");
app.use(express.json());


// 🗄️ Inicializa la conexión a BD si está habilitada
if (db.enabled) {
  db.init().catch((e) => console.error("DB init error:", e.message));
} else {
  console.warn("⚠️ Base de datos deshabilitada — corriendo en modo mock.");
}

// 🌐 Ruta raíz
app.get("/", (_req, res) => {
  res.json({ status: "success", message: "MoneyWise API" });
});

// 🩺 Health check
app.use("/health", healthRouter);

// 👥 Usuarios
app.use("/api/users", usersRouter);

// 💸 Egresos
app.use("/api/v1/egresos", egresosRouter);

// 💰 Ingresos
app.use("/api/v1/ingresos", ingresosRouter); // ✅ Colocado antes del export

// 🚫 Manejo de rutas inexistentes (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

// 💥 Manejador global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
});

export default app;
