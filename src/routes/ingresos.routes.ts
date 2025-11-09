import { Router } from "express";
import * as ingresosController from "../controllers/ingresos.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

const router = Router();

// 🔐 Middleware base de autenticación simulada
router.use(mockAuth);

// 🔹 GET /api/v1/ingresos
router.get(
  "/",
  requireScope("ingresos:leer"),
  ingresosController.listar
);

// 🔹 POST /api/v1/ingresos
router.post(
  "/",
  requireScope("ingresos:escribir"),
  ingresosController.crear
);

// 🔹 GET /api/v1/ingresos/:id
router.get(
  "/:id",
  requireScope("ingresos:leer"),
  ingresosController.obtener
);

// 🔹 PATCH /api/v1/ingresos/:id
router.patch(
  "/:id",
  requireScope("ingresos:escribir"),
  ingresosController.actualizar
);

// 🔹 DELETE /api/v1/ingresos/:id
router.delete(
  "/:id",
  requireScope("ingresos:escribir"),
  ingresosController.eliminar
);

export default router;
