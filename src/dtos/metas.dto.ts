/**
 * @fileoverview Objetos de Transferencia de Datos (DTOs) para respuestas de la API de Metas.
 *
 * Este módulo define la estructura de las respuestas de la API para operaciones relacionadas con metas.
 * Los DTOs aseguran formatos de respuesta consistentes en todos los endpoints y separan
 * el modelo de datos interno del contrato de la API.
 *
 * Características clave:
 * - Estructura de respuesta consistente usando formato { ok, data, meta }
 * - Inclusión de metadatos de paginación para listados
 * - Creación de respuestas con seguridad de tipos
 * - Respuestas de error estandarizadas
 *
 * @module dtos/metas.dto
 * @category DTOs
 *
 * @example
 * ```typescript
 * import { MetaResponseDTO, createMetaResponse } from './dtos/metas.dto';
 *
 * const meta = await metaService.findById(id);
 * const response = createMetaResponse(meta);
 * res.json(response);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import { Meta } from "../models/meta.model";

/**
 * Estructura de datos de meta para respuestas de la API.
 *
 * Esta interfaz define los datos de meta que se envían a los clientes.
 * Incluye todos los campos del modelo Meta.
 *
 * @interface MetaData
 *
 * @property {number} metaId - Identificador único de la meta
 * @property {number} usuarioId - ID del usuario propietario
 * @property {string} nombre - Nombre descriptivo de la meta
 * @property {number} montoObjetivo - Cantidad objetivo a ahorrar
 * @property {number} ahorroReal - Cantidad ahorrada actualmente
 * @property {number} porcentajeAvance - Porcentaje de progreso (0-100+)
 * @property {boolean} activa - Si la meta está activa
 * @property {string} fechaInicio - Fecha de inicio (ISO 8601)
 * @property {string} [fechaFin] - Fecha objetivo (ISO 8601, opcional)
 * @property {string} creadoEn - Cuándo se creó la meta (ISO 8601)
 * @property {string} actualizadoEn - Cuándo se actualizó la meta por última vez (ISO 8601)
 *
 * @example
 * ```typescript
 * const metaData: MetaData = {
 *   metaId: 7,
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   ahorroReal: 35000.00,
 *   porcentajeAvance: 23.33,
 *   activa: true,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   creadoEn: '2025-01-05T10:45:00Z',
 *   actualizadoEn: '2025-04-01T08:10:00Z'
 * };
 * ```
 */
