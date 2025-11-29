"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogosProcedenciaRepository = exports.CatalogosProcedenciaRepository = void 0;
const db_1 = require("../config/db");
class CatalogosProcedenciaRepository {
    constructor() {
        this.procedencias = [];
        const now = new Date().toISOString();
        this.procedencias = [
            {
                procedenciaId: 1,
                usuarioId: null,
                nombre: "Salario",
                esPorDefecto: true,
                creadoEn: now,
                actualizadoEn: now,
            },
            {
                procedenciaId: 2,
                usuarioId: null,
                nombre: "Freelance",
                esPorDefecto: true,
                creadoEn: now,
                actualizadoEn: now,
            },
            {
                procedenciaId: 3,
                usuarioId: null,
                nombre: "Inversiones",
                esPorDefecto: true,
                creadoEn: now,
                actualizadoEn: now,
            },
        ];
    }
    async listarProcedencias(usuarioId, buscar, pagina, tamanoPagina, orden) {
        if (db_1.db.enabled && db_1.db.pool) {
            const resultSets = await db_1.db.call("sp_procedencias_listar", [
                usuarioId,
                buscar ?? "",
                pagina,
                tamanoPagina,
                orden,
            ]);
            const rows = resultSets[0] ?? [];
            const procedencias = rows.map((row) => ({
                procedenciaId: Number(row.procedenciaId),
                usuarioId: row.usuarioId?.toString() ?? null,
                nombre: row.nombre,
                esPorDefecto: Boolean(row.esPorDefecto),
                creadoEn: row.creadoEn,
                actualizadoEn: row.actualizadoEn,
            }));
            const total = rows[0]?.totalRegistros ?? rows.length;
            return { procedencias, total };
        }
        const disponibles = this.procedencias.filter((p) => p.usuarioId === null || p.usuarioId === usuarioId);
        let filtrados = disponibles;
        if (buscar) {
            const termino = buscar.toLowerCase();
            filtrados = filtrados.filter((p) => p.nombre.toLowerCase().includes(termino));
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
        const procedencias = filtrados.slice(inicio, inicio + tamanoPagina);
        return { procedencias, total };
    }
    async crearProcedencia(usuarioId, nombre) {
        if (db_1.db.enabled && db_1.db.pool) {
            const resultSets = await db_1.db.call("sp_procedencias_crear", [
                usuarioId,
                nombre,
            ]);
            const rows = resultSets[0] ?? [];
            if (!rows.length) {
                throw new Error("Error al crear procedencia");
            }
            return {
                procedenciaId: Number(rows[0].procedenciaId),
                nombre: rows[0].nombre,
            };
        }
        const existe = this.procedencias.find((p) => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (existe) {
            throw new Error("DUPLICADO");
        }
        const procedenciaId = Math.max(...this.procedencias.map((p) => p.procedenciaId), 0) + 1;
        const now = new Date().toISOString();
        this.procedencias.push({
            procedenciaId,
            usuarioId,
            nombre,
            esPorDefecto: false,
            creadoEn: now,
            actualizadoEn: now,
        });
        return { procedenciaId, nombre };
    }
    async actualizarProcedencia(procedenciaId, usuarioId, nombre, esAdmin) {
        if (db_1.db.enabled && db_1.db.pool) {
            const resultSets = await db_1.db.call("sp_procedencias_actualizar", [
                procedenciaId,
                usuarioId,
                nombre,
            ]);
            const rows = resultSets[0] ?? [];
            if (!rows.length) {
                throw new Error("NO_ENCONTRADO");
            }
            return { actualizado: Boolean(rows[0].actualizado) };
        }
        const procedencia = this.procedencias.find((p) => p.procedenciaId === procedenciaId);
        if (!procedencia) {
            throw new Error("NO_ENCONTRADO");
        }
        if (procedencia.esPorDefecto && !esAdmin) {
            throw new Error("PERMISO_DENEGADO");
        }
        const duplicado = this.procedencias.find((p) => p.procedenciaId !== procedenciaId &&
            p.nombre.toLowerCase() === nombre.toLowerCase());
        if (duplicado) {
            throw new Error("DUPLICADO");
        }
        procedencia.nombre = nombre;
        procedencia.actualizadoEn = new Date().toISOString();
        return { actualizado: true };
    }
    async eliminarProcedencia(procedenciaId, usuarioId, esAdmin) {
        if (db_1.db.enabled && db_1.db.pool) {
            const resultSets = await db_1.db.call("sp_procedencias_eliminar", [
                procedenciaId,
                usuarioId,
            ]);
            const rows = resultSets[0] ?? [];
            if (!rows.length) {
                throw new Error("NO_ENCONTRADO");
            }
            return { eliminado: Boolean(rows[0].eliminado) };
        }
        const procedencia = this.procedencias.find((p) => p.procedenciaId === procedenciaId);
        if (!procedencia) {
            throw new Error("NO_ENCONTRADO");
        }
        if (procedencia.esPorDefecto && !esAdmin) {
            throw new Error("PERMISO_DENEGADO");
        }
        const sizeBefore = this.procedencias.length;
        this.procedencias = this.procedencias.filter((p) => p.procedenciaId !== procedenciaId);
        return { eliminado: this.procedencias.length < sizeBefore };
    }
}
exports.CatalogosProcedenciaRepository = CatalogosProcedenciaRepository;
exports.catalogosProcedenciaRepository = new CatalogosProcedenciaRepository();
