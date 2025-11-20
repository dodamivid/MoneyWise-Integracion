"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposEgresoService = void 0;
const tiposEgreso_repository_1 = require("../repositories/tiposEgreso.repository");
const errors_1 = require("../utils/errors");
/**
 * @fileoverview Service para lógica de negocio de Tipos de Egreso
 * Issue #21 - Maneja validaciones y transformaciones de datos
 */
class TiposEgresoService {
    constructor(repository = tiposEgreso_repository_1.tiposEgresoRepository) {
        this.repository = repository;
    }
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
    async listarTiposEgreso(usuarioId, buscar, pagina = 1, tamanoPagina = 20, orden = "nombre:asc") {
        try {
            // Validaciones adicionales
            if (pagina < 1) {
                throw new errors_1.ValidationError("La página debe ser mayor a 0");
            }
            if (tamanoPagina < 1 || tamanoPagina > 100) {
                throw new errors_1.ValidationError("El tamaño de página debe estar entre 1 y 100");
            }
            const buscarNormalizado = buscar?.trim() || null;
            const { datos, total } = await this.repository.listarTiposEgreso(usuarioId, buscarNormalizado, pagina, tamanoPagina, orden);
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
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ConflictError ||
                error instanceof errors_1.ResourceInUseError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            console.error("[TiposEgresoService] Error en listarTiposEgreso:", error);
            throw new errors_1.InternalServerError("Error al listar tipos de egreso");
        }
    }
    /**
     * Crear nuevo tipo de egreso
     *
     * @param usuarioId - ID del usuario autenticado
     * @param nombre - Nombre del tipo de egreso
     * @returns Tipo de egreso creado
     */
    async crearTipoEgreso(usuarioId, nombre) {
        try {
            const nombreNormalizado = nombre.trim();
            // Validaciones de negocio
            if (nombreNormalizado.length < 3 || nombreNormalizado.length > 60) {
                throw new errors_1.ValidationError("El nombre debe tener entre 3 y 60 caracteres");
            }
            const resultado = await this.repository.crearTipoEgreso(usuarioId, nombreNormalizado);
            return {
                ok: true,
                data: resultado,
            };
        }
        catch (error) {
            // Mapear errores del SP a clases de error apropiadas
            if (error.message?.includes("Ya existe un tipo de egreso")) {
                throw new errors_1.ConflictError("Ya existe un tipo de egreso con este nombre");
            }
            if (error.message?.includes("entre 3 y 60 caracteres")) {
                throw new errors_1.ValidationError(error.message);
            }
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.ConflictError) {
                throw error;
            }
            console.error("[TiposEgresoService] Error en crearTipoEgreso:", error);
            throw new errors_1.InternalServerError("Error al crear tipo de egreso");
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
    async actualizarTipoEgreso(tipoEgresoId, usuarioId, nombre) {
        try {
            const nombreNormalizado = nombre.trim();
            // Validaciones
            if (nombreNormalizado.length < 3 || nombreNormalizado.length > 60) {
                throw new errors_1.ValidationError("El nombre debe tener entre 3 y 60 caracteres");
            }
            const actualizado = await this.repository.actualizarTipoEgreso(tipoEgresoId, usuarioId, nombreNormalizado);
            if (!actualizado) {
                throw new errors_1.NotFoundError("Tipo de egreso", tipoEgresoId.toString());
            }
            return {
                ok: true,
                data: { actualizado: true },
            };
        }
        catch (error) {
            // Mapear errores del SP
            if (error.message?.includes("no encontrado")) {
                throw new errors_1.NotFoundError("Tipo de egreso", tipoEgresoId.toString());
            }
            if (error.message?.includes("Ya existe un tipo de egreso")) {
                throw new errors_1.ConflictError("Ya existe un tipo de egreso con este nombre");
            }
            if (error.message?.includes("permiso")) {
                throw new errors_1.ForbiddenError("No tienes permiso para modificar este tipo de egreso");
            }
            if (error instanceof errors_1.ValidationError ||
                error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ConflictError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            console.error("[TiposEgresoService] Error en actualizarTipoEgreso:", error);
            throw new errors_1.InternalServerError("Error al actualizar tipo de egreso");
        }
    }
    /**
     * Eliminar tipo de egreso (soft delete)
     *
     * @param tipoEgresoId - ID del tipo de egreso a eliminar
     * @param usuarioId - ID del usuario autenticado
     * @returns Confirmación de eliminación
     */
    async eliminarTipoEgreso(tipoEgresoId, usuarioId) {
        try {
            const eliminado = await this.repository.eliminarTipoEgreso(tipoEgresoId, usuarioId);
            if (!eliminado) {
                throw new errors_1.NotFoundError("Tipo de egreso", tipoEgresoId.toString());
            }
            return {
                ok: true,
                data: { eliminado: true },
            };
        }
        catch (error) {
            // Mapear errores del SP
            if (error.message?.includes("no encontrado")) {
                throw new errors_1.NotFoundError("Tipo de egreso", tipoEgresoId.toString());
            }
            if (error.message?.includes("en uso")) {
                throw new errors_1.ResourceInUseError("No se puede eliminar: el tipo de egreso está en uso");
            }
            if (error.message?.includes("por defecto")) {
                throw new errors_1.ForbiddenError("No se pueden eliminar tipos por defecto");
            }
            if (error.message?.includes("permiso")) {
                throw new errors_1.ForbiddenError("No tienes permiso para eliminar este tipo de egreso");
            }
            if (error instanceof errors_1.NotFoundError ||
                error instanceof errors_1.ResourceInUseError ||
                error instanceof errors_1.ForbiddenError) {
                throw error;
            }
            console.error("[TiposEgresoService] Error en eliminarTipoEgreso:", error);
            throw new errors_1.InternalServerError("Error al eliminar tipo de egreso");
        }
    }
}
exports.TiposEgresoService = TiposEgresoService;
