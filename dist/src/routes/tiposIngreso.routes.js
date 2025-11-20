"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tiposIngreso_controller_1 = require("../controllers/tiposIngreso.controller");
// Importa tus middlewares de autenticación si los tienes
// import { authMiddleware } from '../middlewares/auth.middleware';
const router = (0, express_1.Router)();
const controller = new tiposIngreso_controller_1.TiposIngresoController();
/**
 * @route   GET /api/v1/tipos-ingreso
 * @desc    Listar tipos de ingreso con paginación
 * @access  Private (requiere JWT)
 */
router.get('/', controller.listar);
/**
 * @route   GET /api/v1/tipos-ingreso/:id
 * @desc    Obtener un tipo de ingreso por ID
 * @access  Private (requiere JWT)
 */
router.get('/:id', controller.obtenerPorId);
/**
 * @route   POST /api/v1/tipos-ingreso
 * @desc    Crear nuevo tipo de ingreso
 * @access  Private (requiere JWT + scope)
 */
router.post('/', controller.crear);
/**
 * @route   PATCH /api/v1/tipos-ingreso/:id
 * @desc    Actualizar tipo de ingreso
 * @access  Private (requiere JWT + scope)
 */
router.patch('/:id', controller.actualizar);
/**
 * @route   DELETE /api/v1/tipos-ingreso/:id
 * @desc    Eliminar tipo de ingreso (lógico)
 * @access  Private (requiere JWT + scope)
 */
router.delete('/:id', controller.eliminar);
exports.default = router;
