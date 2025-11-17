import { catalogosRepository } from "../repositories/catalogos.repository";
import {
  NotFoundError,
  BadRequestError,
} from "../utils/errors";
import { DestinoDTO, FrecuenciaDTO } from "../dtos/catalogos.dto";

/**
 * @fileoverview Service para catálogos (Destinos y Frecuencias)
 */

export class CatalogosService {
  // ============================================
  // DESTINOS
  // ============================================

  async listarDestinos(
    usuarioId: string,
    buscar: string | undefined,
    pagina: number,
    tamanoPagina: number,
    orden: string,
    scopes: string[]
  ): Promise<{ destinos: DestinoDTO[]; total: number }> {
    const { destinos, total } = await catalogosRepository.listarDestinos(
      usuarioId,
      buscar || null,
      pagina,
      tamanoPagina,
      orden
    );

    return { destinos, total };
  }

  async crearDestino(
    usuarioId: string,
    nombre: string
  ): Promise<{ destinoId: number; nombre: string }> {
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

    try {
      const resultado = await catalogosRepository.crearDestino(usuarioId, nombre);
      return resultado;
    } catch (error: any) {
      if (error.message?.includes("Duplicate") || error.code === "ER_DUP_ENTRY") {
        throw new BadRequestError(
          `Ya existe un destino con el nombre "${nombre}"`
        );
      }
      throw error;
    }
  }

  async actualizarDestino(
    destinoId: number,
    usuarioId: string,
    nombre: string,
    scopes: string[]
  ): Promise<boolean> {
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

    if (destinoExistente.esPorDefecto && !scopes.includes("admin:catalogos")) {
      throw new BadRequestError(
        "No puedes editar destinos por defecto sin permisos de administrador"
      );
    }

    if (
      destinoExistente.usuarioId !== null &&
      destinoExistente.usuarioId !== usuarioId
    ) {
      throw new BadRequestError("No tienes permiso para editar este destino");
    }

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

  async eliminarDestino(
    destinoId: number,
    usuarioId: string,
    scopes: string[]
  ): Promise<boolean> {
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

    if (destinoExistente.esPorDefecto) {
      throw new BadRequestError("No puedes eliminar destinos por defecto");
    }

    if (
      destinoExistente.usuarioId !== null &&
      destinoExistente.usuarioId !== usuarioId
    ) {
      throw new BadRequestError("No tienes permiso para eliminar este destino");
    }

    const eliminado = await catalogosRepository.eliminarDestino(
      destinoId,
      usuarioId
    );

    if (!eliminado) {
      throw new NotFoundError("Destino", destinoId.toString());
    }

    return true;
  }

  // ============================================
  // FRECUENCIAS
  // ============================================

  async listarFrecuencias(
    buscar: string | undefined,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ frecuencias: FrecuenciaDTO[]; total: number }> {
    const { frecuencias, total } = await catalogosRepository.listarFrecuencias(
      buscar || null,
      pagina,
      tamanoPagina,
      orden
    );

    return { frecuencias, total };
  }

  async crearFrecuencia(
    nombre: string
  ): Promise<{ frecuenciaId: number; nombre: string }> {
    const { frecuencias } = await catalogosRepository.listarFrecuencias(
      nombre,
      1,
      10,
      "nombre:asc"
    );

    const duplicado = frecuencias.find(
      (f) => f.nombre.toLowerCase() === nombre.toLowerCase()
    );

    if (duplicado) {
      throw new BadRequestError(
        `Ya existe una frecuencia con el nombre "${nombre}"`
      );
    }

    try {
      const resultado = await catalogosRepository.crearFrecuencia(nombre);
      return resultado;
    } catch (error: any) {
      if (error.message?.includes("Duplicate") || error.code === "ER_DUP_ENTRY") {
        throw new BadRequestError(
          `Ya existe una frecuencia con el nombre "${nombre}"`
        );
      }
      throw error;
    }
  }

  async actualizarFrecuencia(
    frecuenciaId: number,
    nombre: string
  ): Promise<boolean> {
    const { frecuencias } = await catalogosRepository.listarFrecuencias(
      null,
      1,
      1000,
      "nombre:asc"
    );

    const frecuenciaExistente = frecuencias.find(
      (f) => f.frecuenciaId === frecuenciaId
    );

    if (!frecuenciaExistente) {
      throw new NotFoundError("Frecuencia", frecuenciaId.toString());
    }

    const duplicado = frecuencias.find(
      (f) =>
        f.nombre.toLowerCase() === nombre.toLowerCase() &&
        f.frecuenciaId !== frecuenciaId
    );

    if (duplicado) {
      throw new BadRequestError(
        `Ya existe otra frecuencia con el nombre "${nombre}"`
      );
    }

    const actualizado = await catalogosRepository.actualizarFrecuencia(
      frecuenciaId,
      nombre
    );

    if (!actualizado) {
      throw new NotFoundError("Frecuencia", frecuenciaId.toString());
    }

    return true;
  }

  async eliminarFrecuencia(frecuenciaId: number): Promise<boolean> {
    const { frecuencias } = await catalogosRepository.listarFrecuencias(
      null,
      1,
      1000,
      "nombre:asc"
    );

    const frecuenciaExistente = frecuencias.find(
      (f) => f.frecuenciaId === frecuenciaId
    );

    if (!frecuenciaExistente) {
      throw new NotFoundError("Frecuencia", frecuenciaId.toString());
    }

    const eliminado = await catalogosRepository.eliminarFrecuencia(frecuenciaId);

    if (!eliminado) {
      throw new NotFoundError("Frecuencia", frecuenciaId.toString());
    }

    return true;
  }
}

export const catalogosService = new CatalogosService();