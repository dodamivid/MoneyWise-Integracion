import { Router } from "express";
import { catalogosProcedenciaController } from "../controllers/catalogosProcedencia.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/procedencias",
  mockAuth,
  requireScope("catalogos:leer"),
  catalogosProcedenciaController.listarProcedencias
);

router.post(
  "/procedencias",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosProcedenciaController.crearProcedencia
);

router.put(
  "/procedencias/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosProcedenciaController.actualizarProcedencia
);

router.delete(
  "/procedencias/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosProcedenciaController.eliminarProcedencia
);

export default router;
