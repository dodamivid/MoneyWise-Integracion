"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposIngresoService = void 0;
const tiposIngreso_repository_1 = require("../repositories/tiposIngreso.repository");
class TiposIngresoService {
    constructor() {
        this.repository = new tiposIngreso_repository_1.TiposIngresoRepository();
    }
    async listar(pagina = 1, tamanoPagina = 20, orden = 'nombre:asc', activo) {
        // Validar límite de paginación
        if (tamanoPagina > 100) {
            throw new Error('El tamaño de página no puede exceder 100');
        }
        // Validar orden
        const ordenesPermitidos = ['nombre:asc', 'nombre:desc', 'creadoEn:asc', 'creadoEn:desc'];
        if (!ordenesPermitidos.includes(orden)) {
            throw new Error('Orden no válido');
        }
        const { data, total } = await this.repository.listar(pagina, tamanoPagina, orden, activo);
        return {
            data,
            meta: {
                paginacion: {
                    pagina,
                    tamanoPagina,
                    total
                }
            }
        };
    }
    async obtenerPorId(tipoIngresoId) {
        const tipoIngreso = await this.repository.obtenerPorId(tipoIngresoId);
        if (!tipoIngreso) {
            throw new Error('NO_ENCONTRADO');
        }
        return tipoIngreso;
    }
    async crear(nombre, descripcion, activo) {
        // Validaciones adicionales si es necesario
        if (!nombre || nombre.trim().length === 0) {
            throw new Error('DATOS_INVALIDOS: El nombre es requerido');
        }
        return await this.repository.crear(nombre.trim(), descripcion?.trim(), activo);
    }
    async actualizar(tipoIngresoId, nombre, descripcion, activo) {
        // Validar que al menos un campo venga
        if (nombre === undefined && descripcion === undefined && activo === undefined) {
            throw new Error('DATOS_INVALIDOS: Debe proporcionar al menos un campo para actualizar');
        }
        return await this.repository.actualizar(tipoIngresoId, nombre?.trim(), descripcion?.trim(), activo);
    }
    async eliminar(tipoIngresoId) {
        return await this.repository.eliminar(tipoIngresoId);
    }
}
exports.TiposIngresoService = TiposIngresoService;
