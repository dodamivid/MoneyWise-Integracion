/**
 * @fileoverview Repositorio en memoria para la gestión de datos de Meta.
 *
 * Este módulo proporciona una capa de acceso a datos para entidades Meta usando un
 * mecanismo de almacenamiento en memoria. Implementa el patrón Repository para abstraer
 * la lógica de persistencia de datos de la lógica de negocio.
 *
 * Características clave:
 * - Almacenamiento en memoria usando Map para búsquedas O(1)
 * - Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar)
 * - Generación automática de IDs incrementales
 * - Gestión automática de marcas de tiempo
 * - Soporte para filtros (usuarioId, fechas, estado activo)
 * - Soporte para paginación y ordenamiento
 * - Cálculo automático de porcentaje de avance
 * - Soft delete para preservar integridad de dashboard
 *
 * **Nota**: Esta implementación usa almacenamiento en memoria y perderá todos los datos
 * cuando la aplicación se reinicie. En producción, esto debe reemplazarse con
 * una solución de almacenamiento persistente (ej. MySQL con stored procedures).
 *
 * @module repositories/metas.repository
 * @category Repositories
 *
 * @example
 * ```typescript
 * import { metasRepository } from './repositories/metas.repository';
 *
 * // Crear una nueva meta
 * const meta = await metasRepository.create({
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   fechaFin: '2026-12-31T23:59:59Z',
 *   activa: true
 * });
 *
 * // Buscar meta por ID
 * const foundMeta = await metasRepository.findById(meta.metaId);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import { Meta, CreateMetaInput, UpdateMetaInput } from "../models/meta.model";

/**
 * Tipo para filtros de consulta de metas.
 *
 * @interface MetaFilters
 * @property {number} [usuarioId] - Filtrar por ID de usuario
 * @property {string} [desde] - Fecha de inicio del rango (ISO 8601)
 * @property {string} [hasta] - Fecha de fin del rango (ISO 8601)
 * @property {boolean} [activa] - Filtrar por estado activo
 */
export interface MetaFilters {
  usuarioId?: number;
  desde?: string;
  hasta?: string;
  activa?: boolean;
}

/**
 * Tipo para opciones de paginación.
 *
 * @interface PaginationOptions
 * @property {number} pagina - Número de página (base 1)
 * @property {number} tamanoPagina - Cantidad de elementos por página
 * @property {string} [orden] - Campo y dirección de ordenamiento
 */
export interface PaginationOptions {
  pagina: number;
  tamanoPagina: number;
  orden?: string;
}

/**
 * Resultado de consulta paginada.
 *
 * @interface PaginatedResult
 * @property {Meta[]} metas - Arreglo de metas
 * @property {number} total - Total de registros que coinciden con los filtros
 */
export interface PaginatedResult {
  metas: Meta[];
  total: number;
}

/**
 * Clase repositorio para gestionar entidades Meta en memoria.
 *
 * Esta clase implementa el patrón Repository, proporcionando una interfaz limpia
 * para operaciones de datos. Usa un Map para búsquedas eficientes O(1) por ID.
 *
 * @class MetasRepository
 *
 * @example
 * ```typescript
 * const repository = new MetasRepository();
 *
 * // Crear metas
 * const meta1 = await repository.create({
 *   usuarioId: 23,
 *   nombre: 'Vacaciones 2026',
 *   montoObjetivo: 150000.00,
 *   fechaInicio: '2025-01-01T00:00:00Z',
 *   activa: true
 * });
 *
 * // Obtener metas por usuario
 * const userMetas = await repository.findAll({ usuarioId: 23 });
 * ```
 */
export class MetasRepository {
  /**
   * Almacenamiento en memoria para metas, usando ID numérico como clave.
   *
   * Usar un Map proporciona complejidad de tiempo O(1) para búsquedas, inserciones y eliminaciones.
   *
   * @private
   * @type {Map<number, Meta>}
   */
  private metas: Map<number, Meta> = new Map();

  /**
   * Contador para generar IDs autoincrementales.
   *
   * @private
   * @type {number}
   */
  private nextId: number = 1;

