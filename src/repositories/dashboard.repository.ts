import { db } from "../config/db";
import { toMySQLDateTime } from "../utils/mysqlDate";

export const dashboardRepository = {
  async resumen(usuarioId: number, desde: string, hasta: string) {
    // Esperamos múltiples RS del SP: RS1 totales, RS2 ingresos por tipo, RS3 egresos por tipo, RS4 ingresos por procedencia, RS5 egresos por destino
    const rows = await db.call("sp_dashboard_resumen", [
      usuarioId,
      toMySQLDateTime(desde),
      toMySQLDateTime(hasta),
    ]);
    return rows; // el servicio mapea los result sets a estructuras específicas
  },

  async balance(usuarioId: number, fechaCorte: string | null) {
    const rows = await db.call("sp_dashboard_balance", [
      usuarioId,
      toMySQLDateTime(fechaCorte),
    ]);
    return rows;
  },

  async metas(usuarioId: number, desde: string, hasta: string) {
    const rows = await db.call("sp_dashboard_metas", [
      usuarioId,
      toMySQLDateTime(desde),
      toMySQLDateTime(hasta),
    ]);
    return rows;
  },
};
