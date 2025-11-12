/**
 * @fileoverview Controlador de metas para manejar peticiones y respuestas HTTP.
 *
 * Este módulo implementa el patrón Controller, manejando la lógica específica de HTTP
 * como el análisis de peticiones, formateo de respuestas y gestión de códigos de estado.
 * Los controladores actúan como punto de entrada para las peticiones HTTP, delegando la
 * lógica de negocio a las capas de servicio.
 *
 * Responsabilidades clave:
 * - Manejo de peticiones/respuestas HTTP
 * - Extracción de entrada y validación básica
 * - Gestión de códigos de estado
 * - Propagación de errores al middleware de manejo de errores
 * - Formateo de respuestas usando DTOs
 * - Parseo de query params para filtros y paginación
 *
 * @module controllers/metas.controller
 * @category Controllers
 *
 * @example
 * ```typescript
 * import { Router } from 'express';
 * import { metasController } from './controllers/metas.controller';
 *
 * const router = Router();
 * router.get('/:id', metasController.getById);
 * router.get('/', metasController.getAll);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { metasService } from "../services/metas.service";
import {
  createMetaResponse,
  createMetasResponse,
  createCreateMetaResponse,
  createUpdateMetaResponse,
  createDeleteMetaResponse,
} from "../dtos/metas.dto";
import { MetaQueryParams } from "../models/meta.model";

/**
 * Clase controladora para los endpoints HTTP relacionados con metas.
 *
 * Esta clase contiene métodos manejadores para todas las rutas relacionadas con metas.
 * Cada método sigue la firma de middleware de Express (req, res, next).
 *
 * Todos los métodos están diseñados para ser usados como manejadores de rutas de Express y
 * siguen patrones async/await con propagación adecuada de errores al middleware de
 * manejo de errores.
 *
 * @class MetasController
 *
 * @example
 * ```typescript
 * const controller = new MetasController();
 *
 * // Usar en rutas de Express
 * app.get('/api/v1/metas/:id', controller.getById);
 * app.get('/api/v1/metas', controller.getAll);
 * ```
 */
