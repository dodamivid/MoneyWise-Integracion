"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ingresos_controller_1 = require("../controllers/ingresos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.mockAuth);
/**
 * GET /api/v1/ingresos
 * Lista ingresos con filtros y paginacion
 * Scope requerido: ingresos:leer
 */
router.get("/", (0, auth_middleware_1.requireScope)("ingresos:leer"), ingresos_controller_1.ingresosController.listar.bind(ingresos_controller_1.ingresosController));
/**
 * POST /api/v1/ingresos
 * Crea un nuevo ingreso
 * Scope requerido: ingresos:escribir
 */
router.post("/", (0, auth_middleware_1.requireScope)("ingresos:escribir"), ingresos_controller_1.ingresosController.crear.bind(ingresos_controller_1.ingresosController));
/**
 * GET /api/v1/ingresos/:id
 * Obtiene un ingreso por ID
 * Scope requerido: ingresos:leer
 */
router.get("/:id", (0, auth_middleware_1.requireScope)("ingresos:leer"), ingresos_controller_1.ingresosController.obtener.bind(ingresos_controller_1.ingresosController));
/**
 * PATCH /api/v1/ingresos/:id
 * Actualiza un ingreso
 * Scope requerido: ingresos:escribir
 */
router.patch("/:id", (0, auth_middleware_1.requireScope)("ingresos:escribir"), ingresos_controller_1.ingresosController.actualizar.bind(ingresos_controller_1.ingresosController));
/**
 * DELETE /api/v1/ingresos/:id
 * Elimina un ingreso
 * Scope requerido: ingresos:escribir
 */
router.delete("/:id", (0, auth_middleware_1.requireScope)("ingresos:escribir"), ingresos_controller_1.ingresosController.eliminar.bind(ingresos_controller_1.ingresosController));
exports.default = router;
