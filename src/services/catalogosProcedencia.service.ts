/**
 * Service para Catálogos - Procedencias de Ingreso
 * Contiene la lógica de negocio y validaciones
 * Fecha: 2025-10-31
 * Archivo: src/services/catalogosProcedencia.service.ts
 */

import { CatalogosProcedenciaRepository } from '../repositories/catalogosProcedencia.repository';
import {
  ValidacionProcedencia,
  RespuestaListaProcedencias,
  RespuestaCrearProcedencia,
  RespuestaActualizarProcedencia,
  RespuestaEliminarProcedencia,
} from '../dtos/catalogosProcedencia.dto';

/**
 * Service para gestionar la lógica de negocio de Procedencias
 */
export class CatalogosProcedenciaService {
  private repository: CatalogosProcedenciaRepository;

  constructor() {
    this.repository = new CatalogosProcedenciaRepository();
  }

  /**
   * Lista procedencias con filtros y paginación
   * 
   * @param usuarioId - ID del usuario autenticado
   * @param buscar - Término de búsqueda (opcional)
   * @param pagina - Número de página (default: 1)
   * @param tamanoPagina - Registros por página (default: 20, max: 100)
   * @param orden - Ordenamiento (default: nombre:asc)
   * @returns Respuesta con array de procedencias y metadata
   */
  async listarProcedencias(
    usuarioId: number,
    buscar?: string,
    pagina?: number,
    tamanoPagina?: number,
    orden?: string
  ): Promise<RespuestaListaProcedencias> {
    // Validar y normalizar paginación
    const validacionPaginacion = ValidacionProcedencia.validarPaginacion(
      pagina,
      tamanoPagina
    );

    // Validar orden
    const validacionOrden = ValidacionProcedencia.validarOrden(orden);
    if (!validacionOrden.valido) {
      throw {
        codigo: 'DATOS_INVALIDOS',
        status: 422,
        mensaje: validacionOrden.error,
      };
    }

    // Normalizar búsqueda (trim o null)
    const buscarNormalizado = buscar?.trim() || null;

    // Llamar al repository
    const { procedencias, total } = await this.repository.listarProcedencias(
      usuarioId,
      buscarNormalizado,
      validacionPaginacion.paginaValida,
      validacionPaginacion.tamanoValido,
      validacionOrden.ordenValido
    );

    return {
      ok: true,
      data: procedencias,
      meta: {
        paginacion: {
          pagina: validacionPaginacion.paginaValida,
          tamanoPagina: validacionPaginacion.tamanoValido,
          total,
        },
      },
    };
  }

  /**
   * Crea una nueva procedencia
   * 
   * @param usuarioId - ID del usuario que crea la procedencia
   * @param nombre - Nombre de la procedencia (3-100 caracteres)
   * @returns Respuesta con ID y nombre de la procedencia creada
   */
  async crearProcedencia(
    usuarioId: number,
    nombre: string
  ): Promise<RespuestaCrearProcedencia> {
    // Validar nombre
    const validacion = ValidacionProcedencia.validarNombre(nombre);
    if (!validacion.valido) {
      throw {
        codigo: 'DATOS_INVALIDOS',
        status: 422,
        mensaje: validacion.error,
      };
    }

    try {
      const resultado = await this.repository.crearProcedencia(
        usuarioId,
        nombre.trim()
      );

      return {
        ok: true,
        data: resultado,
      };
    } catch (error: any) {
      // Manejo de error de duplicado
      if (error.message === 'DUPLICADO') {
        throw {
          codigo: 'DUPLICADO',
          status: 409,
          mensaje: 'Ya existe una procedencia con ese nombre',
        };
      }
      throw error;
    }
  }

  /**
   * Actualiza una procedencia existente
   * 
   * @param procedenciaId - ID de la procedencia a actualizar
   * @param usuarioId - ID del usuario que actualiza
   * @param nombre - Nuevo nombre de la procedencia
   * @param esAdmin - Indica si el usuario tiene permisos de admin
   * @returns Respuesta indicando si la actualización fue exitosa
   */
  async actualizarProcedencia(
    procedenciaId: number,
    usuarioId: number,
    nombre: string,
    esAdmin: boolean = false
  ): Promise<RespuestaActualizarProcedencia> {
    // Validar ID
    const validacionId = ValidacionProcedencia.validarId(procedenciaId);
    if (!validacionId.valido) {
      throw {
        codigo: 'DATOS_INVALIDOS',
        status: 422,
        mensaje: validacionId.error,
      };
    }

    // Validar nombre
    const validacion = ValidacionProcedencia.validarNombre(nombre);
    if (!validacion.valido) {
      throw {
        codigo: 'DATOS_INVALIDOS',
        status: 422,
        mensaje: validacion.error,
      };
    }

    try {
      const resultado = await this.repository.actualizarProcedencia(
        procedenciaId,
        usuarioId,
        nombre.trim()
      );

      return {
        ok: true,
        data: resultado,
      };
    } catch (error: any) {
      // Manejo de errores específicos
      if (error.message === 'NO_ENCONTRADO') {
        throw {
          codigo: 'NO_ENCONTRADO',
          status: 404,
          mensaje: 'Procedencia no encontrada',
        };
      }
      if (error.message === 'DUPLICADO') {
        throw {
          codigo: 'DUPLICADO',
          status: 409,
          mensaje: 'Ya existe una procedencia con ese nombre',
        };
      }
      if (error.message === 'PERMISO_DENEGADO') {
        throw {
          codigo: 'PERMISO_DENEGADO',
          status: 403,
          mensaje:
            'No se pueden editar procedencias predeterminadas sin permisos de administrador',
        };
      }
      throw error;
    }
  }

  /**
   * Elimina una procedencia (soft delete)
   * 
   * @param procedenciaId - ID de la procedencia a eliminar
   * @param usuarioId - ID del usuario que elimina
   * @param esAdmin - Indica si el usuario tiene permisos de admin
   * @returns Respuesta indicando si la eliminación fue exitosa
   */
  async eliminarProcedencia(
    procedenciaId: number,
    usuarioId: number,
    esAdmin: boolean = false
  ): Promise<RespuestaEliminarProcedencia> {
    // Validar ID
    const validacionId = ValidacionProcedencia.validarId(procedenciaId);
    if (!validacionId.valido) {
      throw {
        codigo: 'DATOS_INVALIDOS',
        status: 422,
        mensaje: validacionId.error,
      };
    }

    try {
      const resultado = await this.repository.eliminarProcedencia(
        procedenciaId,
        usuarioId
      );

      return {
        ok: true,
        data: resultado,
      };
    } catch (error: any) {
      // Manejo de errores específicos
      if (error.message === 'NO_ENCONTRADO') {
        throw {
          codigo: 'NO_ENCONTRADO',
          status: 404,
          mensaje: 'Procedencia no encontrada',
        };
      }
      if (error.message === 'PERMISO_DENEGADO') {
        throw {
          codigo: 'PERMISO_DENEGADO',
          status: 403,
          mensaje: 'No se pueden eliminar procedencias predeterminadas',
        };
      }
      throw error;
    }
  }
}