export class MetasController {
  /**
   * Recupera un único meta por su ID.
   *
   * **Ruta**: GET /api/v1/metas/:id
   *
   * Este endpoint:
   * 1. Extrae el ID de la meta de los parámetros de ruta
   * 2. Llama al servicio para encontrar la meta
   * 3. Retorna una respuesta 200 con los datos de la meta si se encuentra
   * 4. Pasa los errores al middleware de manejo de errores
   *
   * **Respuesta Exitosa (200)**:
   * ```json
   * {
   *   "ok": true,
   *   "data": {
   *     "metaId": 7,
   *     "usuarioId": 23,
   *     "nombre": "Vacaciones 2026",
   *     "montoObjetivo": 150000.00,
   *     "ahorroReal": 35000.00,
   *     "porcentajeAvance": 23.33,
   *     "activa": true,
   *     "fechaInicio": "2025-01-01T00:00:00Z",
   *     "fechaFin": "2026-12-31T23:59:59Z",
   *     "creadoEn": "2025-01-05T10:45:00Z",
   *     "actualizadoEn": "2025-04-01T08:10:00Z"
   *   }
   * }
   * ```
   *
   * **Respuesta de Error (404)**:
   * ```json
   * {
   *   "ok": false,
   *   "error": {
   *     "codigo": "NO_ENCONTRADO",
   *     "mensaje": "Meta no encontrada",
   *     "statusCode": 404
   *   }
   * }
   * ```
   *
   * @async
   * @param {Request} req - Objeto de petición de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la meta
   * @param {Response} res - Objeto de respuesta de Express
   * @param {NextFunction} next - Función de siguiente middleware de Express
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Definición de ruta
   * router.get('/:id', metasController.getById);
   *
   * // Petición
   * GET /api/v1/metas/7
   *
   * // Respuesta (200 OK)
   * {
   *   "ok": true,
   *   "data": { ... }
   * }
   * ```
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extraer ID de la meta de los parámetros de ruta y convertir a número
      const metaId = parseInt(req.params.id, 10);

      // Validar que sea un número válido
      if (isNaN(metaId)) {
        throw new Error("ID de meta inválido");
      }

      // Llamar al servicio para encontrar la meta
      const meta = await metasService.findById(metaId);

      // Formatear respuesta usando DTO
      const response = createMetaResponse(meta);

      // Enviar respuesta exitosa
      res.status(200).json(response);
    } catch (error) {
      // Pasar error al middleware de manejo de errores
      next(error);
    }
  }

  /**
   * Recupera metas con filtros, paginación y ordenamiento.
   *
   * **Ruta**: GET /api/v1/metas
   *
   * Este endpoint:
   * 1. Extrae parámetros de query (filtros, paginación, ordenamiento)
   * 2. Llama al servicio para obtener las metas filtradas
   * 3. Retorna una respuesta 200 con un arreglo de metas y metadatos de paginación
   *
   * **Query Parameters**:
   * - `usuarioId` (number, opcional): Filtrar por usuario (solo admin)
   * - `desde` (string ISO, opcional): Fecha de inicio del rango
   * - `hasta` (string ISO, opcional): Fecha de fin del rango
   * - `activa` (boolean, opcional): Filtrar por estado activo
   * - `pagina` (number, default 1): Número de página
   * - `tamanoPagina` (number, default 20, max 100): Tamaño de página
   * - `orden` (string, opcional): Campo y dirección de ordenamiento
   *
   * **Respuesta Exitosa (200)**:
   * ```json
   * {
   *   "ok": true,
   *   "data": [
   *     {
   *       "metaId": 7,
   *       "usuarioId": 23,
   *       "nombre": "Vacaciones 2026",
   *       "montoObjetivo": 150000.00,
   *       "ahorroReal": 35000.00,
   *       "porcentajeAvance": 23.33,
   *       "activa": true,
   *       "fechaInicio": "2025-01-01T00:00:00Z",
   *       "fechaFin": "2026-12-31T23:59:59Z",
   *       "creadoEn": "2025-01-05T10:45:00Z",
   *       "actualizadoEn": "2025-04-01T08:10:00Z"
   *     }
   *   ],
   *   "meta": {
   *     "paginacion": {
   *       "pagina": 1,
   *       "tamanoPagina": 20,
   *       "total": 1
   *     }
   *   }
   * }
   * ```
   *
   * @async
   * @param {Request} req - Objeto de petición de Express
   * @param {Object} req.query - Parámetros de query
   * @param {Response} res - Objeto de respuesta de Express
   * @param {NextFunction} next - Función de siguiente middleware de Express
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Definición de ruta
   * router.get('/', metasController.getAll);
   *
   * // Petición
   * GET /api/v1/metas?usuarioId=23&activa=true&pagina=1&tamanoPagina=20&orden=fechaInicio:desc
   *
   * // Respuesta (200 OK)
   * {
   *   "ok": true,
   *   "data": [...],
   *   "meta": { "paginacion": { ... } }
   * }
   * ```
   */
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extraer y parsear parámetros de query
      const queryParams: Partial<MetaQueryParams> = {
        ...(req.query.usuarioId && {
          usuarioId: parseInt(req.query.usuarioId as string, 10),
        }),
        ...(req.query.desde && { desde: req.query.desde as string }),
        ...(req.query.hasta && { hasta: req.query.hasta as string }),
        ...(req.query.activa !== undefined && {
          activa: req.query.activa === "true",
        }),
        pagina: req.query.pagina
          ? parseInt(req.query.pagina as string, 10)
          : 1,
        tamanoPagina: req.query.tamanoPagina
          ? parseInt(req.query.tamanoPagina as string, 10)
          : 20,
        ...(req.query.orden && { orden: req.query.orden as string }),
      };

      // Llamar al servicio para obtener las metas
      const result = await metasService.findAll(queryParams as MetaQueryParams);

      // Formatear respuesta usando DTO
      const response = createMetasResponse(result.metas, {
        pagina: queryParams.pagina!,
        tamanoPagina: queryParams.tamanoPagina!,
        total: result.total,
      });