export interface MetaData {
  metaId: number;
  usuarioId: number;
  nombre: string;
  montoObjetivo: number;
  ahorroReal: number;
  porcentajeAvance: number;
  activa: boolean;
  fechaInicio: string;
  fechaFin?: string;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Estructura estándar para respuestas exitosas de la API que contienen una meta.
 *
 * Esta interfaz asegura que todas las respuestas exitosas relacionadas con metas sigan
 * el mismo formato, facilitando el análisis de respuestas para los clientes.
 *
 * @interface MetaResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {MetaData} data - Los datos de la meta
 *
 * @example
 * ```typescript
 * const response: MetaResponseDTO = {
 *   ok: true,
 *   data: {
 *     metaId: 7,
 *     usuarioId: 23,
 *     nombre: 'Vacaciones 2026',
 *     montoObjetivo: 150000.00,
 *     ahorroReal: 35000.00,
 *     porcentajeAvance: 23.33,
 *     activa: true,
 *     fechaInicio: '2025-01-01T00:00:00Z',
 *     fechaFin: '2026-12-31T23:59:59Z',
 *     creadoEn: '2025-01-05T10:45:00Z',
 *     actualizadoEn: '2025-04-01T08:10:00Z'
 *   }
 * };
 * ```
 */
export interface MetaResponseDTO {
  ok: true;
  data: MetaData;
}

/**
 * Metadatos de paginación para respuestas de listado de metas.
 *
 * @interface PaginacionMeta
 *
 * @property {number} pagina - Número de página actual (base 1)
 * @property {number} tamanoPagina - Cantidad de elementos por página
 * @property {number} total - Número total de elementos disponibles
 *
 * @example
 * ```typescript
 * const paginacion: PaginacionMeta = {
 *   pagina: 1,
 *   tamanoPagina: 20,
 *   total: 45
 * };
 * ```
 */
export interface PaginacionMeta {
  pagina: number;
  tamanoPagina: number;
  total: number;
}

/**
 * Estructura estándar para respuestas exitosas de la API que contienen múltiples metas.
 *
 * Se usa cuando se retornan listas de metas (ej. resultados de búsqueda, listas paginadas).
 * Incluye metadatos de paginación.
 *
 * @interface MetasResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {MetaData[]} data - Arreglo de objetos de datos de meta
 * @property {Object} meta - Metadatos sobre la respuesta
 * @property {PaginacionMeta} meta.paginacion - Información de paginación
 *
 * @example
 * ```typescript
 * const response: MetasResponseDTO = {
 *   ok: true,
 *   data: [
 *     {
 *       metaId: 7,
 *       usuarioId: 23,
 *       nombre: 'Vacaciones 2026',
 *       montoObjetivo: 150000.00,
 *       ahorroReal: 35000.00,
 *       porcentajeAvance: 23.33,
 *       activa: true,
 *       fechaInicio: '2025-01-01T00:00:00Z',
 *       fechaFin: '2026-12-31T23:59:59Z',
 *       creadoEn: '2025-01-05T10:45:00Z',
 *       actualizadoEn: '2025-04-01T08:10:00Z'
 *     }
 *   ],
 *   meta: {
 *     paginacion: {
 *       pagina: 1,
 *       tamanoPagina: 20,
 *       total: 1
 *     }
 *   }
 * };
 * ```
 */
export interface MetasResponseDTO {
  ok: true;
  data: MetaData[];
  meta: {
    paginacion: PaginacionMeta;
  };
}

/**
 * Estructura para respuesta de creación de meta.
 *
 * Retorna el ID de la meta recién creada.
 *
 * @interface CreateMetaResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {Object} data - Datos de respuesta
 * @property {number} data.metaId - ID de la meta creada
 *
 * @example
 * ```typescript
 * const response: CreateMetaResponseDTO = {
 *   ok: true,
 *   data: {
 *     metaId: 7
 *   }
 * };
 * ```
 */
export interface CreateMetaResponseDTO {
  ok: true;
  data: {
    metaId: number;
  };
}

/**
 * Estructura para respuesta de actualización de meta.
 *
 * Indica si la actualización fue exitosa.
 *
 * @interface UpdateMetaResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {Object} data - Datos de respuesta
 * @property {boolean} data.actualizado - Indica si se actualizó correctamente
 *
 * @example
 * ```typescript
 * const response: UpdateMetaResponseDTO = {
 *   ok: true,
 *   data: {
 *     actualizado: true
 *   }
 * };
 * ```
 */
export interface UpdateMetaResponseDTO {
  ok: true;
  data: {
    actualizado: boolean;
  };
}

/**
 * Estructura para respuesta de eliminación de meta.
 *
 * Indica si la eliminación fue exitosa.
 *
 * @interface DeleteMetaResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {Object} data - Datos de respuesta
 * @property {boolean} data.eliminado - Indica si se eliminó correctamente
 *
 * @example
 * ```typescript
 * const response: DeleteMetaResponseDTO = {
 *   ok: true,
 *   data: {
 *     eliminado: true
 *   }
 * };
 * ```
 */
export interface DeleteMetaResponseDTO {
  ok: true;
  data: {
    eliminado: boolean;
  };
}

/**
 * Estructura estándar para respuestas de error de la API de metas.
 *
 * Esta interfaz asegura que todas las respuestas de error sigan el mismo formato,
 * haciendo el manejo de errores consistente y predecible para los clientes de la API.
 *
 * @interface MetaErrorResponseDTO
 *
 * @property {false} ok - Siempre false para respuestas de error
 * @property {Object} error - Detalles del error
 * @property {string} error.codigo - Código de error (ej. 'NO_ENCONTRADO', 'DATOS_INVALIDOS')
 * @property {string} error.mensaje - Mensaje de error legible para humanos
 * @property {number} [error.statusCode] - Código de estado HTTP (ej. 404, 422, 500)
 * @property {Object} [error.detalles] - Detalles adicionales opcionales del error
 *
 * @example
 * ```typescript
 * // Error simple
 * const errorResponse: MetaErrorResponseDTO = {
 *   ok: false,
 *   error: {
 *     codigo: 'NO_ENCONTRADO',
 *     mensaje: 'Meta no encontrada',
 *     statusCode: 404
 *   }
 * };
 *
 * // Error con detalles
 * const validationError: MetaErrorResponseDTO = {
 *   ok: false,
 *   error: {
 *     codigo: 'DATOS_INVALIDOS',
 *     mensaje: 'Validación fallida',
 *     statusCode: 422,
 *     detalles: {
 *       campo: 'montoObjetivo',
 *       razon: 'Debe ser mayor a 0'
 *     }
 *   }
 * };
 * ```
 */
export interface MetaErrorResponseDTO {
  ok: false;
  error: {
    codigo: string;
    mensaje: string;
    statusCode?: number;
    detalles?: Record<string, any>;
  };
}

/**
 * Convierte un modelo Meta a DTO MetaData.
 *
 * Esta función convierte el objeto de meta del modelo interno al formato
 * esperado por la API. Actualmente no hay transformaciones especiales,
 * pero esta función proporciona un punto de extensión para futuras necesidades.
 *
 * @function toMetaData
 * @param {Meta} meta - El objeto del modelo de meta
 * @returns {MetaData} Datos de meta para respuestas de la API
 *
 * @example
 * ```typescript
 * const meta: Meta = {
 *   metaId: 7,
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   ahorroReal: 35000.00,
 *   porcentajeAvance: 23.33,
 *   activa: true,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   creadoEn: '2025-01-05T10:45:00Z',
 *   actualizadoEn: '2025-04-01T08:10:00Z'
 * };
 *
 * const metaData = toMetaData(meta);
 * ```
 */
export function toMetaData(meta: Meta): MetaData {
  return {
    metaId: meta.metaId,
    usuarioId: meta.usuarioId,
    nombre: meta.nombre,
    montoObjetivo: meta.montoObjetivo,
    ahorroReal: meta.ahorroReal,
    porcentajeAvance: meta.porcentajeAvance,
    activa: meta.activa,
    fechaInicio: meta.fechaInicio,
    ...(meta.fechaFin && { fechaFin: meta.fechaFin }),
    creadoEn: meta.creadoEn,
    actualizadoEn: meta.actualizadoEn,
  };
}

/**
 * Crea una respuesta de éxito estandarizada para una única meta.
 *
 * Esta función envuelve los datos de meta en el formato de respuesta estándar de la API,
 * asegurando consistencia en todos los endpoints que retornan datos de meta.
 *
 * @function createMetaResponse
 * @param {Meta} meta - El objeto del modelo de meta
 * @returns {MetaResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const meta = await metaService.findById(metaId);
 * const response = createMetaResponse(meta);
 * res.status(200).json(response);
 * // Respuesta:
 * // {
 * //   ok: true,
 * //   data: { metaId, usuarioId, nombre, montoObjetivo, ... }
 * // }
 * ```
 */
export function createMetaResponse(meta: Meta): MetaResponseDTO {
  return {
    ok: true,
    data: toMetaData(meta),
  };
}

/**
 * Crea una respuesta de éxito estandarizada para múltiples metas.
 *
 * Esta función envuelve un arreglo de datos de meta en el formato de respuesta estándar de la API,
 * con metadatos de paginación.
 *
 * @function createMetasResponse
 * @param {Meta[]} metas - Arreglo de objetos del modelo de meta
 * @param {PaginacionMeta} paginacion - Información de paginación
 * @returns {MetasResponseDTO} Respuesta de API formateada con lista de metas
 *
 * @example
 * ```typescript
 * const metas = await metaService.findAll({ pagina: 1, tamanoPagina: 20 });
 * const response = createMetasResponse(metas, {
 *   pagina: 1,
 *   tamanoPagina: 20,
 *   total: 45
 * });
 *
 * res.status(200).json(response);
 * ```
 */
export function createMetasResponse(
  metas: Meta[],
  paginacion: PaginacionMeta
): MetasResponseDTO {
  return {
    ok: true,
    data: metas.map(toMetaData),
    meta: {
      paginacion,
    },
  };
}

/**
 * Crea una respuesta de éxito para creación de meta.
 *
 * @function createCreateMetaResponse
 * @param {number} metaId - ID de la meta recién creada
 * @returns {CreateMetaResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const metaId = await metaService.create(metaData);
 * const response = createCreateMetaResponse(metaId);
 * res.status(201).json(response);
 * ```
 */
export function createCreateMetaResponse(metaId: number): CreateMetaResponseDTO {
  return {
    ok: true,
    data: {
      metaId,
    },
  };
}

/**
 * Crea una respuesta de éxito para actualización de meta.
 *
 * @function createUpdateMetaResponse
 * @param {boolean} actualizado - Indica si la actualización fue exitosa
 * @returns {UpdateMetaResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const actualizado = await metaService.update(metaId, updateData);
 * const response = createUpdateMetaResponse(actualizado);
 * res.status(200).json(response);
 * ```
 */
export function createUpdateMetaResponse(actualizado: boolean): UpdateMetaResponseDTO {
  return {
    ok: true,
    data: {
      actualizado,
    },
  };
}

/**
 * Crea una respuesta de éxito para eliminación de meta.
 *
 * @function createDeleteMetaResponse
 * @param {boolean} eliminado - Indica si la eliminación fue exitosa
 * @returns {DeleteMetaResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const eliminado = await metaService.delete(metaId);
 * const response = createDeleteMetaResponse(eliminado);
 * res.status(200).json(response);
 * ```
 */
export function createDeleteMetaResponse(eliminado: boolean): DeleteMetaResponseDTO {
  return {
    ok: true,
    data: {
      eliminado,
    },
  };
}

/**
 * Crea una respuesta de error estandarizada para la API de metas.
 *
 * Esta función crea respuestas de error consistentes que pueden enviarse a los clientes.
 * Asegura que todos los errores sigan el mismo formato.
 *
 * @function createMetaErrorResponse
 * @param {string} codigo - Código de error (ej. 'NO_ENCONTRADO', 'DATOS_INVALIDOS')
 * @param {string} mensaje - Mensaje de error legible
 * @param {number} [statusCode] - Código de estado HTTP
 * @param {Object} [detalles] - Detalles adicionales del error
 * @returns {MetaErrorResponseDTO} Respuesta de error formateada
 *
 * @example
 * ```typescript
 * // Error simple
 * const error = createMetaErrorResponse(
 *   'NO_ENCONTRADO',
 *   'Meta no encontrada',
 *   404
 * );
 * res.status(404).json(error);
 *
 * // Error con detalles
 * const validationError = createMetaErrorResponse(
 *   'DATOS_INVALIDOS',
 *   'Validación fallida',
 *   422,
 *   { campo: 'montoObjetivo', razon: 'Debe ser mayor a 0' }
 * );
 * res.status(422).json(validationError);
 * ```
 */
export function createMetaErrorResponse(
  codigo: string,
  mensaje: string,
  statusCode?: number,
  detalles?: Record<string, any>
): MetaErrorResponseDTO {
  return {
    ok: false,
    error: {
      codigo,
      mensaje,
      ...(statusCode && { statusCode }),
      ...(detalles && { detalles }),
    },
  };
}
