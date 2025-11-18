/**
 * Repository para Catálogos - Procedencias de Ingreso
 * Maneja la comunicación con la base de datos mediante Stored Procedures
 * Fecha: 2025-10-31
 * Archivo: src/repositories/catalogosProcedencia.repository.ts
 */

import pool from '../config/db';
import { ProcedenciaDto } from '../dtos/catalogosProcedencia.dto';
import { RowDataPacket } from 'mysql2';

/**
 * Repository para gestionar Procedencias de Ingreso
 */
export class CatalogosProcedenciaRepository {
  /**
   * Lista procedencias con filtros y paginación
   * SP: sp_procedencias_listar
   * 
   * @param usuarioId - ID del usuario autenticado
   * @param buscar - Término de búsqueda (opcional)
   * @param pagina - Número de página
   * @param tamanoPagina - Cantidad de registros por página
   * @param orden - Campo y dirección de ordenamiento
   * @returns Array de procedencias y total de registros
   */
  async listarProcedencias(
    usuarioId: number,
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ procedencias: ProcedenciaDto[]; total: number }> {
    try {
      const connection = await pool.getConnection();

      // Llamar al Stored Procedure
      const [rows] = await connection.query<RowDataPacket[]>(
        'CALL sp_procedencias_listar(?, ?, ?, ?, ?)',
        [usuarioId, buscar, pagina, tamanoPagina, orden]
      );

      connection.release();

      // El resultado del SP viene en rows[0]
      const resultado = rows[0] as any[];

      // Si no hay resultados, retornar array vacío
      if (!resultado || resultado.length === 0) {
        return { procedencias: [], total: 0 };
      }

      // El total viene en el primer registro (campo totalRegistros)
      const total = resultado[0]?.totalRegistros || 0;

      // Mapear los resultados al DTO
      const procedencias: ProcedenciaDto[] = resultado.map((row: any) => ({
        procedenciaId: row.procedenciaId,
        usuarioId: row.usuarioId,
        nombre: row.nombre,
        esPorDefecto: Boolean(row.esPorDefecto),
        creadoEn: row.creadoEn,
        actualizadoEn: row.actualizadoEn,
      }));

      return { procedencias, total };
    } catch (error: any) {
      console.error('Error en listarProcedencias:', error);
      throw new Error(`Error al listar procedencias: ${error.message}`);
    }
  }

  /**
   * Crea una nueva procedencia
   * SP: sp_procedencias_crear
   * 
   * @param usuarioId - ID del usuario que crea la procedencia
   * @param nombre - Nombre de la procedencia
   * @returns ID y nombre de la procedencia creada
   */
  async crearProcedencia(
    usuarioId: number,
    nombre: string
  ): Promise<{ procedenciaId: number; nombre: string }> {
    try {
      const connection = await pool.getConnection();

      const [rows] = await connection.query<RowDataPacket[]>(
        'CALL sp_procedencias_crear(?, ?)',
        [usuarioId, nombre]
      );

      connection.release();

      const resultado = rows[0] as any[];

      if (!resultado || resultado.length === 0) {
        throw new Error('No se pudo crear la procedencia');
      }

      return {
        procedenciaId: resultado[0].procedenciaId,
        nombre: resultado[0].nombre,
      };
    } catch (error: any) {
      console.error('Error en crearProcedencia:', error);

      // Detectar error de duplicado (MySQL)
      if (
        error.code === 'ER_DUP_ENTRY' ||
        error.sqlMessage?.toLowerCase().includes('duplicate') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        throw new Error('DUPLICADO');
      }

      throw new Error(`Error al crear procedencia: ${error.message}`);
    }
  }

  /**
   * Actualiza una procedencia existente
   * SP: sp_procedencias_actualizar
   * 
   * @param procedenciaId - ID de la procedencia a actualizar
   * @param usuarioId - ID del usuario que actualiza
   * @param nombre - Nuevo nombre de la procedencia
   * @returns Indica si la actualización fue exitosa
   */
  async actualizarProcedencia(
    procedenciaId: number,
    usuarioId: number,
    nombre: string
  ): Promise<{ actualizado: boolean }> {
    try {
      const connection = await pool.getConnection();

      const [rows] = await connection.query<RowDataPacket[]>(
        'CALL sp_procedencias_actualizar(?, ?, ?)',
        [procedenciaId, usuarioId, nombre]
      );

      connection.release();

      const resultado = rows[0] as any[];

      if (!resultado || resultado.length === 0) {
        throw new Error('NO_ENCONTRADO');
      }

      return {
        actualizado: Boolean(resultado[0].actualizado),
      };
    } catch (error: any) {
      console.error('Error en actualizarProcedencia:', error);

      // Error personalizado del SP
      if (error.message === 'NO_ENCONTRADO') {
        throw error;
      }

      // Detectar error de duplicado
      if (
        error.code === 'ER_DUP_ENTRY' ||
        error.sqlMessage?.toLowerCase().includes('duplicate')
      ) {
        throw new Error('DUPLICADO');
      }

      // Detectar error de permisos (intento de editar preset global)
      if (
        error.sqlMessage?.toLowerCase().includes('preset') ||
        error.sqlMessage?.toLowerCase().includes('defecto') ||
        error.sqlMessage?.toLowerCase().includes('permiso')
      ) {
        throw new Error('PERMISO_DENEGADO');
      }

      throw new Error(`Error al actualizar procedencia: ${error.message}`);
    }
  }

  /**
   * Elimina (soft delete) una procedencia
   * SP: sp_procedencias_eliminar
   * 
   * @param procedenciaId - ID de la procedencia a eliminar
   * @param usuarioId - ID del usuario que elimina
   * @returns Indica si la eliminación fue exitosa
   */
  async eliminarProcedencia(
    procedenciaId: number,
    usuarioId: number
  ): Promise<{ eliminado: boolean }> {
    try {
      const connection = await pool.getConnection();

      const [rows] = await connection.query<RowDataPacket[]>(
        'CALL sp_procedencias_eliminar(?, ?)',
        [procedenciaId, usuarioId]
      );

      connection.release();

      const resultado = rows[0] as any[];

      if (!resultado || resultado.length === 0) {
        throw new Error('NO_ENCONTRADO');
      }

      return {
        eliminado: Boolean(resultado[0].eliminado),
      };
    } catch (error: any) {
      console.error('Error en eliminarProcedencia:', error);

      // Error personalizado del SP
      if (error.message === 'NO_ENCONTRADO') {
        throw error;
      }

      // Detectar error de permisos (intento de eliminar preset global)
      if (
        error.sqlMessage?.toLowerCase().includes('preset') ||
        error.sqlMessage?.toLowerCase().includes('defecto') ||
        error.sqlMessage?.toLowerCase().includes('permiso')
      ) {
        throw new Error('PERMISO_DENEGADO');
      }

      throw new Error(`Error al eliminar procedencia: ${error.message}`);
    }
  }
}