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

import { User } from "../models/user.model";

/**
 * Estructura de datos de perfil de usuario para respuestas de la API.
 *
 * Esta interfaz define los datos de usuario que es seguro enviar a los clientes.
 * Nota: El campo de contraseña se excluye intencionalmente por seguridad.
 *
 * @interface PerfilUsuarioData
 *
 * @property {number} usuarioId - Identificador único del usuario
 * @property {string} nombre - Nombre del usuario
 * @property {string} apellidoP - Apellido paterno del usuario
 * @property {string} apellidoM - Apellido materno del usuario
 * @property {string} correo - Dirección de correo electrónico del usuario
 * @property {string} fechaN - Fecha de nacimiento (YYYY-MM-DD)
 * @property {string} creadoEn - Cuándo se creó la cuenta (ISO 8601)
 * @property {string} actualizadoEn - Cuándo se actualizó la cuenta por última vez (ISO 8601)
 * @property {boolean} activo - Si la cuenta del usuario está activa
 *
 * @example
 * ```typescript
 * const userData: PerfilUsuarioData = {
 *   usuarioId: 1,
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   correo: 'juan.perez@example.com',
 *   fechaN: '1995-05-20',
 *   creadoEn: '2024-01-01T00:00:00.000Z',
 *   actualizadoEn: '2024-01-01T00:00:00.000Z',
 *   activo: true
 * };
 * ```
 */
export interface PerfilUsuarioData {
  usuarioId: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  correo: string;
  fechaN: string;
  creadoEn: string;
  actualizadoEn: string;
  activo: boolean;
}

/**
 * Respuesta para GET /api/v1/usuarios/:id
 *
 * Contiene el perfil completo del usuario.
 *
 * @interface PerfilUsuarioResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {PerfilUsuarioData} data - Los datos del perfil del usuario
 *
 * @example
 * ```typescript
 * const response: PerfilUsuarioResponseDTO = {
 *   ok: true,
 *   data: {
 *     usuarioId: 1,
 *     nombre: 'Juan',
 *     apellidoP: 'Pérez',
 *     apellidoM: 'López',
 *     correo: 'juan.perez@example.com',
 *     fechaN: '1995-05-20',
 *     creadoEn: '2024-01-01T00:00:00.000Z',
 *     actualizadoEn: '2024-01-01T00:00:00.000Z',
 *     activo: true
 *   }
 * };
 * ```
 */
export interface PerfilUsuarioResponseDTO {
  ok: true;
  data: PerfilUsuarioData;
}

/**
 * Datos de respuesta para actualización de perfil.
 *
 * @interface ActualizarPerfilData
 *
 * @property {boolean} actualizado - Indica si la actualización fue exitosa
 * @property {string} actualizadoEn - Timestamp de cuándo se realizó la actualización
 *
 * @example
 * ```typescript
 * const data: ActualizarPerfilData = {
 *   actualizado: true,
 *   actualizadoEn: '2024-01-01T12:30:00.000Z'
 * };
 * ```
 */
export interface ActualizarPerfilData {
  actualizado: boolean;
  actualizadoEn: string;
}

/**
 * Respuesta para PUT /api/v1/usuarios/:id
 *
 * Confirma la actualización del perfil del usuario.
 *
 * @interface ActualizarPerfilResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {ActualizarPerfilData} data - Resultado de la actualización
 *
 * @example
 * ```typescript
 * const response: ActualizarPerfilResponseDTO = {
 *   ok: true,
 *   data: {
 *     actualizado: true,
 *     actualizadoEn: '2024-01-01T12:30:00.000Z'
 *   }
 * };
 * ```
 */
export interface ActualizarPerfilResponseDTO {
  ok: true;
  data: ActualizarPerfilData;
}

/**
 * Datos de respuesta para cambio de contraseña.
 *
 * @interface CambiarContrasenaData
 *
 * @property {boolean} cambiado - Indica si el cambio fue exitoso
 *
 * @example
 * ```typescript
 * const data: CambiarContrasenaData = {
 *   cambiado: true
 * };
 * ```
 */
export interface CambiarContrasenaData {
  cambiado: boolean;
}

/**
 * Respuesta para PATCH /api/v1/usuarios/:id/contrasena
 *
 * Confirma el cambio de contraseña del usuario.
 *
 * @interface CambiarContrasenaResponseDTO
 *
 * @property {true} ok - Siempre true para operaciones exitosas
 * @property {CambiarContrasenaData} data - Resultado del cambio
 *
 * @example
 * ```typescript
 * const response: CambiarContrasenaResponseDTO = {
 *   ok: true,
 *   data: {
 *     cambiado: true
 *   }
 * };
 * ```
 */
export interface CambiarContrasenaResponseDTO {
  ok: true;
  data: CambiarContrasenaData;
}

/**
 * Estructura estándar para respuestas de error.
 *
 * Esta interfaz asegura que todas las respuestas de error sigan el mismo formato,
 * haciendo el manejo de errores consistente y predecible para los clientes de la API.
 *
 * **Nota**: Los errores usan `ok: false` en lugar de `status: "error"` según spec API v1.
 *
 * @interface ErrorResponseDTO
 *
 * @property {false} ok - Siempre false para respuestas de error
 * @property {string} mensaje - Mensaje de error legible para humanos
 * @property {number} [codigo] - Código de estado HTTP (ej. 404, 400, 500)
 * @property {string} [traceId] - ID único de rastreo para correlacionar este error con logs
 * @property {Object} [detalles] - Detalles adicionales opcionales del error
 *
 * @example
 * ```typescript
 * // Respuesta de error simple
 * const errorResponse: ErrorResponseDTO = {
 *   ok: false,
 *   mensaje: "Usuario no encontrado",
 *   codigo: 404,
 *   traceId: "550e8400-e29b-41d4-a716-446655440000"
 * };
 *
 * // Respuesta de error con detalles
 * const validationError: ErrorResponseDTO = {
 *   ok: false,
 *   mensaje: "Datos inválidos",
 *   codigo: 422,
 *   traceId: "660e8400-e29b-41d4-a716-446655440001",
 *   detalles: {
 *     campo: "fechaN",
 *     razon: "El usuario debe tener al menos 16 años"
 *   }
 * };
 * ```
 */
export interface ErrorResponseDTO {
  ok: false;
  mensaje: string;
  codigo?: number;
  traceId?: string;
  detalles?: Record<string, any>;
}

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
export function toPerfilUsuarioData(user: User): PerfilUsuarioData {
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
export function createPerfilUsuarioResponse(
  user: User
): PerfilUsuarioResponseDTO {
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
export function createActualizarPerfilResponse(
  actualizadoEn: string
): ActualizarPerfilResponseDTO {
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
export function createCambiarContrasenaResponse(): CambiarContrasenaResponseDTO {
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
export function createErrorResponse(
  mensaje: string,
  codigo?: number,
  detalles?: Record<string, any>
): ErrorResponseDTO {
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