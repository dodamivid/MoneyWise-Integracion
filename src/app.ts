import express, { NextFunction, Request, Response } from "express";
import { correlationIdMiddleware } from "./middlewares/correlationId";
import { httpLogger } from "./middlewares/logger";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";

const app = express();
const port = Number(process.env.PORT ?? 3000);

//  Configuración base
app.disable("x-powered-by"); //  Oculta el header para mayor seguridad
app.use(express.json());     //  Permite procesar cuerpos JSON

//  Middlewares de observabilidad
app.use(correlationIdMiddleware); //  Asigna un ID único a cada request
app.use(httpLogger);              //  Registra cada petición y su respuesta

//  Ruta raíz
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Health check
app.use("/health", healthRouter);

//  Rutas de usuarios
app.use("/api/users", usersRouter);

//  Manejo de rutas inexistentes (404)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

//  Manejador global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err); // Muestra el error en consola para debugging
  res.status(500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});

export default app;
