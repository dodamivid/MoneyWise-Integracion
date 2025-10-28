/**
 * @fileoverview Repositorio en memoria para la gestión de datos de Usuario.
 * 
 * Este módulo proporciona una capa de acceso a datos para entidades Usuario usando un
 * mecanismo de almacenamiento en memoria. Implementa el patrón Repository para abstraer
 * la lógica de persistencia de datos de la lógica de negocio.
 * 
 * Características clave:
 * - Almacenamiento en memoria usando Map para búsquedas O(1)
 * - Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
 * - Generación de UUID para IDs únicos de usuario
 * - Gestión automática de marcas de tiempo
 * - Validación de unicidad de correo electrónico
 * - Operaciones seguras para hilos
 * 
 * **Nota**: Esta implementación usa almacenamiento en memoria y perderá todos los datos
 * cuando la aplicación se reinicie. En producción, esto debe reemplazarse con
 * una solución de almacenamiento persistente (ej. MySQL, PostgreSQL).
 * 
 * @module repositories/user.repository
 * @category Repositories
 * 
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 * 
 * // Crear un nuevo usuario
 * const user = await userRepository.create({
 *   email: 'john@example.com',
 *   password: 'hashedPassword',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * 
 * // Buscar usuario por ID
 * const foundUser = await userRepository.findById(user.id);
 * 
 * // Buscar usuario por correo
 * const userByEmail = await userRepository.findByEmail('john@example.com');
 * ```
 * 
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import { randomUUID } from "crypto";
import { User, CreateUserInput, UpdateUserInput } from "../models/user.model";

/**
 * Clase repositorio para gestionar entidades Usuario en memoria.
 * 
 * Esta clase implementa el patrón Repository, proporcionando una interfaz limpia
 * para operaciones de datos. Usa un Map para búsquedas eficientes O(1) por ID.
 * 
 * @class UserRepository
 * 
 * @example
 * ```typescript
 * const repository = new UserRepository();
 * 
 * // Crear usuarios
 * const user1 = await repository.create({
 *   email: 'user1@example.com',
 *   password: 'hashedPass1',
 *   firstName: 'User',
 *   lastName: 'One'
 * });
 * 
 * // Obtener todos los usuarios
 * const allUsers = await repository.findAll();
 * ```
 */
export class UserRepository {
  /**
   * Almacenamiento en memoria para usuarios, usando UUID como clave.
   * 
   * Usar un Map proporciona complejidad de tiempo O(1) para búsquedas, inserciones y eliminaciones.
   * 
   * @private
   * @type {Map<string, User>}
   */
  private users: Map<string, User> = new Map();

  /**
   * Crea un nuevo usuario y lo almacena en memoria.
   * 
   * Este método:
   * 1. Valida que el correo no esté ya en uso
   * 2. Genera un UUID único para el usuario
   * 3. Establece marcas de tiempo de creación y actualización
   * 4. Almacena el usuario en el repositorio
   * 
   * @async
   * @param {CreateUserInput} userData - Los datos del usuario para creación
   * @returns {Promise<User>} El usuario creado con ID y marcas de tiempo generadas
   * @throws {Error} Si un usuario con el correo dado ya existe
   * 
   * @example
   * ```typescript
   * const newUser = await userRepository.create({
   *   email: 'john.doe@example.com',
   *   password: 'hashedPassword123',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   isActive: true
   * });
   * 
   * console.log(newUser.id); // '550e8400-e29b-41d4-a716-446655440000'
   * console.log(newUser.createdAt); // '2024-01-01T00:00:00.000Z'
   * ```
   */
  async create(userData: CreateUserInput): Promise<User> {
    // Verificar si el correo ya existe
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(`Usuario con correo ${userData.email} ya existe`);
    }

