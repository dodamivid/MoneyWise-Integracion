"use strict";
/**
 * @fileoverview Objetos de Transferencia de Datos (DTOs) para respuestas de la API.
 *
 * Este módulo define la estructura de las respuestas de la API para operaciones relacionadas con usuarios.
 * Los DTOs aseguran formatos de respuesta consistentes en todos los endpoints y separan
 * el modelo de datos interno del contrato de la API.
 *
 * Características clave:
 * - Estructura de respuesta consistente en todos los endpoints
 * - Exclusión de datos sensibles (las contraseñas nunca se incluyen)
 * - Creación de respuestas con seguridad de tipos
 * - Respuestas de error estandarizadas
 *
 * @module dtos/user.dto
 * @category DTOs
 *
 * @example
 * ```typescript
 * import { UserResponseDTO, createUserResponse } from './dtos/user.dto';
 *
 * const user = await userService.findById(id);
 * const response = createUserResponse(user);
 * res.json(response);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserData = toUserData;
exports.createUserResponse = createUserResponse;
exports.createUsersResponse = createUsersResponse;
exports.createErrorResponse = createErrorResponse;
/**
 * Convierte un modelo User a DTO UserData.
 *
 * Esta función elimina información sensible (contraseña) del objeto de usuario
 * antes de enviarlo al cliente. Crea una separación limpia entre
 * el modelo de datos interno y la respuesta de la API.
 *
 * @function toUserData
 * @param {User} user - El objeto del modelo de usuario
 * @returns {UserData} Datos de usuario seguros para respuestas de la API
 *
 * @example
 * ```typescript
 * const user: User = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   email: 'john.doe@example.com',
 *   password: 'hashedPassword123',  // Será eliminado
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true,
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-01T00:00:00.000Z'
 * };
 *
 * const userData = toUserData(user);
 * // userData NO contendrá el campo password
 * ```
 */
function toUserData(user) {
    // Desestructurar para excluir password de la respuesta
    const { password, ...userData } = user;
    return userData;
}
/**
 * Crea una respuesta de éxito estandarizada para un único usuario.
 *
 * Esta función envuelve los datos de usuario en el formato de respuesta estándar de la API,
 * asegurando consistencia en todos los endpoints que retornan datos de usuario.
 *
 * @function createUserResponse
 * @param {User} user - El objeto del modelo de usuario
 * @param {string} [message] - Mensaje de éxito opcional
 * @returns {UserResponseDTO} Respuesta de API formateada
 *
 * @example
 * ```typescript
 * const user = await userService.findById(userId);
 * const response = createUserResponse(user, 'Usuario recuperado exitosamente');
 * res.status(200).json(response);
 * // Respuesta:
 * // {
 * //   status: "success",
 * //   data: { id, email, firstName, lastName, isActive, createdAt, updatedAt },
 * //   message: "Usuario recuperado exitosamente"
 * // }
 * ```
 */
function createUserResponse(user, message) {
    return {
        status: "success",
        data: toUserData(user),
        ...(message && { message }),
    };
}
/**
 * Crea una respuesta de éxito estandarizada para múltiples usuarios.
 *
 * Esta función envuelve un arreglo de datos de usuario en el formato de respuesta estándar de la API,
 * con metadatos opcionales para paginación.
 *
 * @function createUsersResponse
 * @param {User[]} users - Arreglo de objetos del modelo de usuario
 * @param {Object} [meta] - Metadatos opcionales para paginación
 * @param {number} [meta.total] - Número total de usuarios
 * @param {number} [meta.page] - Número de página actual
 * @param {number} [meta.limit] - Elementos por página
 * @param {string} [message] - Mensaje de éxito opcional
 * @returns {UsersResponseDTO} Respuesta de API formateada con lista de usuarios
 *
 * @example
 * ```typescript
 * const users = await userService.findAll();
 * const response = createUsersResponse(users, {
 *   total: 100,
 *   page: 1,
 *   limit: 10
 * }, 'Usuarios recuperados exitosamente');
 *
 * res.status(200).json(response);
 * ```
 */
function createUsersResponse(users, meta, message) {
    return {
        status: "success",
        data: users.map(toUserData),
        ...(meta && { meta }),
        ...(message && { message }),
    };
}
/**
 * Crea una respuesta de error estandarizada.
 *
 * Esta función crea respuestas de error consistentes que pueden enviarse a los clientes.
 * Asegura que todos los errores sigan el mismo formato.
 *
 * @function createErrorResponse
 * @param {string} message - Mensaje de error
 * @param {number} [statusCode] - Código de estado HTTP
 * @param {Object} [details] - Detalles adicionales del error
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
 *   'Validación fallida',
 *   400,
 *   { field: 'email', reason: 'Formato inválido', traceId: 'abc123' }
 * );
 * res.status(400).json(validationError);
 * ```
 */
function createErrorResponse(message, statusCode, details) {
    // Extraer traceId de details si existe, para ponerlo en nivel raíz
    const traceId = details?.traceId;
    const { traceId: _removed, ...remainingDetails } = details || {};
    return {
        status: "error",
        message,
        ...(statusCode && { statusCode }),
        ...(traceId && { traceId }),
        ...(Object.keys(remainingDetails).length > 0 && { details: remainingDetails }),
    };
}
