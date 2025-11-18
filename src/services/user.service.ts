/**
 * @fileoverview Capa de servicio de usuario que contiene la lógica de negocio.
 *
 * Este módulo implementa el patrón Service, proporcionando una capa de lógica
 * de negocio entre los controladores y la capa de acceso a datos (repositorio).
 * Maneja la validación, manejo de errores, hashing de contraseñas con bcrypt,
 * y coordina operaciones a través de múltiples repositorios si es necesario.
 *
 * Responsabilidades clave:
 * - Aplicación de lógica de negocio
 * - Validación de entrada usando esquemas Zod
 * - Hashing y verificación de contraseñas con bcrypt
 * - Manejo de errores y lanzamiento de errores personalizados
 * - Coordinación entre múltiples fuentes de datos
 * - Operaciones tipo transacción
 *
 * @module services/user.service
 * @category Services
 *
 * @example
 * ```typescript
 * import { userService } from './services/user.service';
 *
 * // Buscar un usuario por ID
 * const user = await userService.findById(1);
 *
 * // Actualizar perfil de usuario
 * const updated = await userService.actualizarPerfil(1, {
 *   nombre: 'Juan Carlos',
 *   apellidoP: 'Pérez'
 * });
 *
 * // Cambiar contraseña
 * await userService.cambiarContrasena(1, {
 *   contrasenaActual: 'OldPass123!',
 *   contrasenaNueva: 'NewPass456!'
 * });
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 2.0.0
 */

import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
  UserIdSchema,
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from "../models/user.model";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/errors";

/**
 * Número de rondas de salt para bcrypt.
 * Un valor de 10-12 es recomendado para un balance entre seguridad y rendimiento.
 *
 * @constant
 * @type {number}
 */
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Clase de servicio para operaciones de negocio relacionadas con usuarios.
 *
 * Esta clase encapsula toda la lógica de negocio relacionada con usuarios,
 * incluyendo validación, hashing de contraseñas, manejo de errores y manipulación de datos.
 * Actúa como intermediario entre controladores y el repositorio.
 *
 * @class UserService
 *
 * @example
 * ```typescript
 * const service = new UserService();
 *
 * try {
 *   const user = await service.findById(1);
 *   console.log(user);
 * } catch (error) {
 *   if (error instanceof NotFoundError) {
 *     console.log('Usuario no encontrado');
 *   }
 * }
 * ```
 */
