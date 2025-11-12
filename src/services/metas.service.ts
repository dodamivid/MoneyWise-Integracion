/**
 * @fileoverview Capa de servicio de metas que contiene la lógica de negocio.
 *
 * Este módulo implementa el patrón Service, proporcionando una capa de lógica
 * de negocio entre los controladores y la capa de acceso a datos (repositorio).
 * Maneja la validación, manejo de errores y coordina operaciones a través de
 * múltiples repositorios si es necesario.
 *
 * Responsabilidades clave:
 * - Aplicación de lógica de negocio (validación de monto objetivo, ahorro real, fechas)
 * - Validación de entrada usando esquemas Zod
 * - Manejo de errores y lanzamiento de errores personalizados
 * - Coordinación con el repositorio de metas
 * - Validación de reglas de negocio (ahorroReal no supera montoObjetivo sin permisos admin)
 *
 * @module services/metas.service
 * @category Services
 *
 * @example
 * ```typescript
 * import { metasService } from './services/metas.service';
 *
 * // Buscar una meta por ID
 * const meta = await metasService.findById(7);
 *
 * // Crear una nueva meta
 * const newMeta = await metasService.create({
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   activa: true
 * });
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import {
  metasRepository,
  MetaFilters,
  PaginationOptions,
  PaginatedResult,
} from "../repositories/metas.repository";
import {
  Meta,
  CreateMetaInput,
  UpdateMetaInput,
  MetaIdSchema,
  CreateMetaSchema,
  UpdateMetaSchema,
  MetaQueryParamsSchema,
  MetaQueryParams,
} from "../models/meta.model";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/errors";

/**
 * Clase de servicio para operaciones de negocio relacionadas con metas.
 *
 * Esta clase encapsula toda la lógica de negocio relacionada con metas,
 * incluyendo validación, manejo de errores y manipulación de datos.
 * Actúa como intermediario entre controladores y el repositorio.
 *
 * @class MetasService
 *
 * @example
 * ```typescript
 * const service = new MetasService();
 *
 * try {
 *   const meta = await service.findById(7);
 *   console.log(meta);
 * } catch (error) {
 *   if (error instanceof NotFoundError) {
 *     console.log('Meta no encontrada');
 *   }
 * }
 * ```
 */
export class MetasService {
  /**
   * Encuentra una meta por su ID único.
   *
   * Este método:
   * 1. Valida el formato del ID usando esquema Zod
   * 2. Intenta encontrar la meta en el repositorio
   * 3. Lanza NotFoundError si la meta no existe
   *
   * @async
   * @param {number} metaId - El ID de la meta a buscar
   * @returns {Promise<Meta>} La meta encontrada
   * @throws {ValidationError} Si el formato del ID es inválido
   * @throws {NotFoundError} Si no existe ninguna meta con el ID dado
   *
   * @example
   * ```typescript
   * try {
   *   const meta = await metasService.findById(7);
   *   console.log(`Meta encontrada: ${meta.nombre}`);
   * } catch (error) {
   *   if (error instanceof ValidationError) {
   *     console.error('Formato de ID inválido');
   *   } else if (error instanceof NotFoundError) {
   *     console.error('La meta no existe');
   *   }
   * }
   * ```
   */
  async findById(metaId: number): Promise<Meta> {
    // Validar formato del ID
    try {
      MetaIdSchema.parse(metaId);
    } catch (error) {
      throw new ValidationError(`Formato de ID de meta inválido: ${metaId}`);
    }

    // Intentar encontrar la meta
    const meta = await metasRepository.findById(metaId);

    // Lanzar error si no se encuentra
    if (!meta) {
      throw new NotFoundError("Meta", metaId.toString());
    }

    return meta;
  }

