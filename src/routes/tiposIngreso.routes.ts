import { Router } from "express";
import { tiposIngresoController } from "../controllers/tiposIngreso.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

/**
 * @fileoverview Rutas para catálogo de Tipos de Ingreso.
 * Issue #77: movidas de `/api/v1/tipos-ingreso` (sin auth) a
 * `/api/v1/catalogos/tipos-ingreso`, con mockAuth + requireScope igual que
 * el resto de los catálogos (destinos, procedencias, tipos-egreso).
 */
const router = Router();

router.get(
  "/tipos-ingreso",
  mockAuth,
  requireScope("catalogos:leer"),
  tiposIngresoController.listarTiposIngreso
);

router.post(
  "/tipos-ingreso",
  mockAuth,
  requireScope("catalogos:escribir"),
  tiposIngresoController.crearTipoIngreso
);

router.put(
  "/tipos-ingreso/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  tiposIngresoController.actualizarTipoIngreso
);

router.delete(
  "/tipos-ingreso/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  tiposIngresoController.eliminarTipoIngreso
);

export default router;
