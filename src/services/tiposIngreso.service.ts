import { tiposIngresoRepository } from "../repositories/tiposIngreso.repository";
import {
  ListarTiposIngresoResponse,
  CrearTipoIngresoResponse,
  ActualizarTipoIngresoResponse,
  EliminarTipoIngresoResponse,
} from "../dtos/tiposIngreso.dto";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ResourceInUseError,
  ForbiddenError,
  InternalServerError,
} from "../utils/errors";

/**
 * @fileoverview Service para lógica de negocio de Tipos de Ingreso
 * Issue #77: rediseñado siguiendo el patrón de tiposEgreso.service.ts
 */
export class TiposIngresoService {
  constructor(private readonly repository = tiposIngresoRepository) {}

  async listarTiposIngreso(
    usuarioId: string,
    buscar?: string,
    pagina: number = 1,
    tamanoPagina: number = 20,
    orden: string = "nombre:asc"
  ): Promise<ListarTiposIngresoResponse> {
    try {
      if (pagina < 1) {
        throw new ValidationError("La página debe ser mayor a 0");
      }

      if (tamanoPagina < 1 || tamanoPagina > 100) {
        throw new ValidationError(
          "El tamaño de página debe estar entre 1 y 100"
        );
      }

      const buscarNormalizado = buscar?.trim() || null;

      const { datos, total } = await this.repository.listarTiposIngreso(
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
          paginacion: { pagina, tamanoPagina, total },
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error("[TiposIngresoService] Error en listarTiposIngreso:", error);
      throw new InternalServerError("Error al listar tipos de ingreso");
    }
  }

  async crearTipoIngreso(
    usuarioId: string,
    nombre: string
  ): Promise<CrearTipoIngresoResponse> {
    try {
      const nombreNormalizado = nombre.trim();

      if (nombreNormalizado.length < 3 || nombreNormalizado.length > 60) {
        throw new ValidationError(
          "El nombre debe tener entre 3 y 60 caracteres"
        );
      }

      const resultado = await this.repository.crearTipoIngreso(
        usuarioId,
        nombreNormalizado
      );

      return { ok: true, data: resultado };
    } catch (error: any) {
      if (error.message?.includes("DUPLICADO")) {
        throw new ConflictError("Ya existe un tipo de ingreso con este nombre");
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      console.error("[TiposIngresoService] Error en crearTipoIngreso:", error);
      throw new InternalServerError("Error al crear tipo de ingreso");
    }
  }

  async actualizarTipoIngreso(
    tipoIngresoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<ActualizarTipoIngresoResponse> {
    try {
      if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
        throw new ValidationError("ID de tipo de ingreso inválido");
      }

      const nombreNormalizado = nombre.trim();
      if (nombreNormalizado.length < 3 || nombreNormalizado.length > 60) {
        throw new ValidationError(
          "El nombre debe tener entre 3 y 60 caracteres"
        );
      }

      const actualizado = await this.repository.actualizarTipoIngreso(
        tipoIngresoId,
        usuarioId,
        nombreNormalizado
      );

      if (!actualizado) {
        throw new NotFoundError("Tipo de ingreso", tipoIngresoId.toString());
      }

      return { ok: true, data: { actualizado: true } };
    } catch (error: any) {
      if (error.message?.includes("NO_ENCONTRADO")) {
        throw new NotFoundError("Tipo de ingreso", tipoIngresoId.toString());
      }

      if (error.message?.includes("DUPLICADO")) {
        throw new ConflictError("Ya existe un tipo de ingreso con este nombre");
      }

      if (error.message?.includes("PERMISO_DENEGADO")) {
        throw new ForbiddenError(
          "No tienes permiso para modificar este tipo de ingreso"
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

      console.error(
        "[TiposIngresoService] Error en actualizarTipoIngreso:",
        error
      );
      throw new InternalServerError("Error al actualizar tipo de ingreso");
    }
  }

  async eliminarTipoIngreso(
    tipoIngresoId: number,
    usuarioId: string
  ): Promise<EliminarTipoIngresoResponse> {
    try {
      if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
        throw new ValidationError("ID de tipo de ingreso inválido");
      }

      const eliminado = await this.repository.eliminarTipoIngreso(
        tipoIngresoId,
        usuarioId
      );

      if (!eliminado) {
        throw new NotFoundError("Tipo de ingreso", tipoIngresoId.toString());
      }

      return { ok: true, data: { eliminado: true } };
    } catch (error: any) {
      if (error.message?.includes("NO_ENCONTRADO")) {
        throw new NotFoundError("Tipo de ingreso", tipoIngresoId.toString());
      }

      if (error.message?.includes("EN_USO")) {
        throw new ResourceInUseError(
          "No se puede eliminar: el tipo de ingreso está en uso"
        );
      }

      if (error.message?.includes("PERMISO_DENEGADO")) {
        throw new ForbiddenError(
          "No tienes permiso para eliminar este tipo de ingreso"
        );
      }

      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      console.error(
        "[TiposIngresoService] Error en eliminarTipoIngreso:",
        error
      );
      throw new InternalServerError("Error al eliminar tipo de ingreso");
    }
  }
}

export const tiposIngresoService = new TiposIngresoService();
