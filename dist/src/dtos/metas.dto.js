"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMetaData = toMetaData;
exports.createMetaResponse = createMetaResponse;
exports.createMetasResponse = createMetasResponse;
exports.createCreateMetaResponse = createCreateMetaResponse;
exports.createUpdateMetaResponse = createUpdateMetaResponse;
exports.createDeleteMetaResponse = createDeleteMetaResponse;
exports.createMetaErrorResponse = createMetaErrorResponse;
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
function toMetaData(meta) {
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
function createMetaResponse(meta) {
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
function createMetasResponse(metas, paginacion) {
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
function createCreateMetaResponse(metaId) {
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
function createUpdateMetaResponse(actualizado) {
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
function createDeleteMetaResponse(eliminado) {
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
function createMetaErrorResponse(codigo, mensaje, statusCode, detalles) {
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
