import { TiposEgresoRepository } from "../repositories/tiposEgreso.repository";
import {
  ListarTiposEgresoResponse,
  CrearTipoEgresoResponse,
  ActualizarTipoEgresoResponse,
  EliminarTipoEgresoResponse,
} from "../dtos/tiposEgreso.dto";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ResourceInUseError,
  ForbiddenError,
  InternalServerError,
} from "../utils/errors";

/**
 * @fileoverview Service para lógica de negocio de Tipos de Egreso
 * Issue #21 - Maneja validaciones y transformaciones de datos
 */

export class TiposEgresoService {
  constructor(private readonly repository: TiposEgresoRepository) {}

  /**
   * Listar tipos de egreso con paginación
   *
   * @param usuarioId - ID del usuario autenticado
   * @param buscar - Término de búsqueda (opcional)
   * @param pagina - Número de página (default: 1)
   * @param tamanoPagina - Registros por página (default: 20)
   * @param orden - Campo de orden (default: "nombre:asc")
   * @returns Lista paginada de tipos de egreso
   */
  async listarTiposEgreso(
    usuarioId: string,
    buscar?: string,
    pagina: number = 1,
    tamanoPagina: number = 20,
    orden: string = "nombre:asc"
  ): Promise<ListarTiposEgresoResponse> {
    try {
      // Validaciones adicionales
      if (pagina < 1) {
        throw new ValidationError("La página debe ser mayor a 0");
      }

      if (tamanoPagina < 1 || tamanoPagina > 100) {
        throw new ValidationError(
          "El tamaño de página debe estar entre 1 y 100"
        );
      }

      const buscarNormalizado = buscar?.trim() || null;

      const { datos, total } = await this.repository.listarTiposEgreso(
        usuarioId,
        buscarNormalizado,
        pagina,
        tamanoPagina,
        orden
      );

      return {
        ok: true,
        data: datos,
        meta: {
          paginacion: {
            pagina,
            tamanoPagina,
            total,
          },
        },
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof ResourceInUseError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }
      console.error("[TiposEgresoService] Error en listarTiposEgreso:", error);
      throw new InternalServerError("Error al listar tipos de egreso");
    }
  }

  /**
   * Crear nuevo tipo de egreso
   *
   * @param usuarioId - ID del usuario autenticado
   * @param nombre - Nombre del tipo de egreso
   * @returns Tipo de egreso creado
   */
  async crearTipoEgreso(
    usuarioId: string,
    nombre: string
  ): Promise<CrearTipoEgresoResponse> {
    try {
      const nombreNormalizado = nombre.trim();

      // Validaciones de negocio
      if (nombreNormalizado.length < 3 || nombreNormalizado.length > 60) {
        throw new ValidationError(
          "El nombre debe tener entre 3 y 60 caracteres"
        );
      }

      const resultado = await this.repository.crearTipoEgreso(
        usuarioId,
        nombreNormalizado
      );

      return {
        ok: true,
        data: resultado,
      };
    } catch (error: any) {
      // Mapear errores del SP a clases de error apropiadas
      if (error.message?.includes("Ya existe un tipo de egreso")) {
        throw new ConflictError("Ya existe un tipo de egreso con este nombre");
      }

      if (error.message?.includes("entre 3 y 60 caracteres")) {
        throw new ValidationError(error.message);
      }

      if (
        error instanceof ValidationError ||
        error instanceof ConflictError
      ) {
        throw error;
      }

      console.error("[TiposEgresoService] Error en crearTipoEgreso:", error);
      throw new InternalServerError("Error al crear tipo de egreso");
    }
  }

  /**
   * Actualizar tipo de egreso existente
   *
   * @param tipoEgresoId - ID del tipo de egreso a actualizar
   * @param usuarioId - ID del usuario autenticado
   * @param nombre - Nuevo nombre del tipo de egreso
   * @returns Confirmación de actualización
   */
  async actualizarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<ActualizarTipoEgresoResponse> {
    try {
      const nombreNormalizado = nombre.trim();

      // Validaciones
      if (nombreNormalizado.length < 3 || nombreNormalizado.length > 60) {
        throw new ValidationError(
          "El nombre debe tener entre 3 y 60 caracteres"
        );
      }

      const actualizado = await this.repository.actualizarTipoEgreso(
        tipoEgresoId,
        usuarioId,
        nombreNormalizado
      );

      if (!actualizado) {
        throw new NotFoundError("Tipo de egreso", tipoEgresoId.toString());
      }

      return {
        ok: true,
        data: { actualizado: true },
      };
    } catch (error: any) {
      // Mapear errores del SP
      if (error.message?.includes("no encontrado")) {
        throw new NotFoundError("Tipo de egreso", tipoEgresoId.toString());
      }

      if (error.message?.includes("Ya existe un tipo de egreso")) {
        throw new ConflictError("Ya existe un tipo de egreso con este nombre");
      }

      if (error.message?.includes("permiso")) {
        throw new ForbiddenError(
          "No tienes permiso para modificar este tipo de egreso"
        );
      }

      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      console.error("[TiposEgresoService] Error en actualizarTipoEgreso:", error);
      throw new InternalServerError("Error al actualizar tipo de egreso");
    }
  }

  /**
   * Eliminar tipo de egreso (soft delete)
   *
   * @param tipoEgresoId - ID del tipo de egreso a eliminar
   * @param usuarioId - ID del usuario autenticado
   * @returns Confirmación de eliminación
   */
  async eliminarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string
  ): Promise<EliminarTipoEgresoResponse> {
    try {
      const eliminado = await this.repository.eliminarTipoEgreso(
        tipoEgresoId,
        usuarioId
      );

      if (!eliminado) {
        throw new NotFoundError("Tipo de egreso", tipoEgresoId.toString());
      }

      return {
        ok: true,
        data: { eliminado: true },
      };
    } catch (error: any) {
      // Mapear errores del SP
      if (error.message?.includes("no encontrado")) {
        throw new NotFoundError("Tipo de egreso", tipoEgresoId.toString());
      }

      if (error.message?.includes("en uso")) {
        throw new ResourceInUseError(
          "No se puede eliminar: el tipo de egreso está en uso"
        );
      }

      if (error.message?.includes("por defecto")) {
        throw new ForbiddenError("No se pueden eliminar tipos por defecto");
      }

      if (error.message?.includes("permiso")) {
        throw new ForbiddenError(
          "No tienes permiso para eliminar este tipo de egreso"
        );
      }

      if (
        error instanceof NotFoundError ||
        error instanceof ResourceInUseError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      console.error("[TiposEgresoService] Error en eliminarTipoEgreso:", error);
      throw new InternalServerError("Error al eliminar tipo de egreso");
    }
  }
}