      // Enviar respuesta exitosa
      res.status(200).json(response);
    } catch (error) {
      // Pasar error al middleware de manejo de errores
      next(error);
    }
  }

  /**
   * Crea una nueva meta en el sistema.
   *
   * **Ruta**: POST /api/v1/metas
   *
   * Este endpoint:
   * 1. Extrae los datos de la meta del cuerpo de la petición
   * 2. Llama al servicio para crear la meta (incluye validación)
   * 3. Retorna una respuesta 201 con el ID de la meta creada
   *
   * **Cuerpo de la Petición**:
   * ```json
   * {
   *   "usuarioId": 23,
   *   "nombre": "Vacaciones 2026",
   *   "montoObjetivo": 150000.00,
   *   "fechaInicio": "2025-01-01T00:00:00Z",
   *   "fechaFin": "2026-12-31T23:59:59Z",
   *   "activa": true
   * }
   * ```
   *
   * **Respuesta Exitosa (201)**:
   * ```json
   * {
   *   "ok": true,
   *   "data": {
   *     "metaId": 7
   *   }
   * }
   * ```
   *
   * **Respuesta de Error (422)**:
   * ```json
   * {
   *   "ok": false,
   *   "error": {
   *     "codigo": "DATOS_INVALIDOS",
   *     "mensaje": "El monto objetivo debe ser mayor a 0",
   *     "statusCode": 422
   *   }
   * }
   * ```
   *
   * @async
   * @param {Request} req - Objeto de petición de Express
   * @param {Object} req.body - Datos de creación de la meta
   * @param {Response} res - Objeto de respuesta de Express
   * @param {NextFunction} next - Función de siguiente middleware de Express
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Definición de ruta
   * router.post('/', metasController.create);
   *
   * // Petición
   * POST /api/v1/metas
   * Content-Type: application/json
   * {
   *   "usuarioId": 23,
   *   "nombre": "Vacaciones 2026",
   *   "montoObjetivo": 150000.00,
   *   "fechaInicio": "2025-01-01T00:00:00Z"
   * }
   * ```
   */
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extraer datos de la meta del cuerpo de la petición
      const metaData = req.body;

      // Llamar al servicio para crear la meta (incluye validación)
      const metaId = await metasService.create(metaData);

      // Formatear respuesta usando DTO
      const response = createCreateMetaResponse(metaId);

      // Enviar respuesta exitosa con estado 201
      res.status(201).json(response);
    } catch (error) {
      // Pasar error al middleware de manejo de errores
      next(error);
    }
  }

  /**
   * Actualiza la información de una meta existente.
   *
   * **Ruta**: PATCH /api/v1/metas/:id
   *
   * Este endpoint:
   * 1. Extrae el ID de la meta de los parámetros de ruta
   * 2. Extrae los datos de actualización del cuerpo de la petición
   * 3. Llama al servicio para actualizar la meta
   * 4. Retorna una respuesta 200 confirmando la actualización
   *
   * **Cuerpo de la Petición** (todos los campos opcionales):
   * ```json
   * {
   *   "nombre": "Vacaciones Europa 2026",
   *   "montoObjetivo": 200000.00,
   *   "ahorroReal": 50000.00,
   *   "fechaInicio": "2025-01-01T00:00:00Z",
   *   "fechaFin": "2026-12-31T23:59:59Z",
   *   "activa": true
   * }
   * ```
   *
   * **Respuesta Exitosa (200)**:
   * ```json
   * {
   *   "ok": true,
   *   "data": {
   *     "actualizado": true
   *   }
   * }
   * ```
   *
   * **Respuesta de Error (404)**:
   * ```json
   * {
   *   "ok": false,
   *   "error": {
   *     "codigo": "NO_ENCONTRADO",
   *     "mensaje": "Meta no encontrada",
   *     "statusCode": 404
   *   }
   * }
   * ```
   *
   * @async
   * @param {Request} req - Objeto de petición de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la meta
   * @param {Object} req.body - Datos de actualización
   * @param {Response} res - Objeto de respuesta de Express
   * @param {NextFunction} next - Función de siguiente middleware de Express
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Definición de ruta
   * router.patch('/:id', metasController.update);
   *
   * // Petición
   * PATCH /api/v1/metas/7
   * Content-Type: application/json
   * {
   *   "ahorroReal": 50000.00
   * }
   * ```
   */
  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extraer ID de la meta y convertir a número
      const metaId = parseInt(req.params.id, 10);

      // Validar que sea un número válido
      if (isNaN(metaId)) {
        throw new Error("ID de meta inválido");
      }

      // Extraer datos de actualización
      const updateData = req.body;

      // TODO: Determinar si el usuario es admin desde JWT/session
      // Por ahora, asumimos que no es admin
      const isAdmin = false;

      // Llamar al servicio para actualizar la meta
      const actualizado = await metasService.update(metaId, updateData, isAdmin);

      // Formatear respuesta usando DTO
      const response = createUpdateMetaResponse(actualizado);

      // Enviar respuesta exitosa
      res.status(200).json(response);
    } catch (error) {
      // Pasar error al middleware de manejo de errores
      next(error);
    }
  }

  /**
   * Elimina una meta del sistema (soft delete).
   *
   * **Ruta**: DELETE /api/v1/metas/:id
   *
   * Este endpoint:
   * 1. Extrae el ID de la meta de los parámetros de ruta
   * 2. Extrae el usuarioId del cuerpo o de autenticación JWT
   * 3. Llama al servicio para eliminar la meta (soft delete)
   * 4. Retorna una respuesta 200 confirmando la eliminación
   *
   * **Respuesta Exitosa (200)**:
   * ```json
   * {
   *   "ok": true,
   *   "data": {
   *     "eliminado": true
   *   }
   * }
   * ```
   *
   * **Respuesta de Error (404)**:
   * ```json
   * {
   *   "ok": false,
   *   "error": {
   *     "codigo": "NO_ENCONTRADO",
   *     "mensaje": "Meta no encontrada",
   *     "statusCode": 404
   *   }
   * }
   * ```
   *
   * **Respuesta de Error (403)**:
   * ```json
   * {
   *   "ok": false,
   *   "error": {
   *     "codigo": "PERMISO_DENEGADO",
   *     "mensaje": "No tiene permisos para eliminar esta meta",
   *     "statusCode": 403
   *   }
   * }
   * ```
   *
   * @async
   * @param {Request} req - Objeto de petición de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la meta
   * @param {Response} res - Objeto de respuesta de Express
   * @param {NextFunction} next - Función de siguiente middleware de Express
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Definición de ruta
   * router.delete('/:id', metasController.delete);
   *
   * // Petición
   * DELETE /api/v1/metas/7
   *
   * // Respuesta (200 OK)
   * {
   *   "ok": true,
   *   "data": {
   *     "eliminado": true
   *   }
   * }
   * ```
   */
  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extraer ID de la meta y convertir a número
      const metaId = parseInt(req.params.id, 10);

      // Validar que sea un número válido
      if (isNaN(metaId)) {
        throw new Error("ID de meta inválido");
      }

      // TODO: Extraer usuarioId del JWT/session
      // Por ahora, se espera que venga en el body o se obtenga de autenticación
      const usuarioId = req.body.usuarioId || (req as any).user?.id;

      if (!usuarioId) {
        throw new Error("Usuario no autenticado");
      }

      // Llamar al servicio para eliminar la meta
      const eliminado = await metasService.delete(metaId, usuarioId);

      // Formatear respuesta usando DTO
      const response = createDeleteMetaResponse(eliminado);

      // Enviar respuesta exitosa
      res.status(200).json(response);
    } catch (error) {
      // Pasar error al middleware de manejo de errores
      next(error);
    }
  }
}

/**
 * Instancia singleton de MetasController.
 *
 * Esta instancia se usa en toda la aplicación para manejar peticiones
 * HTTP relacionadas con metas. Usar un singleton asegura comportamiento
 * consistente y facilita la inyección de dependencias si se necesita en el futuro.
 *
 * @constant
 * @type {MetasController}
 *
 * @example
 * ```typescript
 * import { Router } from 'express';
 * import { metasController } from './controllers/metas.controller';
 *
 * const router = Router();
 *
 * // Definir rutas
 * router.get('/:id', metasController.getById);
 * router.get('/', metasController.getAll);
 * router.post('/', metasController.create);
 * router.patch('/:id', metasController.update);
 * router.delete('/:id', metasController.delete);
 *
 * export default router;
 * ```
 */
export const metasController = new MetasController();
