import express, { Request, Response } from "express";
import healthRouter from "./routes/health";
import usersRouter from "./routes/users.routes";
import egresosRouter from "./routes/egresos.routes";
import inversionesRouter from "./routes/inversiones.routes";
import versionRoutes from "./routes/version.routes";
import { db } from "./config/db";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.disable("x-powered-by");
app.use(express.json());

// Inicializa la conexión a BD si está habilitada
if (db.enabled) {
  db.init().catch((e) => console.error("DB init error:", e.message));
}

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "MoneyWise API" });
});

app.use("/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/v1/egresos", egresosRouter);
app.use("/api/v1/inversiones", inversionesRouter);
app.use("/api/v1/version", versionRoutes);

app.listen(port, () => {
  console.log(`MoneyWise API escuchando en puerto ${port}`);
});