  /**
   * Crea una nueva meta y la almacena en memoria.
   *
   * Este método:
   * 1. Genera un ID autoincremental único para la meta
   * 2. Establece marcas de tiempo de creación y actualización
   * 3. Inicializa ahorroReal en 0.00 si no se proporciona
   * 4. Calcula el porcentaje de avance inicial (0%)
   * 5. Almacena la meta en el repositorio
   *
   * @async
   * @param {CreateMetaInput} metaData - Los datos de la meta para creación
   * @returns {Promise<Meta>} La meta creada con ID y marcas de tiempo generadas
   *
   * @example
   * ```typescript
   * const newMeta = await metasRepository.create({
   *   usuarioId: 23,
   *   nombre: 'Vacaciones 2026',
   *   montoObjetivo: 150000.00,
   *   fechaInicio: '2025-01-01T00:00:00Z',
   *   fechaFin: '2026-12-31T23:59:59Z',
   *   activa: true
   * });
   *
   * console.log(newMeta.metaId); // 1
   * console.log(newMeta.ahorroReal); // 0.00
   * console.log(newMeta.porcentajeAvance); // 0.00
   * ```
   */
  async create(metaData: CreateMetaInput): Promise<Meta> {
    const now = new Date().toISOString();
    const metaId = this.nextId++;

    // Calcular porcentaje de avance inicial (siempre 0% al crear)
    const ahorroReal = 0.0;
    const porcentajeAvance = 0.0;

    const meta: Meta = {
      metaId,
      usuarioId: metaData.usuarioId,
      nombre: metaData.nombre,
      montoObjetivo: metaData.montoObjetivo,
      ahorroReal,
      porcentajeAvance,
      activa: metaData.activa ?? true,
      fechaInicio: metaData.fechaInicio,
      ...(metaData.fechaFin && { fechaFin: metaData.fechaFin }),
      creadoEn: now,
      actualizadoEn: now,
    };

    // Almacenar meta en memoria
    this.metas.set(metaId, meta);
    return meta;
  }

  /**
   * Encuentra una meta por su ID único.
   *
   * Esta es la operación de búsqueda más eficiente con complejidad de tiempo O(1).
   *
   * @async
   * @param {number} metaId - El ID de la meta a buscar
   * @returns {Promise<Meta | null>} La meta si se encuentra, null en caso contrario
   *
   * @example
   * ```typescript
   * const meta = await metasRepository.findById(7);
   *
   * if (meta) {
   *   console.log(`Meta encontrada: ${meta.nombre}`);
   * } else {
   *   console.log('Meta no encontrada');
   * }
   * ```
   */
  async findById(metaId: number): Promise<Meta | null> {
    const meta = this.metas.get(metaId);
    return meta ?? null;
  }

  /**
   * Encuentra metas con filtros, paginación y ordenamiento.
   *
   * Esta operación tiene complejidad de tiempo O(n) ya que requiere iterar
   * a través de todas las metas para aplicar filtros. En una base de datos de
   * producción, esto usaría índices y stored procedures para mejor rendimiento.
   *
   * @async
   * @param {MetaFilters} [filters={}] - Filtros opcionales
   * @param {PaginationOptions} [pagination] - Opciones de paginación
   * @returns {Promise<PaginatedResult>} Resultado paginado con metas y total
   *
   * @example
   * ```typescript
   * // Obtener metas activas de un usuario, paginadas
   * const result = await metasRepository.findAll(
   *   { usuarioId: 23, activa: true },
   *   { pagina: 1, tamanoPagina: 20, orden: 'fechaInicio:desc' }
   * );
   *
   * console.log(`Total de metas: ${result.total}`);
   * console.log(`Metas en esta página: ${result.metas.length}`);
   * ```
   */
  async findAll(
    filters: MetaFilters = {},
    pagination?: PaginationOptions
  ): Promise<PaginatedResult> {
    // Obtener todas las metas y aplicar filtros
    let filteredMetas = Array.from(this.metas.values());

    // Filtrar por usuarioId
    if (filters.usuarioId !== undefined) {
      filteredMetas = filteredMetas.filter(
        (meta) => meta.usuarioId === filters.usuarioId
      );
    }

    // Filtrar por estado activo
    if (filters.activa !== undefined) {
      filteredMetas = filteredMetas.filter((meta) => meta.activa === filters.activa);
    }

    // Filtrar por rango de fechas (usando fechaInicio de la meta)
    if (filters.desde) {
      const desde = new Date(filters.desde);
      filteredMetas = filteredMetas.filter(
        (meta) => new Date(meta.fechaInicio) >= desde
      );
    }

    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      filteredMetas = filteredMetas.filter((meta) => {
        // Si la meta tiene fechaFin, usar esa; de lo contrario, usar fechaInicio
        const fechaComparar = meta.fechaFin
          ? new Date(meta.fechaFin)
          : new Date(meta.fechaInicio);
        return fechaComparar <= hasta;
      });
    }

    const total = filteredMetas.length;

    // Aplicar ordenamiento si se especifica
    if (pagination?.orden) {
      const [campo, direccion = "asc"] = pagination.orden.split(":");
      filteredMetas = this.sortMetas(filteredMetas, campo, direccion as "asc" | "desc");
    }

