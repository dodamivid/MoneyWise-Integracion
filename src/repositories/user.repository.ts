/**
 * @fileoverview Repositorio en memoria para la gestión de datos de Usuario.
 *
 * Este módulo proporciona una capa de acceso a datos para entidades Usuario usando un
 * mecanismo de almacenamiento en memoria. Implementa el patrón Repository para abstraer
 * la lógica de persistencia de datos de la lógica de negocio.
 *
 * Características clave:
 * - Almacenamiento en memoria usando Map para búsquedas O(1)
 * - IDs numéricos auto-incrementales (simula AUTO_INCREMENT de MySQL)
 * - Operaciones de lectura y actualización (según especificación API v1)
 * - Gestión automática de marcas de tiempo
 * - Operaciones seguras para hilos
 *
 * **Nota**: Esta implementación usa almacenamiento en memoria y perderá todos los datos
 * cuando la aplicación se reinicie. En producción, esto será reemplazado con
 * stored procedures de MySQL para persistencia real.
 *
 * @module repositories/user.repository
 * @category Repositories
 *
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 *
 * // Buscar usuario por ID
 * const foundUser = await userRepository.findById(1);
 *
 * // Actualizar perfil de usuario
 * const updated = await userRepository.update(1, {
 *   nombre: 'Juan Carlos',
 *   apellidoP: 'Pérez'
 * });
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 2.0.0
 */

import { User, UpdateUserInput } from "../models/user.model";

/**
 * Clase repositorio para gestionar entidades Usuario en memoria.
 *
 * Esta clase implementa el patrón Repository, proporcionando una interfaz limpia
 * para operaciones de datos. Usa un Map para búsquedas eficientes O(1) por ID.
 * Simula el comportamiento de una base de datos con IDs auto-incrementales.
 *
 * @class UserRepository
 *
 * @example
 * ```typescript
 * const repository = new UserRepository();
 *
 * // Buscar usuario por ID
 * const user = await repository.findById(1);
 *
 * // Actualizar usuario
 * const updated = await repository.update(1, {
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez'
 * });
 * ```
 */
export class UserRepository {
  /**
   * Almacenamiento en memoria para usuarios, usando ID numérico como clave.
   *
   * Usar un Map proporciona complejidad de tiempo O(1) para búsquedas, inserciones y eliminaciones.
   *
   * @private
   * @type {Map<number, User>}
   */
  private users: Map<number, User> = new Map();

  /**
   * Contador para generar IDs únicos de usuarios.
   * Simula el comportamiento de AUTO_INCREMENT en bases de datos relacionales.
   *
   * @private
   * @type {number}
   */
  private nextId: number = 1;


  /**
   * Encuentra un usuario por su ID único.
   *
   * Esta es la operación de búsqueda más eficiente con complejidad de tiempo O(1).
   *
   * @async
   * @param {number} id - El ID numérico del usuario a buscar
   * @returns {Promise<User | null>} El usuario si se encuentra, null en caso contrario
   *
   * @example
   * ```typescript
   * const user = await userRepository.findById(1);
   *
   * if (user) {
   *   console.log(`Usuario encontrado: ${user.correo}`);
   * } else {
   *   console.log('Usuario no encontrado');
   * }
   * ```
   */
  async findById(id: number): Promise<User | null> {
    const user = this.users.get(id);
    return user ?? null;
  }

  /**
   * Inserta o actualiza un usuario (usado para sincronizar registros creados vía auth).
   */
  async upsert(user: User): Promise<void> {
    this.users.set(user.usuarioId, user);
    // Mantener nextId por encima del máximo ID visto
    if (user.usuarioId >= this.nextId) {
      this.nextId = user.usuarioId + 1;
    }
  }


  /**
   * Actualiza la información de un usuario existente.
   *
   * Este método:
   * 1. Valida que el usuario existe
   * 2. Fusiona los datos de actualización con los datos existentes del usuario
   * 3. Actualiza la marca de tiempo actualizadoEn
   *
   * @async
   * @param {number} id - El ID numérico del usuario a actualizar
   * @param {UpdateUserInput} updateData - Los campos a actualizar
   * @returns {Promise<User | null>} El usuario actualizado si se encuentra, null en caso contrario
   *
   * @example
   * ```typescript
   * // Actualizar solo el nombre del usuario
   * const updated = await userRepository.update(1, {
   *   nombre: 'Juan Carlos'
   * });
   *
   * // Actualizar múltiples campos
   * const updated = await userRepository.update(1, {
   *   nombre: 'Juan',
   *   apellidoP: 'Pérez',
   *   fechaN: '1995-05-20'
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
    id: number,
    updateData: UpdateUserInput
  ): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    // Fusionar datos de actualización con datos existentes del usuario
    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      actualizadoEn: new Date().toISOString(),
    };

    // Actualizar en almacenamiento
    this.users.set(id, updatedUser);
    return updatedUser;
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
