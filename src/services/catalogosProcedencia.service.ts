import { catalogosProcedenciaRepository } from "../repositories/catalogosProcedencia.repository";
import {
  ActualizarProcedenciaResponse,
  CrearProcedenciaResponse,
  EliminarProcedenciaResponse,
  ListarProcedenciasResponse,
} from "../dtos/catalogosProcedencia.dto";
import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

export class CatalogosProcedenciaService {
  constructor(
    private readonly repository = catalogosProcedenciaRepository
  ) {}

  async listarProcedencias(
    usuarioId: string,
    buscar?: string,
    pagina: number = 1,
    tamanoPagina: number = 20,
    orden: string = "nombre:asc"
  ): Promise<ListarProcedenciasResponse> {
    try {
      if (pagina < 1) {
        throw new ValidationError("La página debe ser mayor a 0");
      }

      if (tamanoPagina < 1 || tamanoPagina > 100) {
        throw new ValidationError("El tamaño de página debe estar entre 1 y 100");
      }

      const buscarNormalizado = buscar?.trim() || null;

      const { procedencias, total } =
        await this.repository.listarProcedencias(
          usuarioId,
          buscarNormalizado,
          pagina,
          tamanoPagina,
          orden
        );

      return {
        ok: true,
        data: procedencias,
        meta: {
          paginacion: { pagina, tamanoPagina, total },
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error(
        "[CatalogosProcedenciaService] Error en listarProcedencias:",
        error
      );
      throw new InternalServerError("Error al listar procedencias");
    }
  }

  async crearProcedencia(
    usuarioId: string,
    nombre: string
  ): Promise<CrearProcedenciaResponse> {
    try {
      const nombreNormalizado = nombre.trim();

      if (nombreNormalizado.length < 3 || nombreNormalizado.length > 100) {
        throw new ValidationError(
          "El nombre debe tener entre 3 y 100 caracteres"
        );
      }

      const resultado = await this.repository.crearProcedencia(
        usuarioId,
        nombreNormalizado
      );

      return {
        ok: true,
        data: resultado,
      };
    } catch (error: any) {
      if (error.message === "DUPLICADO") {
        throw new ConflictError("Ya existe una procedencia con ese nombre");
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      console.error(
        "[CatalogosProcedenciaService] Error en crearProcedencia:",
        error
      );
      throw new InternalServerError("Error al crear procedencia");
    }
  }

  async actualizarProcedencia(
    procedenciaId: number,
    usuarioId: string,
    nombre: string,
    esAdmin: boolean = false
  ): Promise<ActualizarProcedenciaResponse> {
    try {
      if (!Number.isInteger(procedenciaId) || procedenciaId <= 0) {
        throw new ValidationError("ID de procedencia inválido");
      }

      const nombreNormalizado = nombre.trim();
      if (nombreNormalizado.length < 3 || nombreNormalizado.length > 100) {
        throw new ValidationError(
          "El nombre debe tener entre 3 y 100 caracteres"
        );
      }

      const resultado = await this.repository.actualizarProcedencia(
        procedenciaId,
        usuarioId,
        nombreNormalizado,
        esAdmin
      );

      return { ok: true, data: resultado };
    } catch (error: any) {
      if (error.message === "NO_ENCONTRADO") {
        throw new NotFoundError("Procedencia", procedenciaId.toString());
      }

      if (error.message === "DUPLICADO") {
        throw new ConflictError("Ya existe una procedencia con ese nombre");
      }

      if (error.message === "PERMISO_DENEGADO") {
        throw new ForbiddenError(
          "No se pueden editar procedencias predeterminadas sin permisos de administrador"
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
        "[CatalogosProcedenciaService] Error en actualizarProcedencia:",
        error
      );
      throw new InternalServerError("Error al actualizar procedencia");
    }
  }

  async eliminarProcedencia(
    procedenciaId: number,
    usuarioId: string,
    esAdmin: boolean = false
  ): Promise<EliminarProcedenciaResponse> {
    try {
      if (!Number.isInteger(procedenciaId) || procedenciaId <= 0) {
        throw new ValidationError("ID de procedencia inválido");
      }

      const resultado = await this.repository.eliminarProcedencia(
        procedenciaId,
        usuarioId,
        esAdmin
      );

      return { ok: true, data: resultado };
    } catch (error: any) {
      if (error.message === "NO_ENCONTRADO") {
        throw new NotFoundError("Procedencia", procedenciaId.toString());
      }

      if (error.message === "PERMISO_DENEGADO") {
        throw new ForbiddenError("No se pueden eliminar procedencias por defecto");
      }

      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      console.error(
        "[CatalogosProcedenciaService] Error en eliminarProcedencia:",
        error
      );
      throw new InternalServerError("Error al eliminar procedencia");
    }
  }
}