    // Aplicar paginación si se especifica
    if (pagination) {
      const { pagina, tamanoPagina } = pagination;
      const startIndex = (pagina - 1) * tamanoPagina;
      const endIndex = startIndex + tamanoPagina;
      filteredMetas = filteredMetas.slice(startIndex, endIndex);
    }

    return {
      metas: filteredMetas,
      total,
    };
  }

  /**
   * Encuentra todas las metas de un usuario específico.
   *
   * Método de conveniencia para obtener todas las metas de un usuario sin paginación.
   *
   * @async
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Meta[]>} Arreglo de metas del usuario
   *
   * @example
   * ```typescript
   * const userMetas = await metasRepository.findByUsuarioId(23);
   * console.log(`El usuario tiene ${userMetas.length} metas`);
   * ```
   */
  async findByUsuarioId(usuarioId: number): Promise<Meta[]> {
    const result = await this.findAll({ usuarioId });
    return result.metas;
  }

  /**
   * Actualiza la información de una meta existente.
   *
   * Este método:
   * 1. Valida que la meta existe
   * 2. Fusiona los datos de actualización con los datos existentes de la meta
   * 3. Recalcula el porcentaje de avance si cambian montoObjetivo o ahorroReal
   * 4. Actualiza la marca de tiempo actualizadoEn
   *
   * @async
   * @param {number} metaId - El ID de la meta a actualizar
   * @param {UpdateMetaInput} updateData - Los campos a actualizar
   * @returns {Promise<Meta | null>} La meta actualizada si se encuentra, null en caso contrario
   *
   * @example
   * ```typescript
   * // Actualizar solo el ahorro real
   * const updated = await metasRepository.update(7, {
   *   ahorroReal: 50000.00
   * });
   *
   * // Actualizar múltiples campos
   * const updated = await metasRepository.update(7, {
   *   nombre: 'Vacaciones Europa 2026',
   *   montoObjetivo: 200000.00,
   *   ahorroReal: 75000.00
   * });
   *
   * if (updated) {
   *   console.log(`Nuevo porcentaje: ${updated.porcentajeAvance}%`);
   * }
   * ```
   */
  async update(metaId: number, updateData: UpdateMetaInput): Promise<Meta | null> {
    const existingMeta = await this.findById(metaId);
    if (!existingMeta) {
      return null;
    }

    // Fusionar datos de actualización con datos existentes de la meta
    const updatedMeta: Meta = {
      ...existingMeta,
      ...updateData,
      actualizadoEn: new Date().toISOString(),
    };

    // Recalcular porcentaje de avance si cambió montoObjetivo o ahorroReal
    const montoObjetivo =
      updateData.montoObjetivo ?? existingMeta.montoObjetivo;
    const ahorroReal = updateData.ahorroReal ?? existingMeta.ahorroReal;
    updatedMeta.porcentajeAvance = this.calcularPorcentajeAvance(
      ahorroReal,
      montoObjetivo
    );

    // Actualizar en almacenamiento
    this.metas.set(metaId, updatedMeta);
    return updatedMeta;
  }

  /**
   * Elimina una meta del repositorio (soft delete).
   *
   * Esta implementación realiza un soft delete estableciendo `activa = false`
   * en lugar de eliminar físicamente el registro. Esto preserva la integridad
   * del dashboard histórico.
   *
   * @async
   * @param {number} metaId - El ID de la meta a eliminar
   * @returns {Promise<boolean>} True si la meta fue eliminada, false si no se encontró
   *
   * @example
   * ```typescript
   * const wasDeleted = await metasRepository.delete(7);
   *
   * if (wasDeleted) {
   *   console.log('Meta eliminada exitosamente (soft delete)');
   * } else {
   *   console.log('Meta no encontrada');
   * }
   * ```
   */
  async delete(metaId: number): Promise<boolean> {
    const existingMeta = await this.findById(metaId);
    if (!existingMeta) {
      return false;
    }

    // Soft delete: marcar como inactiva
    const updated = await this.update(metaId, {
      activa: false,
      actualizadoEn: new Date().toISOString(),
    });

    return updated !== null;
  }

  /**
   * Elimina permanentemente una meta del repositorio (hard delete).
   *
   * **ADVERTENCIA**: Esta operación es destructiva y no puede deshacerse.
   * Solo debe usarse para propósitos de prueba o desarrollo.
   * En producción, se recomienda usar el método `delete()` que hace soft delete.
   *
   * @async
   * @param {number} metaId - El ID de la meta a eliminar permanentemente
   * @returns {Promise<boolean>} True si la meta fue eliminada, false si no se encontró
   *
   * @example
   * ```typescript
   * const wasDeleted = await metasRepository.hardDelete(7);
   * ```
   */
  async hardDelete(metaId: number): Promise<boolean> {
    return this.metas.delete(metaId);
  }

  /**
   * Obtiene el conteo total de metas en el repositorio.
   *
   * Útil para paginación y estadísticas.
   *
   * @async
   * @returns {Promise<number>} El número total de metas
   *
   * @example
   * ```typescript
   * const count = await metasRepository.count();
   * console.log(`Total de metas en el sistema: ${count}`);
   * ```
   */
  async count(): Promise<number> {
    return this.metas.size;
  }

  /**
   * Obtiene el conteo de metas activas de un usuario.
   *
   * @async
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<number>} El número de metas activas del usuario
   *
   * @example
   * ```typescript
   * const activeCount = await metasRepository.countActiveByUsuario(23);
   * console.log(`El usuario tiene ${activeCount} metas activas`);
   * ```
   */
  async countActiveByUsuario(usuarioId: number): Promise<number> {
    const result = await this.findAll({ usuarioId, activa: true });
    return result.total;
  }

  /**
   * Verifica si existe una meta con el ID dado.
   *
   * Esto es más eficiente que findById cuando solo necesitas verificar
   * existencia sin recuperar el objeto de meta completo.
   *
   * @async
   * @param {number} metaId - El ID a verificar
   * @returns {Promise<boolean>} True si la meta existe, false en caso contrario
   *
   * @example
   * ```typescript
   * const exists = await metasRepository.exists(7);
   *
   * if (exists) {
   *   console.log('La meta existe');
   * } else {
   *   console.log('La meta no existe');
   * }
   * ```
   */
  async exists(metaId: number): Promise<boolean> {
    return this.metas.has(metaId);
  }

  /**
   * Limpia todas las metas del repositorio.
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
   *   await metasRepository.clear();
   * });
   * ```
   */
  async clear(): Promise<void> {
    this.metas.clear();
    this.nextId = 1; // Resetear el contador de IDs
  }

  /**
   * Calcula el porcentaje de avance de una meta.
   *
   * @private
   * @param {number} ahorroReal - Monto ahorrado actual
   * @param {number} montoObjetivo - Monto objetivo
   * @returns {number} Porcentaje de avance (0-100+)
   */
  private calcularPorcentajeAvance(
    ahorroReal: number,
    montoObjetivo: number
  ): number {
    if (montoObjetivo === 0) {
      return 0;
    }
    const porcentaje = (ahorroReal / montoObjetivo) * 100;
    // Redondear a 2 decimales
    return Math.round(porcentaje * 100) / 100;
  }

  /**
   * Ordena un arreglo de metas según el campo y dirección especificados.
   *
   * @private
   * @param {Meta[]} metas - Arreglo de metas a ordenar
   * @param {string} campo - Campo por el cual ordenar
   * @param {"asc" | "desc"} direccion - Dirección del ordenamiento
   * @returns {Meta[]} Arreglo de metas ordenado
   */
  private sortMetas(
    metas: Meta[],
    campo: string,
    direccion: "asc" | "desc"
  ): Meta[] {
    return metas.sort((a, b) => {
      let comparison = 0;

      switch (campo) {
        case "fechaInicio":
          comparison =
            new Date(a.fechaInicio).getTime() -
            new Date(b.fechaInicio).getTime();
          break;

        case "fechaFin":
          // Manejar casos donde fechaFin es opcional
          const aFin = a.fechaFin ? new Date(a.fechaFin).getTime() : 0;
          const bFin = b.fechaFin ? new Date(b.fechaFin).getTime() : 0;
          comparison = aFin - bFin;
          break;

        case "creadoEn":
          comparison =
            new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime();
          break;

        case "montoObjetivo":
          comparison = a.montoObjetivo - b.montoObjetivo;
          break;

        case "porcentajeAvance":
          comparison = a.porcentajeAvance - b.porcentajeAvance;
          break;

        default:
          comparison = 0;
      }

      return direccion === "desc" ? -comparison : comparison;
    });
  }
}

/**
 * Instancia singleton de MetasRepository.
 *
 * Esto asegura que todas las partes de la aplicación usen el mismo
 * almacén de datos en memoria. En una aplicación de producción con una base de datos real,
 * podrías usar inyección de dependencias en su lugar.
 *
 * @constant
 * @type {MetasRepository}
 *
 * @example
 * ```typescript
 * import { metasRepository } from './repositories/metas.repository';
 *
 * // Usar la instancia singleton
 * const meta = await metasRepository.findById(metaId);
 * ```
 */
export const metasRepository = new MetasRepository();
