"use strict";
/**
 * @fileoverview Capa de servicio de usuario que contiene la lógica de negocio.
 *
 * Este módulo implementa el patrón Service, proporcionando una capa de lógica
 * de negocio entre los controladores y la capa de acceso a datos (repositorio).
 * Maneja la validación, manejo de errores y coordina operaciones a través de
 * múltiples repositorios si es necesario.
 *
 * Responsabilidades clave:
 * - Aplicación de lógica de negocio
 * - Validación de entrada usando esquemas Zod
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
 * const user = await userService.findById('550e8400-e29b-41d4-a716-446655440000');
 *
 * // Crear un nuevo usuario
 * const newUser = await userService.create({
 *   email: 'john@example.com',
 *   password: 'SecurePass123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const user_model_1 = require("../models/user.model");
const errors_1 = require("../utils/errors");
/**
 * Clase de servicio para operaciones de negocio relacionadas con usuarios.
 *
 * Esta clase encapsula toda la lógica de negocio relacionada con usuarios,
 * incluyendo validación, manejo de errores y manipulación de datos.
 * Actúa como intermediario entre controladores y el repositorio.
 *
 * @class UserService
 *
 * @example
 * ```typescript
 * const service = new UserService();
 *
 * try {
 *   const user = await service.findById(userId);
 *   console.log(user);
 * } catch (error) {
 *   if (error instanceof NotFoundError) {
 *     console.log('Usuario no encontrado');
 *   }
 * }
 * ```
 */
