"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.egresosRepository = void 0;
const db_1 = require("../config/db");
class EgresosRepository {
    /**
     * Lista egresos con filtros y paginación
     */
    async listar(query, usuarioIdResuelto) {
        if (db_1.db.enabled && db_1.db.pool) {
            try {
                const { desde, hasta, tipoId, destinoId, min, max, pagina, tamanoPagina, orden, } = query;
                const resultSets = await db_1.db.call("sp_egresos_listar", [
                    usuarioIdResuelto,
                    desde || null,
                    hasta || null,
                    tipoId || null,
                    destinoId || null,
                    min || null,
                    max || null,
                    pagina,
                    tamanoPagina,
                    orden,
                ]);
                // Primer result set: lista de egresos + última fila con totalRegistros
                const rows = resultSets[0];
                if (!rows || rows.length === 0) {
                    return { egresos: [], total: 0 };
                }
                // La última fila contiene totalRegistros
                const lastRow = rows[rows.length - 1];
                const total = lastRow.totalRegistros || 0;
                // Las filas anteriores son los egresos (si total > 0)
                const egresos = total > 0
                    ? rows.slice(0, -1).map((row) => ({
                        egresoId: row.egresoId,
                        usuarioId: row.usuarioId,
                        tipoId: row.tipoId,
                        destinoId: row.destinoId ?? null,
                        monto: Number(row.monto),
                        descripcion: row.descripcion ?? null,
                        fechaInicio: row.fechaInicio,
                        fechaFin: row.fechaFin ?? null,
                        creadoEn: row.creadoEn,
                        actualizadoEn: row.actualizadoEn,
                    }))
                    : [];
                return { egresos, total };
            }
            catch (error) {
                console.error("Error en sp_egresos_listar:", error);
                // Fallback en caso de error
            }
        }
        // Fallback: datos simulados
        const egresos = [
            {
                egresoId: 1,
                usuarioId: usuarioIdResuelto,
                tipoId: 1,
                destinoId: 1,
                monto: 1250.5,
                descripcion: "Renta mensual",
                fechaInicio: "2025-01-01T00:00:00Z",
                fechaFin: "2025-01-31T23:59:59Z",
                creadoEn: "2025-01-01T10:00:00Z",
                actualizadoEn: "2025-01-01T10:00:00Z",
            },
            {
                egresoId: 2,
                usuarioId: usuarioIdResuelto,
                tipoId: 2,
                destinoId: null,
                monto: 450.0,
                descripcion: "Supermercado",
                fechaInicio: "2025-01-15T00:00:00Z",
                fechaFin: null,
                creadoEn: "2025-01-15T08:30:00Z",
                actualizadoEn: "2025-01-15T08:30:00Z",
            },
        ];
        // Aplicar filtros básicos en memoria para el fallback
        let filtered = egresos.filter((e) => e.usuarioId === usuarioIdResuelto);
        if (query.tipoId) {
            filtered = filtered.filter((e) => e.tipoId === query.tipoId);
        }
        if (query.destinoId) {
            filtered = filtered.filter((e) => e.destinoId === query.destinoId);
        }
        if (query.desde) {
            filtered = filtered.filter((e) => new Date(e.fechaInicio) >= new Date(query.desde));
        }
        if (query.hasta) {
            filtered = filtered.filter((e) => new Date(e.fechaInicio) <= new Date(query.hasta));
        }
        if (query.min !== undefined) {
            filtered = filtered.filter((e) => e.monto >= query.min);
        }
        if (query.max !== undefined) {
            filtered = filtered.filter((e) => e.monto <= query.max);
        }
        const total = filtered.length;
        const inicio = (query.pagina - 1) * query.tamanoPagina;
        const paginados = filtered.slice(inicio, inicio + query.tamanoPagina);
        return { egresos: paginados, total };
    }
    /**
     * Crea un nuevo egreso
     */
    async crear(body, usuarioIdResuelto) {
        if (db_1.db.enabled && db_1.db.pool) {
            try {
                const resultSets = await db_1.db.call("sp_egresos_crear", [
                    usuarioIdResuelto,
                    body.tipoId,
                    body.destinoId ?? null,
                    body.monto,
                    body.fechaInicio,
                    body.fechaFin ?? null,
                    body.descripcion ?? null,
                ]);
                const rows = resultSets[0];
                if (rows && rows.length > 0 && rows[0].egresoId) {
                    return rows[0].egresoId;
                }
            }
            catch (error) {
                console.error("Error en sp_egresos_crear:", error);
                // Si el SP lanza SIGNAL con FK_INEXISTENTE, propagar
                if (error.message && error.message.includes("FK_INEXISTENTE")) {
                    throw new Error("FK_INEXISTENTE: tipoId o destinoId no existe");
                }
            }
        }
        // Fallback: simular creación
        return Math.floor(Math.random() * 1000) + 100;
    }
    /**
     * Obtiene un egreso por ID
     */
    async obtener(egresoId) {
        if (db_1.db.enabled && db_1.db.pool) {
            try {
                const resultSets = await db_1.db.call("sp_egresos_obtener", [egresoId]);
                const rows = resultSets[0];
                if (rows && rows.length > 0) {
                    const row = rows[0];
                    return {
                        egresoId: row.egresoId,
                        usuarioId: row.usuarioId,
                        tipoId: row.tipoId,
                        destinoId: row.destinoId ?? null,
                        monto: Number(row.monto),
                        descripcion: row.descripcion ?? null,
                        fechaInicio: row.fechaInicio,
                        fechaFin: row.fechaFin ?? null,
                        creadoEn: row.creadoEn,
                        actualizadoEn: row.actualizadoEn,
                    };
                }
            }
            catch (error) {
                console.error("Error en sp_egresos_obtener:", error);
                // Si el SP lanza SIGNAL con NO_ENCONTRADO, retornar null
                if (error.message && error.message.includes("NO_ENCONTRADO")) {
                    return null;
                }
            }
        }
        // Fallback: datos simulados
        if (egresoId === 1) {
            return {
                egresoId: 1,
                usuarioId: 1,
                tipoId: 1,
                destinoId: 1,
                monto: 1250.5,
                descripcion: "Renta mensual",
                fechaInicio: "2025-01-01T00:00:00Z",
                fechaFin: "2025-01-31T23:59:59Z",
                creadoEn: "2025-01-01T10:00:00Z",
                actualizadoEn: "2025-01-01T10:00:00Z",
            };
        }
        return null;
    }
    /**
     * Actualiza un egreso
     */
    async actualizar(egresoId, body, usuarioIdResuelto) {
        if (db_1.db.enabled && db_1.db.pool) {
            try {
                // Obtener el egreso actual para combinar valores
                const actual = await this.obtener(egresoId);
                if (!actual)
                    return false;
                const resultSets = await db_1.db.call("sp_egresos_actualizar", [
                    egresoId,
                    usuarioIdResuelto,
                    body.tipoId ?? actual.tipoId,
                    body.destinoId !== undefined ? body.destinoId : actual.destinoId,
                    body.monto ?? actual.monto,
                    body.fechaInicio ?? actual.fechaInicio,
                    body.fechaFin !== undefined ? body.fechaFin : actual.fechaFin,
                    body.descripcion !== undefined
                        ? body.descripcion
                        : actual.descripcion,
                ]);
                const rows = resultSets[0];
                if (rows && rows.length > 0 && rows[0].actualizado !== undefined) {
                    return Boolean(rows[0].actualizado);
                }
            }
            catch (error) {
                console.error("Error en sp_egresos_actualizar:", error);
                if (error.message && error.message.includes("FK_INEXISTENTE")) {
                    throw new Error("FK_INEXISTENTE: tipoId o destinoId no existe");
                }
            }
        }
        // Fallback: simular éxito si el ID existe
        const existe = await this.obtener(egresoId);
        return existe !== null;
    }
    /**
     * Elimina un egreso
     */
    async eliminar(egresoId, usuarioIdResuelto) {
        if (db_1.db.enabled && db_1.db.pool) {
            try {
                const resultSets = await db_1.db.call("sp_egresos_eliminar", [
                    egresoId,
                    usuarioIdResuelto,
                ]);
                const rows = resultSets[0];
                if (rows && rows.length > 0 && rows[0].eliminado !== undefined) {
                    return Boolean(rows[0].eliminado);
                }
            }
            catch (error) {
                console.error("Error en sp_egresos_eliminar:", error);
            }
        }
        // Fallback: simular éxito si el ID existe
        const existe = await this.obtener(egresoId);
        return existe !== null;
    }
}
exports.egresosRepository = new EgresosRepository();
