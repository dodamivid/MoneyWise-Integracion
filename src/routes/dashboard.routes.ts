import { Router } from "express";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";
import { dashboardController } from "../controllers/dashboard.controller";

const router = Router();

// Autenticación simulada; en producción se reemplaza por middleware real JWT
router.use(mockAuth);

// GET /api/v1/dashboard/resumen
router.get(
  "/resumen",
  requireScope("dashboard:leer"),
  dashboardController.resumen
);

// GET /api/v1/dashboard/balance
router.get(
  "/balance",
  requireScope("dashboard:leer"),
  dashboardController.balance
);

// GET /api/v1/dashboard/metas-vs-ahorro
router.get(
  "/metas-vs-ahorro",
  requireScope("dashboard:leer"),
  dashboardController.metasVsAhorro
);

export default router;
