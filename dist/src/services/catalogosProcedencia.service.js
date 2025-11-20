"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogosProcedenciaService = void 0;
const catalogosProcedencia_repository_1 = require("../repositories/catalogosProcedencia.repository");
const errors_1 = require("../utils/errors");
class CatalogosProcedenciaService {
    constructor(repository = catalogosProcedencia_repository_1.catalogosProcedenciaRepository) {
        this.repository = repository;
    }
    async listarProcedencias(usuarioId, buscar, pagina = 1, tamanoPagina = 20, orden = "nombre:asc") {
        try {
            if (pagina < 1) {
                throw new errors_1.ValidationError("La página debe ser mayor a 0");
            }
            if (tamanoPagina < 1 || tamanoPagina > 100) {
                throw new errors_1.ValidationError("El tamaño de página debe estar entre 1 y 100");
            }
            const buscarNormalizado = buscar?.trim() || null;
            const { procedencias, total } = await this.repository.listarProcedencias(usuarioId, buscarNormalizado, pagina, tamanoPagina, orden);
            return {
                ok: true,
                data: procedencias,
                meta: {
                    paginacion: { pagina, tamanoPagina, total },
                },
            };
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError) {
                throw error;
            }
            console.error("[CatalogosProcedenciaService] Error en listarProcedencias:", error);
            throw new errors_1.InternalServerError("Error al listar procedencias");
        }
    }
    async crearProcedencia(usuarioId, nombre) {
        try {
            const nombreNormalizado = nombre.trim();
            if (nombreNormalizado.length < 3 || nombreNormalizado.length > 100) {
                throw new errors_1.ValidationError("El nombre debe tener entre 3 y 100 caracteres");
            }
            const resultado = await this.repository.crearProcedencia(usuarioId, nombreNormalizado);
            return {
                ok: true,
                data: resultado,
            };
        }
        catch (error) {
            if (error.message === "DUPLICADO") {
                throw new errors_1.ConflictError("Ya existe una procedencia con ese nombre");
            }
            if (error instanceof errors_1.ValidationError) {
                throw error;
            }
            console.error("[CatalogosProcedenciaService] Error en crearProcedencia:", error);
            throw new errors_1.InternalServerError("Error al crear procedencia");
        }
    }
    async actualizarProcedencia(procedenciaId, usuarioId, nombre, esAdmin = false) {
        try {
            if (!Number.isInteger(procedenciaId) || procedenciaId <= 0) {
                throw new errors_1.ValidationError("ID de procedencia inválido");
            }
            const nombreNormalizado = nombre.trim();
            if (nombreNormalizado.length < 3 || nombreNormalizado.length > 100) {
                throw new errors_1.ValidationError("El nombre debe tener entre 3 y 100 caracteres");
            }
            const resultado = await this.repository.actualizarProcedencia(procedenciaId, usuarioId, nombreNormalizado, esAdmin);
            return { ok: true, data: resultado };
        }
        catch (error) {
            if (error.message === "NO_ENCONTRADO") {
                throw new errors_1.NotFoundError("Procedencia", procedenciaId.toString());
            }
            if (error.message === "DUPLICADO") {
                throw new errors_1.ConflictError("Ya existe una procedencia con ese nombre");
            }
            if (error.message === "PERMISO_DENEGADO") {
                throw new errors_1.ForbiddenError("No se pueden editar procedencias predeterminadas sin permisos de administrador");
            }
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ConflictError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            console.error("[CatalogosProcedenciaService] Error en actualizarProcedencia:", error);
            throw new errors_1.InternalServerError("Error al actualizar procedencia");
        }
    }
    async eliminarProcedencia(procedenciaId, usuarioId, esAdmin = false) {
        try {
            if (!Number.isInteger(procedenciaId) || procedenciaId <= 0) {
                throw new errors_1.ValidationError("ID de procedencia inválido");
            }
            const resultado = await this.repository.eliminarProcedencia(procedenciaId, usuarioId, esAdmin);
            return { ok: true, data: resultado };
        }
        catch (error) {
            if (error.message === "NO_ENCONTRADO") {
                throw new errors_1.NotFoundError("Procedencia", procedenciaId.toString());
            }
            if (error.message === "PERMISO_DENEGADO") {
                throw new errors_1.ForbiddenError("No se pueden eliminar procedencias por defecto");
            }
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            console.error("[CatalogosProcedenciaService] Error en eliminarProcedencia:", error);
            throw new errors_1.InternalServerError("Error al eliminar procedencia");
        }
    }
}
exports.CatalogosProcedenciaService = CatalogosProcedenciaService;
