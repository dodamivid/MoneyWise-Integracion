"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogosService = exports.CatalogosService = void 0;
const catalogos_repository_1 = require("../repositories/catalogos.repository");
const errors_1 = require("../utils/errors");
/**
 * @fileoverview Service para catálogos (Destinos y Frecuencias)
 */
class CatalogosService {
    // ============================================
    // DESTINOS
    // ============================================
    async listarDestinos(usuarioId, buscar, pagina, tamanoPagina, orden, scopes) {
        const { destinos, total } = await catalogos_repository_1.catalogosRepository.listarDestinos(usuarioId, buscar || null, pagina, tamanoPagina, orden);
        return { destinos, total };
    }
    async crearDestino(usuarioId, nombre) {
        const { destinos } = await catalogos_repository_1.catalogosRepository.listarDestinos(usuarioId, nombre, 1, 10, "nombre:asc");
        const duplicado = destinos.find((d) => d.nombre.toLowerCase() === nombre.toLowerCase());
        if (duplicado) {
            throw new errors_1.BadRequestError(`Ya existe un destino con el nombre "${nombre}"`);
        }
        try {
            const resultado = await catalogos_repository_1.catalogosRepository.crearDestino(usuarioId, nombre);
            return resultado;
        }
        catch (error) {
            if (error.message?.includes("Duplicate") || error.code === "ER_DUP_ENTRY") {
                throw new errors_1.BadRequestError(`Ya existe un destino con el nombre "${nombre}"`);
            }
            throw error;
        }
    }
    async actualizarDestino(destinoId, usuarioId, nombre, scopes) {
        const { destinos } = await catalogos_repository_1.catalogosRepository.listarDestinos(usuarioId, null, 1, 1000, "nombre:asc");
        const destinoExistente = destinos.find((d) => d.destinoId === destinoId);
        if (!destinoExistente) {
            throw new errors_1.NotFoundError("Destino", destinoId.toString());
        }
        if (destinoExistente.esPorDefecto && !scopes.includes("admin:catalogos")) {
            throw new errors_1.BadRequestError("No puedes editar destinos por defecto sin permisos de administrador");
        }
        if (destinoExistente.usuarioId !== null &&
            destinoExistente.usuarioId !== usuarioId) {
            throw new errors_1.BadRequestError("No tienes permiso para editar este destino");
        }
        const duplicado = destinos.find((d) => d.nombre.toLowerCase() === nombre.toLowerCase() &&
            d.destinoId !== destinoId);
        if (duplicado) {
            throw new errors_1.BadRequestError(`Ya existe otro destino con el nombre "${nombre}"`);
        }
        const actualizado = await catalogos_repository_1.catalogosRepository.actualizarDestino(destinoId, usuarioId, nombre);
        if (!actualizado) {
            throw new errors_1.NotFoundError("Destino", destinoId.toString());
        }
        return true;
    }
    async eliminarDestino(destinoId, usuarioId, scopes) {
        const { destinos } = await catalogos_repository_1.catalogosRepository.listarDestinos(usuarioId, null, 1, 1000, "nombre:asc");
        const destinoExistente = destinos.find((d) => d.destinoId === destinoId);
        if (!destinoExistente) {
            throw new errors_1.NotFoundError("Destino", destinoId.toString());
        }
        if (destinoExistente.esPorDefecto) {
            throw new errors_1.BadRequestError("No puedes eliminar destinos por defecto");
        }
        if (destinoExistente.usuarioId !== null &&
            destinoExistente.usuarioId !== usuarioId) {
            throw new errors_1.BadRequestError("No tienes permiso para eliminar este destino");
        }
        const eliminado = await catalogos_repository_1.catalogosRepository.eliminarDestino(destinoId, usuarioId);
        if (!eliminado) {
            throw new errors_1.NotFoundError("Destino", destinoId.toString());
        }
        return true;
    }
    // ============================================
    // FRECUENCIAS
    // ============================================
    async listarFrecuencias(buscar, pagina, tamanoPagina, orden) {
        const { frecuencias, total } = await catalogos_repository_1.catalogosRepository.listarFrecuencias(buscar || null, pagina, tamanoPagina, orden);
        return { frecuencias, total };
    }
    async crearFrecuencia(nombre) {
        const { frecuencias } = await catalogos_repository_1.catalogosRepository.listarFrecuencias(nombre, 1, 10, "nombre:asc");
        const duplicado = frecuencias.find((f) => f.nombre.toLowerCase() === nombre.toLowerCase());
        if (duplicado) {
            throw new errors_1.BadRequestError(`Ya existe una frecuencia con el nombre "${nombre}"`);
        }
        try {
            const resultado = await catalogos_repository_1.catalogosRepository.crearFrecuencia(nombre);
            return resultado;
        }
        catch (error) {
            if (error.message?.includes("Duplicate") || error.code === "ER_DUP_ENTRY") {
                throw new errors_1.BadRequestError(`Ya existe una frecuencia con el nombre "${nombre}"`);
            }
            throw error;
        }
    }
    async actualizarFrecuencia(frecuenciaId, nombre) {
        const { frecuencias } = await catalogos_repository_1.catalogosRepository.listarFrecuencias(null, 1, 1000, "nombre:asc");
        const frecuenciaExistente = frecuencias.find((f) => f.frecuenciaId === frecuenciaId);
        if (!frecuenciaExistente) {
            throw new errors_1.NotFoundError("Frecuencia", frecuenciaId.toString());
        }
        const duplicado = frecuencias.find((f) => f.nombre.toLowerCase() === nombre.toLowerCase() &&
            f.frecuenciaId !== frecuenciaId);
        if (duplicado) {
            throw new errors_1.BadRequestError(`Ya existe otra frecuencia con el nombre "${nombre}"`);
        }
        const actualizado = await catalogos_repository_1.catalogosRepository.actualizarFrecuencia(frecuenciaId, nombre);
        if (!actualizado) {
            throw new errors_1.NotFoundError("Frecuencia", frecuenciaId.toString());
        }
        return true;
    }
    async eliminarFrecuencia(frecuenciaId) {
        const { frecuencias } = await catalogos_repository_1.catalogosRepository.listarFrecuencias(null, 1, 1000, "nombre:asc");
        const frecuenciaExistente = frecuencias.find((f) => f.frecuenciaId === frecuenciaId);
        if (!frecuenciaExistente) {
            throw new errors_1.NotFoundError("Frecuencia", frecuenciaId.toString());
        }
        const eliminado = await catalogos_repository_1.catalogosRepository.eliminarFrecuencia(frecuenciaId);
        if (!eliminado) {
            throw new errors_1.NotFoundError("Frecuencia", frecuenciaId.toString());
        }
        return true;
    }
}
exports.CatalogosService = CatalogosService;
exports.catalogosService = new CatalogosService();
