"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiposIngresoRepository = void 0;
class TiposIngresoRepository {
    constructor() {
        this.tipos = [];
        const now = new Date().toISOString();
        this.tipos = [
            { tipoIngresoId: 1, nombre: "Salario", activo: true, creadoEn: now, actualizadoEn: now },
            { tipoIngresoId: 2, nombre: "Comisiones", activo: true, creadoEn: now, actualizadoEn: now },
        ];
    }
    async listar(pagina = 1, tamanoPagina = 20, orden = "nombre:asc", activo) {
        let filtrados = this.tipos;
        if (activo !== undefined) {
            filtrados = filtrados.filter((t) => t.activo === activo);
        }
        const [campo, direccion] = orden.split(":");
        const factor = direccion === "desc" ? -1 : 1;
        filtrados = filtrados.sort((a, b) => {
            const va = a[campo] ?? "";
            const vb = b[campo] ?? "";
            if (va < vb)
                return -1 * factor;
            if (va > vb)
                return 1 * factor;
            return 0;
        });
        const total = filtrados.length;
        const inicio = (pagina - 1) * tamanoPagina;
        const data = filtrados.slice(inicio, inicio + tamanoPagina);
        return { data, total };
    }
    async obtenerPorId(tipoIngresoId) {
        return this.tipos.find((t) => t.tipoIngresoId === tipoIngresoId) ?? null;
    }
    async crear(nombre, descripcion, activo = true) {
        const tipoIngresoId = Math.max(...this.tipos.map((t) => t.tipoIngresoId), 0) + 1;
        const now = new Date().toISOString();
        this.tipos.push({
            tipoIngresoId,
            nombre,
            descripcion,
            activo,
            creadoEn: now,
            actualizadoEn: now,
        });
        return { tipoIngresoId };
    }
    async actualizar(tipoIngresoId, nombre, descripcion, activo) {
        const tipo = this.tipos.find((t) => t.tipoIngresoId === tipoIngresoId);
        if (!tipo)
            return { actualizado: false };
        if (nombre)
            tipo.nombre = nombre;
        if (descripcion !== undefined)
            tipo.descripcion = descripcion;
        if (activo !== undefined)
            tipo.activo = activo;
        tipo.actualizadoEn = new Date().toISOString();
        return { actualizado: true };
    }
    async eliminar(tipoIngresoId) {
        const len = this.tipos.length;
        this.tipos = this.tipos.filter((t) => t.tipoIngresoId !== tipoIngresoId);
        return { eliminado: this.tipos.length < len };
    }
}
exports.TiposIngresoRepository = TiposIngresoRepository;
exports.default = new TiposIngresoRepository();
