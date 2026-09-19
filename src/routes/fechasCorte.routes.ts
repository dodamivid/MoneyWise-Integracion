import { Router } from "express";
import { fechasCorteController } from "../controllers/fechasCorte.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

/**
 * @fileoverview Rutas para Fechas de Corte de Ahorro (issue #91).
 *
 * `GET /dashboard/balance` siempre respondía 404 porque dependía de
 * `fechas_corte_ahorro`, pero no existía ningún endpoint para alimentarla
 * (los SPs `sp_fechasCorte_*` ya existían en el esquema, completos).
 *
 * Montado bajo `/api/v1/ahorro/fechas-corte`, como especifica el ticket
 * original (tickets/API_fechas_corte.md).
 */
const router = Router();

router.use(mockAuth);

router.get(
  "/fechas-corte",
  requireScope("ahorro:leer"),
  fechasCorteController.listar
);

router.post(
  "/fechas-corte",
  requireScope("ahorro:escribir"),
  fechasCorteController.crear
);

router.delete(
  "/fechas-corte/:id",
  requireScope("ahorro:escribir"),
  fechasCorteController.eliminar
);

export default router;