class UserService {
    /**
     * Encuentra un usuario por su ID único.
     *
     * Este método:
     * 1. Valida el formato del ID usando esquema Zod
     * 2. Intenta encontrar el usuario en el repositorio
     * 3. Lanza NotFoundError si el usuario no existe
     *
     * @async
     * @param {string} id - El UUID del usuario a buscar
     * @returns {Promise<User>} El usuario encontrado
     * @throws {ValidationError} Si el formato del ID es inválido
     * @throws {NotFoundError} Si no existe ningún usuario con el ID dado
     *
     * @example
     * ```typescript
     * try {
     *   const user = await userService.findById('550e8400-e29b-41d4-a716-446655440000');
     *   console.log(`Usuario encontrado: ${user.email}`);
     * } catch (error) {
     *   if (error instanceof ValidationError) {
     *     console.error('Formato de ID inválido');
     *   } else if (error instanceof NotFoundError) {
     *     console.error('El usuario no existe');
     *   }
     * }
     * ```
     */
    async findById(id) {
        // Validar formato del ID
        try {
            user_model_1.UserIdSchema.parse(id);
        }
        catch (error) {
            throw new errors_1.ValidationError(`Formato de ID de usuario inválido: ${id}`);
        }
        // Intentar encontrar el usuario
        const user = await user_repository_1.userRepository.findById(id);
        // Lanzar error si no se encuentra
        if (!user) {
            throw new errors_1.NotFoundError("Usuario", id);
        }
        return user;
    }
    /**
     * Encuentra un usuario por su dirección de correo electrónico.
     *
     * Este método busca un usuario con la dirección de correo especificada.
     * La comparación de correo es insensible a mayúsculas/minúsculas.
     *
     * @async
     * @param {string} email - La dirección de correo a buscar
     * @returns {Promise<User>} El usuario encontrado
     * @throws {ValidationError} Si el formato del correo es inválido
     * @throws {NotFoundError} Si no existe ningún usuario con el correo dado
     *
     * @example
     * ```typescript
     * try {
     *   const user = await userService.findByEmail('john.doe@example.com');
     *   console.log(`Usuario encontrado: ${user.firstName} ${user.lastName}`);
     * } catch (error) {
     *   if (error instanceof NotFoundError) {
     *     console.error('No se encontró usuario con este correo');
     *   }
     * }
     * ```
     */
    async findByEmail(email) {
        // Validación básica de correo
        if (!email || !email.includes("@")) {
            throw new errors_1.ValidationError("Formato de correo inválido");
        }
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            throw new errors_1.NotFoundError("Usuario con correo " + email);
        }
        return user;
    }
    /**
     * Recupera todos los usuarios del sistema.
     *
     * Este método retorna todos los usuarios registrados. En un sistema de producción,
     * esto típicamente incluiría opciones de paginación, filtrado y ordenamiento.
     *
     * @async
     * @returns {Promise<User[]>} Arreglo de todos los usuarios
     *
     * @example
     * ```typescript
     * const allUsers = await userService.findAll();
     * console.log(`Total de usuarios: ${allUsers.length}`);
     *
     * allUsers.forEach(user => {
     *   console.log(`${user.firstName} ${user.lastName} - ${user.email}`);
     * });
     * ```
     */
    async findAll() {
        return user_repository_1.userRepository.findAll();
    }
    /**
     * Crea un nuevo usuario en el sistema.
     *
     * Este método:
     * 1. Valida los datos de entrada usando esquema Zod
     * 2. Verifica si el correo ya está en uso
     * 3. Crea el usuario en el repositorio
     * 4. Retorna el usuario creado
     *
     * **Nota**: En un sistema de producción, deberías hashear la contraseña antes de almacenarla.
     *
     * @async
     * @param {CreateUserInput} userData - Los datos del usuario para creación
     * @returns {Promise<User>} El usuario creado
     * @throws {ValidationError} Si los datos de entrada son inválidos
     * @throws {BadRequestError} Si el correo ya está en uso
     *
     * @example
     * ```typescript
     * try {
     *   const newUser = await userService.create({
     *     email: 'john.doe@example.com',
     *     password: 'SecurePass123',
     *     firstName: 'John',
     *     lastName: 'Doe',
     *     isActive: true
     *   });
     *   console.log(`Usuario creado con ID: ${newUser.id}`);
     * } catch (error) {
     *   if (error instanceof ValidationError) {
     *     console.error('Datos de usuario inválidos:', error.message);
     *   } else if (error instanceof BadRequestError) {
     *     console.error('Correo ya en uso');
     *   }
     * }
     * ```
     */
    async create(userData) {
        // Validar datos de entrada
        try {
            user_model_1.CreateUserSchema.parse(userData);
        }
        catch (error) {
            throw new errors_1.ValidationError(error.errors?.map((e) => e.message).join(", ") ||
                "Datos de usuario inválidos");
        }
        // Verificar si el correo ya existe
        const existingUser = await user_repository_1.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new errors_1.BadRequestError(`Usuario con correo ${userData.email} ya existe`);
        }
        // Crear usuario
        // Nota: En producción, hashear la contraseña antes de almacenarla
        // const hashedPassword = await hashPassword(userData.password);
        // userData.password = hashedPassword;
        return user_repository_1.userRepository.create(userData);
    }
    /**
     * Actualiza la información de un usuario existente.
     *
     * Este método:
     * 1. Valida el ID del usuario
     * 2. Valida los datos de actualización
     * 3. Verifica si el usuario existe
     * 4. Si el correo está siendo cambiado, verifica que no esté en uso
     * 5. Actualiza el usuario
     *
     * @async
     * @param {string} id - El UUID del usuario a actualizar
     * @param {UpdateUserInput} updateData - Los campos a actualizar
     * @returns {Promise<User>} El usuario actualizado
     * @throws {ValidationError} Si el ID o los datos de actualización son inválidos
     * @throws {NotFoundError} Si el usuario no existe
     * @throws {BadRequestError} Si el correo ya está en uso
     *
     * @example
     * ```typescript
     * try {
     *   const updated = await userService.update(userId, {
     *     firstName: 'Jane',
     *     lastName: 'Smith'
     *   });
     *   console.log('Usuario actualizado exitosamente');
     * } catch (error) {
     *   if (error instanceof NotFoundError) {
     *     console.error('Usuario no encontrado');
     *   } else if (error instanceof ValidationError) {
     *     console.error('Datos de actualización inválidos');
     *   }
     * }
     * ```
     */
    async update(id, updateData) {
        // Validar formato del ID
        try {
            user_model_1.UserIdSchema.parse(id);
        }
        catch (error) {
            throw new errors_1.ValidationError(`Formato de ID de usuario inválido: ${id}`);
        }
        // Validar datos de actualización
        try {
            user_model_1.UpdateUserSchema.parse(updateData);
        }
        catch (error) {
            throw new errors_1.ValidationError(error.errors?.map((e) => e.message).join(", ") ||
                "Datos de actualización inválidos");
        }
        // Verificar si el usuario existe
        const existingUser = await user_repository_1.userRepository.findById(id);
        if (!existingUser) {
            throw new errors_1.NotFoundError("Usuario", id);
        }
        // Si el correo está siendo cambiado, verificar que no esté ya en uso
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailInUse = await user_repository_1.userRepository.findByEmail(updateData.email);
            if (emailInUse) {
                throw new errors_1.BadRequestError(`El correo ${updateData.email} ya está en uso`);
            }
        }
        // Actualizar usuario
        const updatedUser = await user_repository_1.userRepository.update(id, updateData);
        // Esto nunca debería ser null debido a la verificación de existencia anterior,
        // pero TypeScript requiere manejar el caso null
        if (!updatedUser) {
            throw new errors_1.NotFoundError("Usuario", id);
        }
        return updatedUser;
    }
    /**
     * Elimina un usuario del sistema.
     *
     * Esta es una eliminación permanente que remueve el usuario permanentemente.
     * En un sistema de producción, podrías querer implementar eliminaciones suaves
     * (estableciendo isActive = false) en su lugar.
     *
     * @async
     * @param {string} id - El UUID del usuario a eliminar
     * @returns {Promise<void>}
     * @throws {ValidationError} Si el formato del ID es inválido
     * @throws {NotFoundError} Si el usuario no existe
     *
     * @example
     * ```typescript
     * try {
     *   await userService.delete(userId);
     *   console.log('Usuario eliminado exitosamente');
     * } catch (error) {
     *   if (error instanceof NotFoundError) {
     *     console.error('Usuario no encontrado');
     *   }
     * }
     * ```
     */
    async delete(id) {
        // Validar formato del ID
        try {
            user_model_1.UserIdSchema.parse(id);
        }
        catch (error) {
            throw new errors_1.ValidationError(`Formato de ID de usuario inválido: ${id}`);
        }
        // Intentar eliminar
        const deleted = await user_repository_1.userRepository.delete(id);
        if (!deleted) {
            throw new errors_1.NotFoundError("Usuario", id);
        }
    }
    /**
     * Verifica si existe un usuario con el ID dado.
     *
     * Esto es útil para propósitos de validación sin obtener el objeto de usuario completo.
     *
     * @async
     * @param {string} id - El UUID a verificar
     * @returns {Promise<boolean>} True si el usuario existe, false en caso contrario
     * @throws {ValidationError} Si el formato del ID es inválido
     *
     * @example
     * ```typescript
     * const exists = await userService.exists(userId);
     *
     * if (exists) {
     *   console.log('El usuario existe');
     * } else {
     *   console.log('El usuario no existe');
     * }
     * ```
     */
    async exists(id) {
        // Validar formato del ID
        try {
            user_model_1.UserIdSchema.parse(id);
        }
        catch (error) {
            throw new errors_1.ValidationError(`Formato de ID de usuario inválido: ${id}`);
        }
        return user_repository_1.userRepository.exists(id);
    }
    /**
     * Obtiene el conteo total de usuarios en el sistema.
     *
     * Útil para paginación, estadísticas y paneles administrativos.
     *
     * @async
     * @returns {Promise<number>} El número total de usuarios
     *
     * @example
     * ```typescript
     * const totalUsers = await userService.count();
     * console.log(`Total de usuarios registrados: ${totalUsers}`);
     * ```
     */
    async count() {
        return user_repository_1.userRepository.count();
    }
}
exports.UserService = UserService;
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
exports.userService = new UserService();
