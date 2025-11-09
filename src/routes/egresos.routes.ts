import { Router } from "express";
import { egresosController } from "../controllers/egresos.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(mockAuth);

/**
 * GET /api/v1/egresos
 * Lista egresos con filtros y paginación
 * Scope requerido: egresos:leer
 */
router.get(
  "/",
  requireScope("egresos:leer"),
  egresosController.listar.bind(egresosController)
);

/**
 * POST /api/v1/egresos
 * Crea un nuevo egreso
 * Scope requerido: egresos:escribir
 */
router.post(
  "/",
  requireScope("egresos:escribir"),
  egresosController.crear.bind(egresosController)
);

/**
 * GET /api/v1/egresos/:id
 * Obtiene un egreso por ID
 * Scope requerido: egresos:leer
 */
router.get(
  "/:id",
  requireScope("egresos:leer"),
  egresosController.obtener.bind(egresosController)
);

/**
 * PATCH /api/v1/egresos/:id
 * Actualiza un egreso
 * Scope requerido: egresos:escribir
 */
router.patch(
  "/:id",
  requireScope("egresos:escribir"),
  egresosController.actualizar.bind(egresosController)
);

/**
 * DELETE /api/v1/egresos/:id
 * Elimina un egreso
 * Scope requerido: egresos:escribir
 */
router.delete(
  "/:id",
  requireScope("egresos:escribir"),
  egresosController.eliminar.bind(egresosController)
);

export default router;
