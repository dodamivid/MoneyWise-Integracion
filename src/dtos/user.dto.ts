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

import { User } from "../models/user.model";

/**
 * Estructura de datos de usuario para respuestas de la API.
 * 
 * Esta interfaz define los datos de usuario que es seguro enviar a los clientes.
 * Nota: El campo de contraseña se excluye intencionalmente por seguridad.
 * 
 * @interface UserData
 * 
 * @property {string} id - Identificador único del usuario
 * @property {string} email - Dirección de correo electrónico del usuario
 * @property {string} firstName - Nombre del usuario
 * @property {string} lastName - Apellido del usuario
 * @property {boolean} isActive - Si la cuenta del usuario está activa
 * @property {string} createdAt - Cuándo se creó la cuenta (ISO 8601)
 * @property {string} updatedAt - Cuándo se actualizó la cuenta por última vez (ISO 8601)
 * 
 * @example
 * ```typescript
 * const userData: UserData = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   email: 'john.doe@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true,
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-01T00:00:00.000Z'
 * };
 * ```
 */
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Estructura estándar para respuestas exitosas de la API que contienen datos de usuario.
 * 
 * Esta interfaz asegura que todas las respuestas exitosas relacionadas con usuarios sigan
 * el mismo formato, facilitando el análisis de respuestas para los clientes.
 * 
 * @interface UserResponseDTO
 * 
 * @property {"success"} status - Siempre "success" para operaciones exitosas
 * @property {UserData} data - Los datos de usuario
 * @property {string} [message] - Mensaje opcional que proporciona contexto adicional
 * 
 * @example
 * ```typescript
 * const response: UserResponseDTO = {
 *   status: "success",
 *   data: {
 *     id: '550e8400-e29b-41d4-a716-446655440000',
 *     email: 'john.doe@example.com',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     isActive: true,
 *     createdAt: '2024-01-01T00:00:00.000Z',
 *     updatedAt: '2024-01-01T00:00:00.000Z'
 *   },
 *   message: 'Usuario recuperado exitosamente'
 * };
 * ```
 */
export interface UserResponseDTO {
  status: "success";
  data: UserData;
  message?: string;
}

/**
 * Estructura estándar para respuestas exitosas de la API que contienen múltiples usuarios.
 * 
 * Se usa cuando se retornan listas de usuarios (ej. resultados de búsqueda, listas paginadas).
 * 
 * @interface UsersResponseDTO
 * 
 * @property {"success"} status - Siempre "success" para operaciones exitosas
 * @property {UserData[]} data - Arreglo de objetos de datos de usuario
 * @property {Object} [meta] - Metadatos opcionales sobre la respuesta
 * @property {number} [meta.total] - Número total de usuarios disponibles
 * @property {number} [meta.page] - Número de página actual
 * @property {number} [meta.limit] - Número de elementos por página
 * @property {string} [message] - Mensaje opcional que proporciona contexto adicional
 * 
 * @example
 * ```typescript
 * const response: UsersResponseDTO = {
 *   status: "success",
 *   data: [
 *     {
 *       id: '550e8400-e29b-41d4-a716-446655440000',
 *       email: 'user1@example.com',
 *       firstName: 'John',
 *       lastName: 'Doe',
 *       isActive: true,
 *       createdAt: '2024-01-01T00:00:00.000Z',
 *       updatedAt: '2024-01-01T00:00:00.000Z'
 *     }
 *   ],
 *   meta: {
 *     total: 100,
 *     page: 1,
 *     limit: 10
 *   },
 *   message: 'Usuarios recuperados exitosamente'
 * };
 * ```
 */
export interface UsersResponseDTO {
  status: "success";
  data: UserData[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

/**
 * Estructura estándar para respuestas de error.
 *
 * Esta interfaz asegura que todas las respuestas de error sigan el mismo formato,
 * haciendo el manejo de errores consistente y predecible para los clientes de la API.
 *
 * @interface ErrorResponseDTO
 *
 * @property {"error"} status - Siempre "error" para respuestas de error
 * @property {string} message - Mensaje de error legible para humanos
 * @property {number} [statusCode] - Código de estado HTTP (ej. 404, 400, 500)
 * @property {string} [traceId] - ID único de rastreo para correlacionar este error con logs
 * @property {Object} [details] - Detalles adicionales opcionales del error
 * @property {string} [details.field] - Campo que causó el error
 * @property {string} [details.reason] - Razón detallada del error
 *
 * @example
 * ```typescript
 * // Respuesta de error simple
 * const errorResponse: ErrorResponseDTO = {
 *   status: "error",
 *   message: "Usuario no encontrado",
 *   statusCode: 404,
 *   traceId: "550e8400-e29b-41d4-a716-446655440000"
 * };
 *
 * // Respuesta de error con detalles
 * const validationError: ErrorResponseDTO = {
 *   status: "error",
 *   message: "Validación fallida",
 *   statusCode: 400,
 *   traceId: "660e8400-e29b-41d4-a716-446655440001",
 *   details: {
 *     field: "email",
 *     reason: "Formato de correo inválido"
 *   }
 * };
 * ```
 */
export interface ErrorResponseDTO {
  status: "error";
  message: string;
  statusCode?: number;
  traceId?: string;
  details?: Record<string, any>;
}

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
export function toUserData(user: User): UserData {
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
export function createUserResponse(
  user: User,
  message?: string
): UserResponseDTO {
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
export function createUsersResponse(
  users: User[],
  meta?: { total: number; page: number; limit: number },
  message?: string
): UsersResponseDTO {
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
export function createErrorResponse(
  message: string,
  statusCode?: number,
  details?: Record<string, any>
): ErrorResponseDTO {
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