  /**
   * Encuentra metas con filtros, paginación y ordenamiento.
   *
   * Este método:
   * 1. Valida los parámetros de consulta usando esquema Zod
   * 2. Construye filtros para el repositorio
   * 3. Aplica paginación y ordenamiento
   * 4. Retorna resultado paginado
   *
   * @async
   * @param {MetaQueryParams} queryParams - Parámetros de consulta validados
   * @returns {Promise<PaginatedResult>} Resultado paginado con metas y total
   * @throws {ValidationError} Si los parámetros de consulta son inválidos
   *
   * @example
   * ```typescript
   * const result = await metasService.findAll({
   *   usuarioId: 23,
   *   activa: true,
   *   pagina: 1,
   *   tamanoPagina: 20,
   *   orden: 'fechaInicio:desc'
   * });
   *
   * console.log(`Total de metas: ${result.total}`);
   * console.log(`Metas en esta página: ${result.metas.length}`);
   * ```
   */
  async findAll(queryParams: MetaQueryParams): Promise<PaginatedResult> {
    // Validar parámetros de consulta
    let validatedParams: MetaQueryParams;
    try {
      validatedParams = MetaQueryParamsSchema.parse(queryParams);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Parámetros de consulta inválidos"
      );
    }

    // Construir filtros
    const filters: MetaFilters = {
      ...(validatedParams.usuarioId !== undefined && {
        usuarioId: validatedParams.usuarioId,
      }),
      ...(validatedParams.desde && { desde: validatedParams.desde }),
      ...(validatedParams.hasta && { hasta: validatedParams.hasta }),
      ...(validatedParams.activa !== undefined && {
        activa: validatedParams.activa,
      }),
    };

    // Construir opciones de paginación
    const pagination: PaginationOptions = {
      pagina: validatedParams.pagina,
      tamanoPagina: validatedParams.tamanoPagina,
      ...(validatedParams.orden && { orden: validatedParams.orden }),
    };

