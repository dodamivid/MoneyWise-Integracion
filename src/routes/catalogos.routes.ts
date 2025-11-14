import { Router } from "express";
import { catalogosController } from "../controllers/catalogos.controller";
import { mockAuth, requireScope } from "../middlewares/auth.middleware";

/**
 * @fileoverview Rutas para el módulo de catálogos de destinos
 * Endpoints: GET, POST, PUT, DELETE /api/v1/catalogos/destinos
 */

const router = Router();

/**
 * GET /api/v1/catalogos/destinos
 * Lista destinos con paginación y filtros
 * 
 * Auth: JWT requerido
 * Scopes: catalogos:leer
 * 
 * Query params:
 * - buscar (opcional): Buscar por nombre
 * - pagina (opcional, default=1): Número de página
 * - tamanoPagina (opcional, default=20, max=100): Registros por página
 * - orden (opcional, default=nombre:asc): Campo de orden (nombre|creadoEn) + dirección (:asc|:desc)
 */
router.get(
  "/destinos",
  mockAuth,
  requireScope("catalogos:leer"),
  catalogosController.listarDestinos.bind(catalogosController)
);

/**
 * POST /api/v1/catalogos/destinos
 * Crea un nuevo destino
 * 
 * Auth: JWT requerido
 * Scopes: catalogos:escribir
 * 
 * Body:
 * {
 *   "nombre": "Suscripciones" // 3-100 caracteres
 * }
 */
router.post(
  "/destinos",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.crearDestino.bind(catalogosController)
);

/**
 * PUT /api/v1/catalogos/destinos/:id
 * Actualiza un destino existente
 * 
 * Auth: JWT requerido
 * Scopes: catalogos:escribir
 * 
 * Body:
 * {
 *   "nombre": "Gastos Médicos" // 3-100 caracteres
 * }
 */
router.put(
  "/destinos/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.actualizarDestino.bind(catalogosController)
);

/**
 * DELETE /api/v1/catalogos/destinos/:id
 * Elimina un destino (soft delete)
 * 
 * Auth: JWT requerido
 * Scopes: catalogos:escribir
 * 
 * Restricciones:
 * - No se pueden eliminar destinos por defecto
 * - Solo el propietario puede eliminar sus destinos
 */
router.delete(
  "/destinos/:id",
  mockAuth,
  requireScope("catalogos:escribir"),
  catalogosController.eliminarDestino.bind(catalogosController)
);

export default router;