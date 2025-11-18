"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const egresos_controller_1 = require("../controllers/egresos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Aplicar middleware de autenticación a todas las rutas
router.use(auth_middleware_1.mockAuth);
/**
 * GET /api/v1/egresos
 * Lista egresos con filtros y paginación
 * Scope requerido: egresos:leer
 */
router.get("/", (0, auth_middleware_1.requireScope)("egresos:leer"), egresos_controller_1.egresosController.listar.bind(egresos_controller_1.egresosController));
/**
 * POST /api/v1/egresos
 * Crea un nuevo egreso
 * Scope requerido: egresos:escribir
 */
router.post("/", (0, auth_middleware_1.requireScope)("egresos:escribir"), egresos_controller_1.egresosController.crear.bind(egresos_controller_1.egresosController));
/**
 * GET /api/v1/egresos/:id
 * Obtiene un egreso por ID
 * Scope requerido: egresos:leer
 */
router.get("/:id", (0, auth_middleware_1.requireScope)("egresos:leer"), egresos_controller_1.egresosController.obtener.bind(egresos_controller_1.egresosController));
/**
 * PATCH /api/v1/egresos/:id
 * Actualiza un egreso
 * Scope requerido: egresos:escribir
 */
router.patch("/:id", (0, auth_middleware_1.requireScope)("egresos:escribir"), egresos_controller_1.egresosController.actualizar.bind(egresos_controller_1.egresosController));
/**
 * DELETE /api/v1/egresos/:id
 * Elimina un egreso
 * Scope requerido: egresos:escribir
 */
router.delete("/:id", (0, auth_middleware_1.requireScope)("egresos:escribir"), egresos_controller_1.egresosController.eliminar.bind(egresos_controller_1.egresosController));
exports.default = router;
