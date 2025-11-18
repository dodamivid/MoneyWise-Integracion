import { db } from "../config/db";

export const dashboardRepository = {
  async resumen(usuarioId: number, desde: string, hasta: string) {
    // Esperamos múltiples RS del SP: RS1 totales, RS2 ingresos por tipo, RS3 egresos por tipo, RS4 ingresos por procedencia, RS5 egresos por destino
    const rows = await db.call("sp_dashboard_resumen(?, ?, ?)", [
      usuarioId,
      desde,
      hasta,
    ]);
    return rows; // el servicio mapea los result sets a estructuras específicas
  },

  async balance(usuarioId: number, fechaCorte: string | null) {
    const rows = await db.call("sp_dashboard_balance(?, ?)", [
      usuarioId,
      fechaCorte,
    ]);
    return rows;
  },

  async metas(usuarioId: number, desde: string, hasta: string) {
    const rows = await db.call("sp_dashboard_metas(?, ?, ?)", [
      usuarioId,
      desde,
      hasta,
    ]);
    return rows;
  },
};
