"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalogos_controller_1 = require("../controllers/catalogos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
/**
 * @fileoverview Rutas para catálogos (Destinos y Frecuencias)
 */
const router = (0, express_1.Router)();
// ============================================
// DESTINOS
// ============================================
router.get("/destinos", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:leer"), catalogos_controller_1.catalogosController.listarDestinos.bind(catalogos_controller_1.catalogosController));
router.post("/destinos", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:escribir"), catalogos_controller_1.catalogosController.crearDestino.bind(catalogos_controller_1.catalogosController));
router.put("/destinos/:id", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:escribir"), catalogos_controller_1.catalogosController.actualizarDestino.bind(catalogos_controller_1.catalogosController));
router.delete("/destinos/:id", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:escribir"), catalogos_controller_1.catalogosController.eliminarDestino.bind(catalogos_controller_1.catalogosController));
// ============================================
// FRECUENCIAS
// ============================================
router.get("/frecuencias", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:leer"), catalogos_controller_1.catalogosController.listarFrecuencias.bind(catalogos_controller_1.catalogosController));
router.post("/frecuencias", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:escribir"), catalogos_controller_1.catalogosController.crearFrecuencia.bind(catalogos_controller_1.catalogosController));
router.put("/frecuencias/:id", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:escribir"), catalogos_controller_1.catalogosController.actualizarFrecuencia.bind(catalogos_controller_1.catalogosController));
router.delete("/frecuencias/:id", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("catalogos:escribir"), catalogos_controller_1.catalogosController.eliminarFrecuencia.bind(catalogos_controller_1.catalogosController));
exports.default = router;
