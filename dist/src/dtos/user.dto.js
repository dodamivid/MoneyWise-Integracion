"use strict";
/**
 * @fileoverview Objetos de Transferencia de Datos (DTOs) para respuestas de la API.
 *
 * Este módulo define la estructura de las respuestas de la API para operaciones relacionadas con usuarios.
 * Los DTOs aseguran formatos de respuesta consistentes en todos los endpoints y separan
 * el modelo de datos interno del contrato de la API.
 *
 * Características clave:
 * - Estructura de respuesta consistente en todos los endpoints según spec API v1
 * - Formato de respuesta: `{ ok: true, data: {...} }`
 * - Exclusión de datos sensibles (las contraseñas nunca se incluyen)
 * - Creación de respuestas con seguridad de tipos
 * - Nomenclatura en español
 *
 * @module dtos/user.dto
 * @category DTOs
 *
 * @example
 * ```typescript
 * import { PerfilUsuarioResponseDTO, createPerfilUsuarioResponse } from './dtos/user.dto';
 *
 * const user = await userService.findById(id);
 * const response = createPerfilUsuarioResponse(user);
 * res.json(response);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 2.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPerfilUsuarioData = toPerfilUsuarioData;
exports.createPerfilUsuarioResponse = createPerfilUsuarioResponse;
exports.createActualizarPerfilResponse = createActualizarPerfilResponse;
exports.createCambiarContrasenaResponse = createCambiarContrasenaResponse;
exports.createErrorResponse = createErrorResponse;
/**
 * Convierte un modelo User a DTO PerfilUsuarioData.
 *
 * Esta función elimina información sensible (contraseña) del objeto de usuario
 * antes de enviarlo al cliente. Crea una separación limpia entre
 * el modelo de datos interno y la respuesta de la API.
 *
 * @function toPerfilUsuarioData
 * @param {User} user - El objeto del modelo de usuario
 * @returns {PerfilUsuarioData} Datos de usuario seguros para respuestas de la API
 *
 * @example
 * ```typescript
 * const user: User = {
 *   usuarioId: 1,
 *   correo: 'juan.perez@example.com',
 *   contrasena: '$2b$10$hashedPassword...',  // Será eliminado
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-05-20',
 *   activo: true,
 *   creadoEn: '2024-01-01T00:00:00.000Z',
 *   actualizadoEn: '2024-01-01T00:00:00.000Z'
 * };
 *
 * const userData = toPerfilUsuarioData(user);
 * // userData NO contendrá el campo contrasena
 * ```
 */
function toPerfilUsuarioData(user) {
    // Desestructurar para excluir contrasena de la respuesta
    const { contrasena, ...userData } = user;
    return userData;
}
/**
 * Crea una respuesta de perfil de usuario.
 *
 * Esta función envuelve los datos de usuario en el formato de respuesta estándar de la API.
 *
 * @function createPerfilUsuarioResponse
 * @param {User} user - El objeto del modelo de usuario
 * @returns {PerfilUsuarioResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const user = await userService.findById(userId);
 * const response = createPerfilUsuarioResponse(user);
 * res.status(200).json(response);
 * // Respuesta:
 * // {
 * //   ok: true,
 * //   data: { usuarioId, nombre, apellidoP, apellidoM, correo, fechaN, ... }
 * // }
 * ```
 */
function createPerfilUsuarioResponse(user) {
    return {
        ok: true,
        data: toPerfilUsuarioData(user),
    };
}
/**
 * Crea una respuesta para actualización de perfil.
 *
 * @function createActualizarPerfilResponse
 * @param {string} actualizadoEn - Timestamp de la actualización
 * @returns {ActualizarPerfilResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const response = createActualizarPerfilResponse(new Date().toISOString());
 * res.status(200).json(response);
 * // Respuesta:
 * // {
 * //   ok: true,
 * //   data: {
 * //     actualizado: true,
 * //     actualizadoEn: '2024-01-01T12:30:00.000Z'
 * //   }
 * // }
 * ```
 */
function createActualizarPerfilResponse(actualizadoEn) {
    return {
        ok: true,
        data: {
            actualizado: true,
            actualizadoEn,
        },
    };
}
/**
 * Crea una respuesta para cambio de contraseña.
 *
 * @function createCambiarContrasenaResponse
 * @returns {CambiarContrasenaResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const response = createCambiarContrasenaResponse();
 * res.status(200).json(response);
 * // Respuesta:
 * // {
 * //   ok: true,
 * //   data: {
 * //     cambiado: true
 * //   }
 * // }
 * ```
 */
function createCambiarContrasenaResponse() {
    return {
        ok: true,
        data: {
            cambiado: true,
        },
    };
}
/**
 * Crea una respuesta de error estandarizada.
 *
 * Esta función crea respuestas de error consistentes que pueden enviarse a los clientes.
 * Asegura que todos los errores sigan el mismo formato según spec API v1.
 *
 * @function createErrorResponse
 * @param {string} mensaje - Mensaje de error
 * @param {number} [codigo] - Código de estado HTTP
 * @param {Object} [detalles] - Detalles adicionales del error
 * @returns {ErrorResponseDTO} Respuesta de error formateada
 *
 * @example
 * ```typescript
 * // Error simple
 * const error = createErrorResponse('Usuario no encontrado', 404);
 * res.status(404).json(error);
 *
 * // Error con detalles y traceId
 * const validationError = createErrorResponse(
 *   'Datos inválidos',
 *   422,
 *   { campo: 'fechaN', razon: 'Usuario debe tener al menos 16 años', traceId: 'abc123' }
 * );
 * res.status(422).json(validationError);
 * ```
 */
function createErrorResponse(mensaje, codigo, detalles) {
    // Extraer traceId de detalles si existe, para ponerlo en nivel raíz
    const traceId = detalles?.traceId;
    const { traceId: _removed, ...remainingDetalles } = detalles || {};
    return {
        ok: false,
        mensaje,
        ...(codigo && { codigo }),
        ...(traceId && { traceId }),
        ...(Object.keys(remainingDetalles).length > 0 && { detalles: remainingDetalles }),
    };
}
