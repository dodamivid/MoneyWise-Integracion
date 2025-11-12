"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRepository = void 0;
const db_1 = require("../config/db");
exports.dashboardRepository = {
    async resumen(usuarioId, desde, hasta) {
        // Esperamos múltiples RS del SP: RS1 totales, RS2 ingresos por tipo, RS3 egresos por tipo, RS4 ingresos por procedencia, RS5 egresos por destino
        const rows = await db_1.db.call("sp_dashboard_resumen(?, ?, ?)", [
            usuarioId,
            desde,
            hasta,
        ]);
        return rows; // el servicio mapea los result sets a estructuras específicas
    },
    async balance(usuarioId, fechaCorte) {
        const rows = await db_1.db.call("sp_dashboard_balance(?, ?)", [
            usuarioId,
            fechaCorte,
        ]);
        return rows;
    },
    async metas(usuarioId, desde, hasta) {
        const rows = await db_1.db.call("sp_dashboard_metas(?, ?, ?)", [
            usuarioId,
            desde,
            hasta,
        ]);
        return rows;
    },
};
