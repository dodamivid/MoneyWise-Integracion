import { Router } from "express";
import { catalogosController } from "../controllers/catalogos.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

/**
 * @fileoverview Rutas para catálogos (Destinos y Frecuencias)
 */

const router = Router();

// ============================================
// DESTINOS
// ============================================

router.get(
  "/destinos",
  mockAuth,
  requireScope("catalogos:leer"),
  catalogosController.listarDestinos.bind(catalogosController)
);

router.post(
  "/destinos",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.crearDestino.bind(catalogosController)
);

router.put(
  "/destinos/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.actualizarDestino.bind(catalogosController)
);

router.delete(
  "/destinos/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.eliminarDestino.bind(catalogosController)
);

// ============================================
// FRECUENCIAS
// ============================================

router.get(
  "/frecuencias",
  mockAuth,
  requireScope("catalogos:leer"),
  catalogosController.listarFrecuencias.bind(catalogosController)
);

router.post(
  "/frecuencias",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.crearFrecuencia.bind(catalogosController)
);

router.put(
  "/frecuencias/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.actualizarFrecuencia.bind(catalogosController)
);

router.delete(
  "/frecuencias/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.eliminarFrecuencia.bind(catalogosController)
);

export default router;