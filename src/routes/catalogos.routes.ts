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
// A diferencia de destinos/procedencias/tipos, `frecuencias` es un catálogo
// GLOBAL e inmutable para usuarios finales: es un enum de calendario cerrado
// (Diario, Semanal, Quincenal, ...) sin columna `usuario_id`. Cualquier alta,
// edición o baja afecta a todos los usuarios, por lo que la escritura queda
// reservada al scope `admin:catalogos`. La lectura sigue siendo `catalogos:leer`.
// Ver docs/api/catalogos.md e issue #68.

router.get(
  "/frecuencias",
  mockAuth,
  requireScope("catalogos:leer"),
  catalogosController.listarFrecuencias.bind(catalogosController)
);

router.post(
  "/frecuencias",
  mockAuth,
  requireScope("admin:catalogos"),
  catalogosController.crearFrecuencia.bind(catalogosController)
);

router.put(
  "/frecuencias/:id",
  mockAuth,
  requireScope("admin:catalogos"),
  catalogosController.actualizarFrecuencia.bind(catalogosController)
);

router.delete(
  "/frecuencias/:id",
  mockAuth,
  requireScope("admin:catalogos"),
  catalogosController.eliminarFrecuencia.bind(catalogosController)
);

export default router;