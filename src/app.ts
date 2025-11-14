import express, { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import catalogosRouter from "./routes/catalogos.routes";

const app = express();

// Basic config
app.disable("x-powered-by");
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Root banner
app.get("/", (_req, res) => {
  res.json({ message: "MoneyWise API" });
});

// Optional Swagger UI: carga solo si las dependencias y el spec existen
try {
  // intenta cargar dinámicamente las dependencias para no romper si no están instaladas
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerUi = require("swagger-ui-express");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const YAML = require("yaml");

  const candidates = [
    process.env.OPENAPI_PATH,
    path.join(process.cwd(), "docs", "api", "openapi.yaml"),
    path.join(process.cwd(), "docs", "api", "openapi.yml"),
  ].filter((p): p is string => !!p);

  const apiSpecPath = candidates.find((p) => fs.existsSync(p));
  if (apiSpecPath) {
    const file = fs.readFileSync(apiSpecPath, "utf8");
    const spec = YAML.parse(file);
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
    console.log(`Swagger UI disponible en /docs (spec: ${apiSpecPath})`);
  }
} catch (e) {
  // silenciar si swagger no está instalado o falla; no debe romper la app
  // console.debug("Swagger no cargado:", (e as Error).message);
}

// Routes
app.use("/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/v1/catalogos", catalogosRouter);

// 404 handler (debe ir después de las rutas)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    ok: false,
    status: "error",
    message: "Route not found",
  });
});

// Error handler (debe ir al final)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    status: "error",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

export default app;
