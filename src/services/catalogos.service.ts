import { catalogosRepository } from "../repositories/catalogos.repository";
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
} from "../utils/errors";
import { DestinoDTO } from "../dtos/catalogos.dto";

/**
 * @fileoverview Service para la lógica de negocio de catálogos
 * Valida reglas de negocio antes de delegar al repository
 */

export class CatalogosService {
  /**
   * Lista destinos con paginación y filtros
   */
  async listarDestinos(
    usuarioId: string,
    buscar: string | undefined,
    pagina: number,
    tamanoPagina: number,
    orden: string,
    scopes: string[]
  ): Promise<{ destinos: DestinoDTO[]; total: number }> {
    // Si se solicita ver destinos de otro usuario, validar scope admin
    // (Por ahora solo vemos los del usuario actual + globales)

    const { destinos, total } = await catalogosRepository.listarDestinos(
      usuarioId,
      buscar || null,
      pagina,
      tamanoPagina,
      orden
    );

    return { destinos, total };
  }

  /**
   * Crea un nuevo destino
   * Valida que no exista duplicado
   */
  async crearDestino(
    usuarioId: string,
    nombre: string
  ): Promise<{ destinoId: number; nombre: string }> {
    // Validar duplicado: buscar si ya existe con ese nombre
    const { destinos } = await catalogosRepository.listarDestinos(
      usuarioId,
      nombre,
      1,
      10,
      "nombre:asc"
    );

    const duplicado = destinos.find(
      (d) => d.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (duplicado) {
      throw new BadRequestError(
        `Ya existe un destino con el nombre "${nombre}"`
      );
    }

    // Crear el destino
    try {
      const resultado = await catalogosRepository.crearDestino(
        usuarioId,
        nombre
      );
      return resultado;
    } catch (error: any) {
      // Si el SP lanza error de duplicado (por race condition)
      if (error.message?.includes("Duplicate") || error.code === "ER_DUP_ENTRY") {
        throw new BadRequestError(
          `Ya existe un destino con el nombre "${nombre}"`
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza un destino existente
   * Valida permisos y unicidad
   */
  async actualizarDestino(
    destinoId: number,
    usuarioId: string,
    nombre: string,
    scopes: string[]
  ): Promise<boolean> {
    // Verificar que el destino existe y pertenece al usuario
    const { destinos } = await catalogosRepository.listarDestinos(
      usuarioId,
      null,
      1,
      1000,
      "nombre:asc"
    );

    const destinoExistente = destinos.find((d) => d.destinoId === destinoId);

    if (!destinoExistente) {
      throw new NotFoundError("Destino", destinoId.toString());
    }

    // Validar que no sea un destino por defecto (a menos que tenga scope admin)
    if (destinoExistente.esPorDefecto && !scopes.includes("admin:catalogos")) {
      throw new BadRequestError(
        "No puedes editar destinos por defecto sin permisos de administrador"
      );
    }

    // Validar que el destino pertenezca al usuario (o sea global con permisos admin)
    if (
      destinoExistente.usuarioId !== null &&
      destinoExistente.usuarioId !== usuarioId
    ) {
      throw new BadRequestError("No tienes permiso para editar este destino");
    }

    // Validar duplicado con el nuevo nombre
    const duplicado = destinos.find(
      (d) =>
        d.nombre.toLowerCase() === nombre.toLowerCase() &&
        d.destinoId !== destinoId
    );

    if (duplicado) {
      throw new BadRequestError(
        `Ya existe otro destino con el nombre "${nombre}"`
      );
    }

    // Actualizar
    const actualizado = await catalogosRepository.actualizarDestino(
      destinoId,
      usuarioId,
      nombre
    );

    if (!actualizado) {
      throw new NotFoundError("Destino", destinoId.toString());
    }

    return true;
  }

  /**
   * Elimina un destino (soft delete)
   * Valida que no sea destino por defecto
   */
  async eliminarDestino(
    destinoId: number,
    usuarioId: string,
    scopes: string[]
  ): Promise<boolean> {
    // Verificar que el destino existe
    const { destinos } = await catalogosRepository.listarDestinos(
      usuarioId,
      null,
      1,
      1000,
      "nombre:asc"
    );

    const destinoExistente = destinos.find((d) => d.destinoId === destinoId);

    if (!destinoExistente) {
      throw new NotFoundError("Destino", destinoId.toString());
    }

    // No permitir eliminar destinos por defecto
    if (destinoExistente.esPorDefecto) {
      throw new BadRequestError("No puedes eliminar destinos por defecto");
    }

    // Validar permisos de usuario
    if (
      destinoExistente.usuarioId !== null &&
      destinoExistente.usuarioId !== usuarioId
    ) {
      throw new BadRequestError("No tienes permiso para eliminar este destino");
    }

    // Eliminar
    const eliminado = await catalogosRepository.eliminarDestino(
      destinoId,
      usuarioId
    );

    if (!eliminado) {
      throw new NotFoundError("Destino", destinoId.toString());
    }

    return true;
  }
}

// Exportar instancia singleton
export const catalogosService = new CatalogosService();