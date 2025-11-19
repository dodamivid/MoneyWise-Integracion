import { Router } from "express";
import { tiposEgresoController } from "../controllers/tiposEgreso.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/tipos-egreso",
  mockAuth,
  requireScope("catalogos:leer"),
  tiposEgresoController.listarTiposEgreso
);

router.post(
  "/tipos-egreso",
  mockAuth,
  requireScope("catalogos:escribir"),
  tiposEgresoController.crearTipoEgreso
);

router.put(
  "/tipos-egreso/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  tiposEgresoController.actualizarTipoEgreso
);

router.delete(
  "/tipos-egreso/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  tiposEgresoController.eliminarTipoEgreso
);

export default router;
