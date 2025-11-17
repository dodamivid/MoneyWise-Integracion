import { Router } from "express";
import { ingresosController } from "../controllers/ingresos.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

const router = Router();

router.use(mockAuth);

/**
 * GET /api/v1/ingresos
 * Lista ingresos con filtros y paginacion
 * Scope requerido: ingresos:leer
 */
router.get(
  "/",
  requireScope("ingresos:leer"),
  ingresosController.listar.bind(ingresosController)
);

/**
 * POST /api/v1/ingresos
 * Crea un nuevo ingreso
 * Scope requerido: ingresos:escribir
 */
router.post(
  "/",
  requireScope("ingresos:escribir"),
  ingresosController.crear.bind(ingresosController)
);

/**
 * GET /api/v1/ingresos/:id
 * Obtiene un ingreso por ID
 * Scope requerido: ingresos:leer
 */
router.get(
  "/:id",
  requireScope("ingresos:leer"),
  ingresosController.obtener.bind(ingresosController)
);

/**
 * PATCH /api/v1/ingresos/:id
 * Actualiza un ingreso
 * Scope requerido: ingresos:escribir
 */
router.patch(
  "/:id",
  requireScope("ingresos:escribir"),
  ingresosController.actualizar.bind(ingresosController)
);

/**
 * DELETE /api/v1/ingresos/:id
 * Elimina un ingreso
 * Scope requerido: ingresos:escribir
 */
router.delete(
  "/:id",
  requireScope("ingresos:escribir"),
  ingresosController.eliminar.bind(ingresosController)
);

export default router;
