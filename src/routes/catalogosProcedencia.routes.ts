/**
 * Routes para Catálogos - Procedencias de Ingreso
 * Define los endpoints de la API
 * Fecha: 2025-10-31
 * Archivo: src/routes/catalogosProcedencia.routes.ts
 */

import { Router } from 'express';
import { CatalogosProcedenciaController } from '../controllers/catalogosProcedencia.controller';
import { verificarApiKey } from '../middlewares/api-key.middleware';
import { autenticar } from '../middlewares/auth.middleware';

const router = Router();
const controller = new CatalogosProcedenciaController();

/**
 * @route   GET /api/v1/catalogos/procedencias
 * @desc    Lista todas las procedencias del usuario con filtros y paginación
 * @access  Privado (JWT + scope catalogos:leer)
 * @query   buscar (opcional) - Término de búsqueda
 * @query   pagina (opcional, default: 1) - Número de página
 * @query   tamanoPagina (opcional, default: 20, max: 100) - Registros por página
 * @query   orden (opcional, default: nombre:asc) - Campo y dirección de ordenamiento
 */
router.get(
  '/procedencias',
  verificarApiKey,
  autenticar,
  controller.listarProcedencias
);

/**
 * @route   POST /api/v1/catalogos/procedencias
 * @desc    Crea una nueva procedencia de ingreso
 * @access  Privado (JWT + scope catalogos:escribir)
 * @body    nombre (requerido) - Nombre de la procedencia (3-100 caracteres)
 */
router.post(
  '/procedencias',
  verificarApiKey,
  autenticar,
  controller.crearProcedencia
);

/**
 * @route   PUT /api/v1/catalogos/procedencias/:id
 * @desc    Actualiza una procedencia existente
 * @access  Privado (JWT + scope catalogos:escribir)
 * @params  id (requerido) - ID de la procedencia a actualizar
 * @body    nombre (requerido) - Nuevo nombre de la procedencia (3-100 caracteres)
 */
router.put(
  '/procedencias/:id',
  verificarApiKey,
  autenticar,
  controller.actualizarProcedencia
);

/**
 * @route   DELETE /api/v1/catalogos/procedencias/:id
 * @desc    Elimina una procedencia (soft delete)
 * @access  Privado (JWT + scope catalogos:escribir)
 * @params  id (requerido) - ID de la procedencia a eliminar
 */
router.delete(
  '/procedencias/:id',
  verificarApiKey,
  autenticar,
  controller.eliminarProcedencia
);

export default router;