    // Generar ID único y marcas de tiempo
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      ...userData,
      isActive: userData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    // Almacenar usuario en memoria
    this.users.set(user.id, user);
    return user;
  }

  /**
   * Encuentra un usuario por su ID único.
   * 
   * Esta es la operación de búsqueda más eficiente con complejidad de tiempo O(1).
   * 
   * @async
   * @param {string} id - El UUID del usuario a buscar
   * @returns {Promise<User | null>} El usuario si se encuentra, null en caso contrario
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findById('550e8400-e29b-41d4-a716-446655440000');
   * 
   * if (user) {
   *   console.log(`Usuario encontrado: ${user.email}`);
   * } else {
   *   console.log('Usuario no encontrado');
   * }
   * ```
   */
  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ?? null;
  }

  /**
   * Encuentra un usuario por su dirección de correo electrónico.
   * 
   * Esta operación tiene complejidad de tiempo O(n) ya que requiere iterar
   * a través de todos los usuarios. En una base de datos de producción, esto típicamente
   * usaría un índice en el campo de correo para mejor rendimiento.
   * 
   * @async
   * @param {string} email - La dirección de correo a buscar
   * @returns {Promise<User | null>} El usuario si se encuentra, null en caso contrario
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findByEmail('john.doe@example.com');
   * 
   * if (user) {
   *   console.log(`Usuario encontrado con ID: ${user.id}`);
   * } else {
   *   console.log('No se encontró usuario con este correo');
   * }
   * ```
   */
  async findByEmail(email: string): Promise<User | null> {
    // Normalizar correo a minúsculas para comparación sin distinción de mayúsculas
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar a través de todos los usuarios
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }

    return null;
  }

  /**
   * Recupera todos los usuarios del repositorio.
   * 
   * Retorna un arreglo de todos los usuarios almacenados. En un sistema de producción,
   * esto típicamente incluiría parámetros de paginación.
   * 
   * @async
   * @returns {Promise<User[]>} Arreglo de todos los usuarios
   * 
   * @example
   * ```typescript
   * const allUsers = await userRepository.findAll();
   * console.log(`Total de usuarios: ${allUsers.length}`);
   * 
   * allUsers.forEach(user => {
   *   console.log(`${user.firstName} ${user.lastName} - ${user.email}`);
   * });
   * ```
   */
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Actualiza la información de un usuario existente.
   * 
   * Este método:
   * 1. Valida que el usuario existe
   * 2. Verifica unicidad del correo si el correo está siendo cambiado
   * 3. Fusiona los datos de actualización con los datos existentes del usuario
   * 4. Actualiza la marca de tiempo updatedAt
   * 
   * @async
   * @param {string} id - El UUID del usuario a actualizar
   * @param {UpdateUserInput} updateData - Los campos a actualizar
   * @returns {Promise<User | null>} El usuario actualizado si se encuentra, null en caso contrario
   * @throws {Error} Si se intenta cambiar el correo a uno que ya está en uso
   * 
   * @example
   * ```typescript
   * // Actualizar solo el nombre del usuario
   * const updated = await userRepository.update(userId, {
   *   firstName: 'Jane'
   * });
   * 
   * // Actualizar múltiples campos
   * const updated = await userRepository.update(userId, {
   *   firstName: 'Jane',
   *   lastName: 'Smith',
   *   email: 'jane.smith@example.com'
   * });
   * 
   * if (updated) {
   *   console.log('Usuario actualizado exitosamente');
   * } else {
   *   console.log('Usuario no encontrado');
   * }
   * ```
   */
  async update(
    id: string,
    updateData: UpdateUserInput
  ): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    // Si el correo está siendo cambiado, verificar que no esté ya en uso
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailInUse = await this.findByEmail(updateData.email);
      if (emailInUse) {
        throw new Error(`El correo ${updateData.email} ya está en uso`);
      }
    }

    // Fusionar datos de actualización con datos existentes del usuario
    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Actualizar en almacenamiento
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Elimina un usuario del repositorio.
   * 
   * Esta es una operación de eliminación permanente que remueve el usuario
   * del almacenamiento. En un sistema de producción, podrías querer implementar
   * eliminaciones suaves en su lugar (estableciendo isActive = false).
   * 
   * @async
   * @param {string} id - El UUID del usuario a eliminar
   * @returns {Promise<boolean>} True si el usuario fue eliminado, false si no se encontró
   * 
   * @example
   * ```typescript
   * const wasDeleted = await userRepository.delete(userId);
   * 
   * if (wasDeleted) {
   *   console.log('Usuario eliminado exitosamente');
   * } else {
   *   console.log('Usuario no encontrado');
   * }
   * ```
   */
  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  /**
   * Obtiene el conteo total de usuarios en el repositorio.
   * 
   * Útil para paginación y estadísticas.
   * 
   * @async
   * @returns {Promise<number>} El número total de usuarios
   * 
   * @example
   * ```typescript
   * const count = await userRepository.count();
   * console.log(`Total de usuarios en el sistema: ${count}`);
   * ```
   */
  async count(): Promise<number> {
    return this.users.size;
  }

  /**
   * Verifica si existe un usuario con el ID dado.
   * 
   * Esto es más eficiente que findById cuando solo necesitas verificar
   * existencia sin recuperar el objeto de usuario completo.
   * 
   * @async
   * @param {string} id - El UUID a verificar
   * @returns {Promise<boolean>} True si el usuario existe, false en caso contrario
   * 
   * @example
   * ```typescript
   * const exists = await userRepository.exists(userId);
   * 
   * if (exists) {
   *   console.log('El usuario existe');
   * } else {
   *   console.log('El usuario no existe');
   * }
   * ```
   */
  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  /**
   * Limpia todos los usuarios del repositorio.
   * 
   * **ADVERTENCIA**: Esta operación es destructiva y no puede deshacerse.
   * Solo debe usarse para propósitos de prueba o desarrollo.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Usar en pruebas para resetear el estado entre casos de prueba
   * afterEach(async () => {
   *   await userRepository.clear();
   * });
   * ```
   */
  async clear(): Promise<void> {
    this.users.clear();
  }
}

/**
 * Instancia singleton de UserRepository.
 * 
 * Esto asegura que todas las partes de la aplicación usen el mismo
 * almacén de datos en memoria. En una aplicación de producción con una base de datos real,
 * podrías usar inyección de dependencias en su lugar.
 * 
 * @constant
 * @type {UserRepository}
 * 
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 * 
 * // Usar la instancia singleton
 * const user = await userRepository.findById(userId);
 * ```
 */
export const userRepository = new UserRepository();