import { Pool, RowDataPacket } from "mysql2/promise";
import { TipoEgresoDTO } from "../dtos/tiposEgreso.dto";

/**
 * @fileoverview Repository para operaciones de Tipos de Egreso
 * Issue #21 - Maneja la comunicación con stored procedures de la BD
 */

// ============================================
// INTERFACES INTERNAS
// ============================================

interface TipoEgresoConTotal extends RowDataPacket {
  tipoEgresoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
  totalRegistros: number;
}

interface TipoEgresoCreadoRow extends RowDataPacket {
  tipoEgresoId: number;
  nombre: string;
}

interface ResultadoOperacionRow extends RowDataPacket {
  actualizado?: boolean;
  eliminado?: boolean;
}

// ============================================
// REPOSITORY - TIPOS DE EGRESO
// ============================================

export class TiposEgresoRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Listar tipos de egreso con paginación
   * Llama al SP: sp_tiposEgreso_listar
   * 
   * @param usuarioId - ID del usuario autenticado
   * @param buscar - Término de búsqueda (opcional)
   * @param pagina - Número de página (default: 1)
   * @param tamanoPagina - Registros por página (default: 20, max: 100)
   * @param orden - Campo de orden (default: "nombre:asc")
   * @returns Lista de tipos de egreso y total de registros
   */
  async listarTiposEgreso(
    usuarioId: string,
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ datos: TipoEgresoDTO[]; total: number }> {
    try {
      const [rows] = await this.pool.query<TipoEgresoConTotal[]>(
        "CALL sp_tiposEgreso_listar(?, ?, ?, ?, ?)",
        [usuarioId, buscar, pagina, tamanoPagina, orden]
      );

      // Los SPs retornan un array de resultsets, tomamos el primero
      const resultados = (rows as any)[0] as TipoEgresoConTotal[];

      if (!resultados || resultados.length === 0) {
        return { datos: [], total: 0 };
      }

      const total = resultados[0]?.totalRegistros || 0;

      const datos: TipoEgresoDTO[] = resultados.map((row) => ({
        tipoEgresoId: row.tipoEgresoId,
        usuarioId: row.usuarioId,
        nombre: row.nombre,
        esPorDefecto: Boolean(row.esPorDefecto),
        creadoEn: row.creadoEn.toISOString(),
        actualizadoEn: row.actualizadoEn.toISOString(),
      }));

      return { datos, total };
    } catch (error) {
      console.error("[TiposEgresoRepository] Error en listarTiposEgreso:", error);
      throw error;
    }
  }

  /**
   * Crear nuevo tipo de egreso
   * Llama al SP: sp_tiposEgreso_crear
   * 
   * @param usuarioId - ID del usuario autenticado
   * @param nombre - Nombre del tipo de egreso (3-60 caracteres)
   * @returns Tipo de egreso creado con su ID
   */
  async crearTipoEgreso(
    usuarioId: string,
    nombre: string
  ): Promise<{ tipoEgresoId: number; nombre: string }> {
    try {
      const [rows] = await this.pool.query<TipoEgresoCreadoRow[]>(
        "CALL sp_tiposEgreso_crear(?, ?)",
        [usuarioId, nombre]
      );

      const resultado = (rows as any)[0] as TipoEgresoCreadoRow[];

      if (!resultado || resultado.length === 0) {
        throw new Error("No se pudo crear el tipo de egreso");
      }

      return {
        tipoEgresoId: resultado[0].tipoEgresoId,
        nombre: resultado[0].nombre,
      };
    } catch (error: any) {
      // Propagar errores del SP (el equipo de BD define los mensajes)
      if (error.sqlState === "45000") {
        throw new Error(error.sqlMessage || "Error al crear tipo de egreso");
      }
      console.error("[TiposEgresoRepository] Error en crearTipoEgreso:", error);
      throw error;
    }
  }

  /**
   * Actualizar tipo de egreso existente
   * Llama al SP: sp_tiposEgreso_actualizar
   * 
   * @param tipoEgresoId - ID del tipo de egreso a actualizar
   * @param usuarioId - ID del usuario autenticado
   * @param nombre - Nuevo nombre del tipo de egreso
   * @returns true si se actualizó correctamente
   */
  async actualizarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<boolean> {
    try {
      const [rows] = await this.pool.query<ResultadoOperacionRow[]>(
        "CALL sp_tiposEgreso_actualizar(?, ?, ?)",
        [tipoEgresoId, usuarioId, nombre]
      );

      const resultado = (rows as any)[0] as ResultadoOperacionRow[];

      if (!resultado || resultado.length === 0) {
        return false;
      }

      return Boolean(resultado[0].actualizado);
    } catch (error: any) {
      // Propagar errores del SP
      if (error.sqlState === "45000") {
        throw new Error(error.sqlMessage || "Error al actualizar tipo de egreso");
      }
      console.error("[TiposEgresoRepository] Error en actualizarTipoEgreso:", error);
      throw error;
    }
  }

  /**
   * Eliminar tipo de egreso (soft delete)
   * Llama al SP: sp_tiposEgreso_eliminar
   * 
   * @param tipoEgresoId - ID del tipo de egreso a eliminar
   * @param usuarioId - ID del usuario autenticado
   * @returns true si se eliminó correctamente
   */
  async eliminarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string
  ): Promise<boolean> {
    try {
      const [rows] = await this.pool.query<ResultadoOperacionRow[]>(
        "CALL sp_tiposEgreso_eliminar(?, ?)",
        [tipoEgresoId, usuarioId]
      );

      const resultado = (rows as any)[0] as ResultadoOperacionRow[];

      if (!resultado || resultado.length === 0) {
        return false;
      }

      return Boolean(resultado[0].eliminado);
    } catch (error: any) {
      // Propagar errores del SP
      if (error.sqlState === "45000") {
        throw new Error(error.sqlMessage || "Error al eliminar tipo de egreso");
      }
      console.error("[TiposEgresoRepository] Error en eliminarTipoEgreso:", error);
      throw error;
    }
  }
}