import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

// Enrutador para endpoints de Dashboard (solo lectura)
const router = Router();

// Middleware de autenticación simulado y verificación de scope
router.use(mockAuth);

// GET /api/v1/dashboard/ (índice)
// Devuelve una lista simple de endpoints disponibles para evitar 404 en la raíz del módulo
router.get("/", (_req, res) => {
  res.json({
    ok: true,
    module: "dashboard",
    basePath: "/api/v1/dashboard",
    endpoints: [
      {
        method: "GET",
        path: "/resumen",
        query: ["desde (ISO)", "hasta (ISO)", "usuarioId (opcional)"],
        scope: "dashboard:leer",
      },
      {
        method: "GET",
        path: "/balance",
        query: ["desde (ISO)", "hasta (ISO)", "usuarioId (opcional)"],
        scope: "dashboard:leer",
      },
      {
        method: "GET",
        path: "/metas-vs-ahorro",
        query: ["desde (ISO)", "hasta (ISO)", "usuarioId (opcional)"],
        scope: "dashboard:leer",
      },
    ],
  });
});

// GET /api/v1/dashboard/resumen
router.get(
  "/resumen",
  requireScope("dashboard:leer"),
  dashboardController.getResumen
);

// GET /api/v1/dashboard/balance
router.get(
  "/balance",
  requireScope("dashboard:leer"),
  dashboardController.getBalance
);

// GET /api/v1/dashboard/metas-vs-ahorro
router.get(
  "/metas-vs-ahorro",
  requireScope("dashboard:leer"),
  dashboardController.getMetasVsAhorro
);

export default router;