    // Obtener metas del repositorio
    return metasRepository.findAll(filters, pagination);
  }

  /**
   * Encuentra todas las metas de un usuario específico.
   *
   * Método de conveniencia para obtener todas las metas de un usuario sin paginación.
   *
   * @async
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Meta[]>} Arreglo de metas del usuario
   * @throws {ValidationError} Si el usuarioId es inválido
   *
   * @example
   * ```typescript
   * const userMetas = await metasService.findByUsuarioId(23);
   * console.log(`El usuario tiene ${userMetas.length} metas`);
   * ```
   */
  async findByUsuarioId(usuarioId: number): Promise<Meta[]> {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      throw new ValidationError("El ID de usuario debe ser un número entero positivo");
    }

    return metasRepository.findByUsuarioId(usuarioId);
  }

  /**
   * Crea una nueva meta en el sistema.
   *
   * Este método:
   * 1. Valida los datos de entrada usando esquema Zod
   * 2. Valida reglas de negocio (fechaFin >= fechaInicio, montoObjetivo > 0)
   * 3. Crea la meta en el repositorio
   * 4. Retorna el ID de la meta creada
   *
   * @async
   * @param {CreateMetaInput} metaData - Los datos de la meta para creación
   * @returns {Promise<number>} El ID de la meta creada
   * @throws {ValidationError} Si los datos de entrada son inválidos
   * @throws {BadRequestError} Si las reglas de negocio no se cumplen
   *
   * @example
   * ```typescript
   * try {
   *   const metaId = await metasService.create({
   *     usuarioId: 23,
   *     nombre: 'Vacaciones 2026',
   *     montoObjetivo: 150000.00,
   *     fechaInicio: '2025-01-01T00:00:00Z',
   *     fechaFin: '2026-12-31T23:59:59Z',
   *     activa: true
   *   });
   *   console.log(`Meta creada con ID: ${metaId}`);
   * } catch (error) {
   *   if (error instanceof ValidationError) {
   *     console.error('Datos de meta inválidos:', error.message);
   *   }
   * }
   * ```
   */
  async create(metaData: CreateMetaInput): Promise<number> {
    // Validar datos de entrada
    try {
      CreateMetaSchema.parse(metaData);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Datos de meta inválidos"
      );
    }

    // Validaciones adicionales de negocio
    if (metaData.montoObjetivo <= 0) {
      throw new BadRequestError("El monto objetivo debe ser mayor a 0");
    }

    if (metaData.fechaFin) {
      const fechaInicio = new Date(metaData.fechaInicio);
      const fechaFin = new Date(metaData.fechaFin);

      if (fechaFin < fechaInicio) {
        throw new BadRequestError(
          "La fecha de fin debe ser mayor o igual a la fecha de inicio"
        );
      }
    }

    // Crear meta
    const meta = await metasRepository.create(metaData);
    return meta.metaId;
  }

  /**
   * Actualiza la información de una meta existente.
   *
   * Este método:
   * 1. Valida el ID de la meta
   * 2. Valida los datos de actualización
   * 3. Verifica si la meta existe
   * 4. Valida reglas de negocio (ahorroReal <= montoObjetivo, fechas válidas)
   * 5. Actualiza la meta
   *
   * @async
   * @param {number} metaId - El ID de la meta a actualizar
   * @param {UpdateMetaInput} updateData - Los campos a actualizar
   * @param {boolean} [isAdmin=false] - Si el usuario tiene permisos de admin
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   * @throws {ValidationError} Si el ID o los datos de actualización son inválidos
   * @throws {NotFoundError} Si la meta no existe
   * @throws {BadRequestError} Si las reglas de negocio no se cumplen
   *
   * @example
   * ```typescript
   * try {
   *   const updated = await metasService.update(7, {
   *     ahorroReal: 50000.00
   *   });
   *   console.log('Meta actualizada exitosamente');
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.error('Meta no encontrada');
   *   } else if (error instanceof ValidationError) {
   *     console.error('Datos de actualización inválidos');
   *   }
   * }
   * ```
   */
  async update(
    metaId: number,
    updateData: UpdateMetaInput,
    isAdmin: boolean = false
  ): Promise<boolean> {
    // Validar formato del ID
    try {
      MetaIdSchema.parse(metaId);
    } catch (error) {
      throw new ValidationError(`Formato de ID de meta inválido: ${metaId}`);
    }

    // Validar datos de actualización
    try {
      UpdateMetaSchema.parse(updateData);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Datos de actualización inválidos"
      );
    }

    // Verificar si la meta existe
    const existingMeta = await metasRepository.findById(metaId);
    if (!existingMeta) {
      throw new NotFoundError("Meta", metaId.toString());
    }

    // Validar reglas de negocio

    // 1. Validar que ahorroReal no supere montoObjetivo (sin permisos admin)
    const newAhorroReal = updateData.ahorroReal ?? existingMeta.ahorroReal;
    const newMontoObjetivo =
      updateData.montoObjetivo ?? existingMeta.montoObjetivo;

    if (!isAdmin && newAhorroReal > newMontoObjetivo) {
      throw new BadRequestError(
        "El ahorro real no puede superar el monto objetivo sin permisos de administrador"
      );
    }

    // 2. Validar que montoObjetivo sea positivo
    if (updateData.montoObjetivo !== undefined && updateData.montoObjetivo <= 0) {
      throw new BadRequestError("El monto objetivo debe ser mayor a 0");
    }

    // 3. Validar que ahorroReal no sea negativo
    if (updateData.ahorroReal !== undefined && updateData.ahorroReal < 0) {
      throw new BadRequestError("El ahorro real no puede ser negativo");
    }

    // 4. Validar fechas si se actualizan
    const newFechaInicio = updateData.fechaInicio ?? existingMeta.fechaInicio;
    const newFechaFin = updateData.fechaFin ?? existingMeta.fechaFin;

    if (newFechaFin) {
      const fechaInicio = new Date(newFechaInicio);
      const fechaFin = new Date(newFechaFin);

      if (fechaFin < fechaInicio) {
        throw new BadRequestError(
          "La fecha de fin debe ser mayor o igual a la fecha de inicio"
        );
      }
    }

    // Actualizar meta
    const updatedMeta = await metasRepository.update(metaId, updateData);

    // Esto nunca debería ser null debido a la verificación de existencia anterior,
    // pero TypeScript requiere manejar el caso null
    if (!updatedMeta) {
      throw new NotFoundError("Meta", metaId.toString());
    }

    return true;
  }

  /**
   * Elimina una meta del sistema (soft delete).
   *
   * Esta es una eliminación suave que marca la meta como inactiva en lugar de
   * eliminarla permanentemente. Esto preserva la integridad del dashboard histórico.
   *
   * @async
   * @param {number} metaId - El ID de la meta a eliminar
   * @param {number} usuarioId - El ID del usuario que solicita la eliminación
   * @returns {Promise<boolean>} True si la eliminación fue exitosa
   * @throws {ValidationError} Si el formato del ID es inválido
   * @throws {NotFoundError} Si la meta no existe
   * @throws {BadRequestError} Si el usuario no tiene permisos para eliminar la meta
   *
   * @example
   * ```typescript
   * try {
   *   const deleted = await metasService.delete(7, 23);
   *   console.log('Meta eliminada exitosamente');
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.error('Meta no encontrada');
   *   } else if (error instanceof BadRequestError) {
   *     console.error('Sin permisos para eliminar esta meta');
   *   }
   * }
   * ```
   */
  async delete(metaId: number, usuarioId: number): Promise<boolean> {
    // Validar formato del ID
    try {
      MetaIdSchema.parse(metaId);
    } catch (error) {
      throw new ValidationError(`Formato de ID de meta inválido: ${metaId}`);
    }

    // Verificar si la meta existe
    const existingMeta = await metasRepository.findById(metaId);
    if (!existingMeta) {
      throw new NotFoundError("Meta", metaId.toString());
    }

    // Validar que el usuario tenga permisos para eliminar la meta
    if (existingMeta.usuarioId !== usuarioId) {
      throw new BadRequestError(
        "No tiene permisos para eliminar esta meta"
      );
    }

    // Intentar eliminar (soft delete)
    const deleted = await metasRepository.delete(metaId);

    if (!deleted) {
      throw new NotFoundError("Meta", metaId.toString());
    }

    return deleted;
  }

  /**
   * Verifica si existe una meta con el ID dado.
   *
   * Esto es útil para propósitos de validación sin obtener el objeto de meta completo.
   *
   * @async
   * @param {number} metaId - El ID a verificar
   * @returns {Promise<boolean>} True si la meta existe, false en caso contrario
   * @throws {ValidationError} Si el formato del ID es inválido
   *
   * @example
   * ```typescript
   * const exists = await metasService.exists(7);
   *
   * if (exists) {
   *   console.log('La meta existe');
   * } else {
   *   console.log('La meta no existe');
   * }
   * ```
   */
  async exists(metaId: number): Promise<boolean> {
    // Validar formato del ID
    try {
      MetaIdSchema.parse(metaId);
    } catch (error) {
      throw new ValidationError(`Formato de ID de meta inválido: ${metaId}`);
    }

    return metasRepository.exists(metaId);
  }

  /**
   * Obtiene el conteo total de metas en el sistema.
   *
   * Útil para paginación, estadísticas y paneles administrativos.
   *
   * @async
   * @returns {Promise<number>} El número total de metas
   *
   * @example
   * ```typescript
   * const totalMetas = await metasService.count();
   * console.log(`Total de metas registradas: ${totalMetas}`);
   * ```
   */
  async count(): Promise<number> {
    return metasRepository.count();
  }

  /**
   * Obtiene el conteo de metas activas de un usuario.
   *
   * @async
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<number>} El número de metas activas del usuario
   * @throws {ValidationError} Si el usuarioId es inválido
   *
   * @example
   * ```typescript
   * const activeCount = await metasService.countActiveByUsuario(23);
   * console.log(`El usuario tiene ${activeCount} metas activas`);
   * ```
   */
  async countActiveByUsuario(usuarioId: number): Promise<number> {
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
      throw new ValidationError("El ID de usuario debe ser un número entero positivo");
    }

    return metasRepository.countActiveByUsuario(usuarioId);
  }
}

/**
 * Instancia singleton de MetasService.
 *
 * Esto asegura un uso de servicio consistente en toda la aplicación.
 * En aplicaciones más grandes, podrías usar inyección de dependencias en su lugar.
 *
 * @constant
 * @type {MetasService}
 *
 * @example
 * ```typescript
 * import { metasService } from './services/metas.service';
 *
 * const meta = await metasService.findById(7);
 * ```
 */
export const metasService = new MetasService();