export class UserService {
  /**
   * Encuentra un usuario por su ID único.
   *
   * Este método:
   * 1. Valida el formato del ID usando esquema Zod
   * 2. Intenta encontrar el usuario en el repositorio
   * 3. Lanza NotFoundError si el usuario no existe
   *
   * @async
   * @param {number} id - El ID numérico del usuario a buscar
   * @returns {Promise<User>} El usuario encontrado
   * @throws {ValidationError} Si el formato del ID es inválido
   * @throws {NotFoundError} Si no existe ningún usuario con el ID dado
   *
   * @example
   * ```typescript
   * try {
   *   const user = await userService.findById(1);
   *   console.log(`Usuario encontrado: ${user.correo}`);
   * } catch (error) {
   *   if (error instanceof ValidationError) {
   *     console.error('Formato de ID inválido');
   *   } else if (error instanceof NotFoundError) {
   *     console.error('El usuario no existe');
   *   }
   * }
   * ```
   */
  async findById(id: number): Promise<User> {
    // Validar formato del ID
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Formato de ID de usuario inválido: ${id}`);
    }

    // Intentar encontrar el usuario
    const user = await userRepository.findById(id);

    // Lanzar error si no se encuentra
    if (!user) {
      throw new NotFoundError("Usuario", id.toString());
    }

    return user;
  }

  /**
   * Actualiza el perfil de un usuario existente.
   *
   * Según la especificación API v1, solo se pueden actualizar:
   * nombre, apellidoP, apellidoM, fechaN.
   *
   * Este método:
   * 1. Valida el ID del usuario
   * 2. Valida los datos de actualización
   * 3. Verifica si el usuario existe
   * 4. Actualiza el usuario y timestamp actualizadoEn
   * 5. Retorna el usuario actualizado
   *
   * @async
   * @param {number} id - El ID numérico del usuario a actualizar
   * @param {UpdateUserInput} updateData - Los campos de perfil a actualizar
   * @returns {Promise<User>} El usuario actualizado
   * @throws {ValidationError} Si el ID o los datos de actualización son inválidos
   * @throws {NotFoundError} Si el usuario no existe
   *
   * @example
   * ```typescript
   * try {
   *   const updated = await userService.actualizarPerfil(1, {
   *     nombre: 'Juan Carlos',
   *     apellidoP: 'Pérez'
   *   });
   *   console.log('Perfil actualizado exitosamente');
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.error('Usuario no encontrado');
   *   } else if (error instanceof ValidationError) {
   *     console.error('Datos de actualización inválidos');
   *   }
   * }
   * ```
   */
  async actualizarPerfil(
    id: number,
    updateData: UpdateUserInput
  ): Promise<User> {
    // Validar formato del ID
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Formato de ID de usuario inválido: ${id}`);
    }

    // Validar datos de actualización
    try {
      UpdateUserSchema.parse(updateData);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Datos de actualización inválidos"
      );
    }

    // Verificar que al menos un campo esté presente
    if (Object.keys(updateData).length === 0) {
      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar"
      );
    }

    // Verificar si el usuario existe
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("Usuario", id.toString());
    }

    // Actualizar usuario con timestamp
    const updatedUser = await userRepository.update(id, {
      ...updateData,
      actualizadoEn: new Date().toISOString(),
    });

    // Esto nunca debería ser null debido a la verificación de existencia anterior,
    // pero TypeScript requiere manejar el caso null
    if (!updatedUser) {
      throw new NotFoundError("Usuario", id.toString());
    }

    return updatedUser;
  }

  /**
   * Cambia la contraseña de un usuario.
   *
   * Este método implementa el flujo completo de cambio de contraseña:
   * 1. Valida el ID del usuario
   * 2. Valida los datos de entrada (contraseña actual y nueva)
   * 3. Verifica que el usuario existe
   * 4. Verifica que la contraseña actual coincide con el hash almacenado usando bcrypt
   * 5. Hashea la nueva contraseña con bcrypt
   * 6. Actualiza el usuario con la nueva contraseña hasheada
   *
   * @async
   * @param {number} id - El ID numérico del usuario
   * @param {ChangePasswordInput} passwordData - Contraseña actual y nueva
   * @returns {Promise<void>}
   * @throws {ValidationError} Si el ID o los datos son inválidos
   * @throws {NotFoundError} Si el usuario no existe
   * @throws {BadRequestError} Si la contraseña actual no coincide (código 401)
   *
   * @example
   * ```typescript
   * try {
   *   await userService.cambiarContrasena(1, {
   *     contrasenaActual: 'OldPass123!',
   *     contrasenaNueva: 'NewSecurePass456!'
   *   });
   *   console.log('Contraseña cambiada exitosamente');
   * } catch (error) {
   *   if (error instanceof BadRequestError) {
   *     console.error('Contraseña actual incorrecta');
   *   } else if (error instanceof NotFoundError) {
   *     console.error('Usuario no encontrado');
   *   }
   * }
   * ```
   */
  async cambiarContrasena(
    id: number,
    passwordData: ChangePasswordInput
  ): Promise<void> {
    // Validar formato del ID
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Formato de ID de usuario inválido: ${id}`);
    }

    // Validar datos de cambio de contraseña
    try {
      ChangePasswordSchema.parse(passwordData);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Datos de cambio de contraseña inválidos"
      );
    }

    // Verificar si el usuario existe
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("Usuario", id.toString());
    }

    // Verificar que la contraseña actual coincide
    const passwordMatches = await bcrypt.compare(
      passwordData.contrasenaActual,
      existingUser.contrasena
    );

    if (!passwordMatches) {
      // Usar BadRequestError con código 401 para contraseña incorrecta
      const error = new BadRequestError("La contraseña actual es incorrecta");
      (error as any).statusCode = 401; // Override para usar 401 en lugar de 400
      throw error;
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(
      passwordData.contrasenaNueva,
      BCRYPT_SALT_ROUNDS
    );

    // Actualizar la contraseña
    await userRepository.update(id, {
      contrasena: hashedPassword,
      actualizadoEn: new Date().toISOString(),
    });
  }
}

/**
 * Instancia singleton de UserService.
 * 
 * Esto asegura un uso de servicio consistente en toda la aplicación.
 * En aplicaciones más grandes, podrías usar inyección de dependencias en su lugar.
 * 
 * @constant
 * @type {UserService}
 * 
 * @example
 * ```typescript
 * import { userService } from './services/user.service';
 * 
 * const user = await userService.findById(userId);
 * ```
 */
export const userService = new UserService();