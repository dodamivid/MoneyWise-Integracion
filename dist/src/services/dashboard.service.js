"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const dashboard_repository_1 = require("../repositories/dashboard.repository");
function resolverUsuarioId(valor, auth, scopeAdmin) {
    if (valor) {
        if (!auth.scopes.includes(scopeAdmin)) {
            throw new Error(`PERMISO_DENEGADO: requiere scope '${scopeAdmin}' para consultar otro usuario`);
        }
        const resolved = parseInt(valor, 10);
        if (isNaN(resolved))
            throw new Error("DATOS_INVALIDOS: usuarioId debe ser numérico");
        return resolved;
    }
    const fromToken = parseInt(auth.userId, 10);
    if (isNaN(fromToken))
        throw new Error("DATOS_INVALIDOS: userId del token debe ser numérico");
    return fromToken;
}
class DashboardService {
    async resumen(params, auth) {
        const usuarioId = resolverUsuarioId(params.usuarioId, auth, "admin:dashboard");
        const rs = await dashboard_repository_1.dashboardRepository.resumen(usuarioId, params.desde, params.hasta);
        // rs es un array de result sets. Cada elemento es un array de filas
        const [rsTotales, rsIngTipo, rsEgrTipo, rsIngProcedencia, rsEgrDestino] = rs;
        const totalesRow = rsTotales?.[0] || { ingresosTotal: 0, egresosTotal: 0, balance: 0 };
        return {
            totales: {
                ingresos: Number(totalesRow.ingresosTotal || 0),
                egresos: Number(totalesRow.egresosTotal || 0),
                balance: Number(totalesRow.balance || (totalesRow.ingresosTotal || 0) - (totalesRow.egresosTotal || 0)),
            },
            ingresosPorTipo: (rsIngTipo || []).map((r) => ({ tipoId: Number(r.tipoId), tipo: r.nombreTipo, total: Number(r.total) })),
            egresosPorTipo: (rsEgrTipo || []).map((r) => ({ tipoId: Number(r.tipoId), tipo: r.nombreTipo, total: Number(r.total) })),
            ingresosPorProcedencia: (rsIngProcedencia || []).map((r) => ({ procedenciaId: Number(r.procedenciaId), procedencia: r.procedencia, total: Number(r.total) })),
            egresosPorDestino: (rsEgrDestino || []).map((r) => ({ destinoId: Number(r.destinoId), destino: r.destino, total: Number(r.total) })),
        };
    }
    async balance(params, auth) {
        const usuarioId = resolverUsuarioId(params.usuarioId, auth, "admin:dashboard");
        const fecha = params.fechaCorte || null; // SP se encarga de fallback a última fecha
        const rs = await dashboard_repository_1.dashboardRepository.balance(usuarioId, fecha);
        const [rsBalance] = rs;
        const row = rsBalance?.[0];
        if (!row) {
            throw new Error("NO_ENCONTRADO: no existe fecha de corte registrada");
        }
        return {
            fechaCorte: row.fechaCorte,
            ingresosAcumulados: Number(row.ingresos || 0),
            egresosAcumulados: Number(row.egresos || 0),
            balanceAcumulado: Number(row.balance || (row.ingresos || 0) - (row.egresos || 0)),
        };
    }
    async metas(params, auth) {
        const usuarioId = resolverUsuarioId(params.usuarioId, auth, "admin:dashboard");
        const rs = await dashboard_repository_1.dashboardRepository.metas(usuarioId, params.desde, params.hasta);
        const [rsMetas, rsResumen] = rs;
        return {
            metas: (rsMetas || []).map((r) => ({
                metaId: Number(r.metaId),
                nombre: r.nombre,
                montoObjetivo: Number(r.montoObjetivo || 0),
                ahorroReal: Number(r.ahorroReal || 0),
                porcentajeAvance: Number(r.porcentajeAvance || 0),
            })),
            resumen: {
                totalMetasActivas: Number(rsResumen?.[0]?.totalMetasActivas || 0),
                ahorroTotalPeriodo: Number(rsResumen?.[0]?.ahorroTotalPeriodo || 0),
                diferenciaObjetivo: Number(rsResumen?.[0]?.diferenciaObjetivo || 0),
            },
        };
    }
}
exports.dashboardService = new DashboardService();
