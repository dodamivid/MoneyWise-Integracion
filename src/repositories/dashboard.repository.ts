import {
  BalanceOutputDTO,
  MetasVsAhorroOutputDTO,
  ResumenOutputDTO,
} from "../dtos/dashboard.dto";
import { db } from "../config/db";

/**
 * Repositorio simulado que representaría llamadas a SPs de base de datos.
 * En esta integración, devolvemos datos deterministas basados en el rango/fecha
 * para permitir pruebas de contrato sin depender de la BD.
 */
export class DashboardRepository {
  async getResumen(
    usuarioId: string,
    desdeISO: string,
    hastaISO: string
  ): Promise<ResumenOutputDTO> {
    // Intento de BD si está habilitada
    if (db.enabled) {
      try {
        const sets = await db.call("sp_dashboard_resumen(?, ?, ?)", [
          usuarioId,
          desdeISO,
          hastaISO,
        ]);

        const rs1 = (sets[0] || []) as any[]; // totales
        const rs2 = (sets[1] || []) as any[]; // ingresos por tipo
        const rs3 = (sets[2] || []) as any[]; // egresos por tipo
        const rs4 = (sets[3] || []) as any[]; // ingresos por procedencia
        const rs5 = (sets[4] || []) as any[]; // egresos por destino

        const totRow = rs1[0] || {};
        const data: ResumenOutputDTO = {
          totales: {
            ingresos: Number(totRow.ingresosTotal ?? 0),
            egresos: Number(totRow.egresosTotal ?? 0),
            balance: Number(totRow.balance ?? (Number(totRow.ingresosTotal ?? 0) - Number(totRow.egresosTotal ?? 0))),
          },
          ingresosPorTipo: rs2.map((r) => ({
            tipoId: Number(r.tipoId),
            tipo: String(r.nombreTipo ?? r.tipo ?? ""),
            total: Number(r.total ?? 0),
          })),
          egresosPorTipo: rs3.map((r) => ({
            tipoId: Number(r.tipoId),
            tipo: String(r.nombreTipo ?? r.tipo ?? ""),
            total: Number(r.total ?? 0),
          })),
          ingresosPorProcedencia: rs4.map((r) => ({
            procedenciaId: Number(r.procedenciaId),
            procedencia: String(r.procedencia ?? ""),
            total: Number(r.total ?? 0),
          })),
          egresosPorDestino: rs5.map((r) => ({
            destinoId: Number(r.destinoId),
            destino: String(r.destino ?? ""),
            total: Number(r.total ?? 0),
          })),
        };

        return data;
      } catch (e) {
        console.error("Error consultando sp_dashboard_resumen:", (e as Error).message);
        // Fallback a datos deterministas
      }
    }

    // Cálculo simple para obtener números consistentes
    const days = Math.max(1, this.diffDays(desdeISO, hastaISO));
    const ingresos = Number((days * 1000).toFixed(2));
    const egresos = Number((days * 700).toFixed(2));
    const balance = Number((ingresos - egresos).toFixed(2));

    return {
      totales: { ingresos, egresos, balance },
      ingresosPorTipo: [
        { tipoId: 1, tipo: "Salario", total: Number((ingresos * 0.6).toFixed(2)) },
        { tipoId: 2, tipo: "Bonos", total: Number((ingresos * 0.4).toFixed(2)) },
      ],
      egresosPorTipo: [
        { tipoId: 4, tipo: "Renta", total: Number((egresos * 0.375).toFixed(2)) },
        { tipoId: 5, tipo: "Comida", total: Number((egresos * 0.25).toFixed(2)) },
        { tipoId: 6, tipo: "Transporte", total: Number((egresos * 0.2).toFixed(2)) },
      ],
      ingresosPorProcedencia: [
        { procedenciaId: 5, procedencia: "Empresa A", total: Number((ingresos * 0.7).toFixed(2)) },
        { procedenciaId: 6, procedencia: "Freelance", total: Number((ingresos * 0.3).toFixed(2)) },
      ],
      egresosPorDestino: [
        { destinoId: 9, destino: "Departamento", total: Number((egresos * 0.4).toFixed(2)) },
        { destinoId: 10, destino: "Ahorro", total: Number((egresos * 0.1).toFixed(2)) },
      ],
    };
  }

  async getBalance(
    usuarioId: string,
    fechaCorteISO?: string
  ): Promise<BalanceOutputDTO> {
    if (db.enabled) {
      try {
        const sets = await db.call("sp_dashboard_balance(?, ?)", [
          usuarioId,
          fechaCorteISO ?? null,
        ]);
        const rs1 = (sets[0] || []) as any[];
        const row = rs1[0];
        if (!row) {
          // Si el SP no devolvió nada, tratamos como 404 según ticket
          throw new Error("NO_ENCONTRADO: fecha de corte");
        }

        const fecha = String(row.fechaCorte ?? fechaCorteISO ?? new Date().toISOString());
        return {
          fechaCorte: fecha,
          ingresosAcumulados: Number(row.ingresos ?? row.ingresosAcumulados ?? 0),
          egresosAcumulados: Number(row.egresos ?? row.egresosAcumulados ?? 0),
          balanceAcumulado: Number(row.balance ?? row.balanceAcumulado ?? ((Number(row.ingresos ?? 0) - Number(row.egresos ?? 0)))),
        };
      } catch (e) {
        const msg = (e as Error).message || "";
        if (msg.startsWith("NO_ENCONTRADO")) throw e;
        console.error("Error consultando sp_dashboard_balance:", (e as Error).message);
        // Fallback a datos deterministas
      }
    }

    // Si no se especifica fecha, usar "última" (ficticia: ahora fin de día)
    const fecha = fechaCorteISO ? new Date(fechaCorteISO) : new Date();
    if (Number.isNaN(fecha.getTime())) {
      throw new Error("Fecha de corte inválida");
    }

    // Números deterministas por mes-año
    const key = fecha.getUTCFullYear() * 100 + (fecha.getUTCMonth() + 1);
    const ingresos = Number((key * 10).toFixed(2));
    const egresos = Number((key * 7).toFixed(2));

    return {
      fechaCorte: new Date(
        Date.UTC(
          fecha.getUTCFullYear(),
          fecha.getUTCMonth(),
          fecha.getUTCDate(),
          23,
          59,
          59
        )
      ).toISOString(),
      ingresosAcumulados: ingresos,
      egresosAcumulados: egresos,
      balanceAcumulado: Number((ingresos - egresos).toFixed(2)),
    };
  }

  async getMetasVsAhorro(
    usuarioId: string,
    desdeISO: string,
    hastaISO: string
  ): Promise<MetasVsAhorroOutputDTO> {
    if (db.enabled) {
      try {
        const sets = await db.call("sp_dashboard_metas(?, ?, ?)", [
          usuarioId,
          desdeISO,
          hastaISO,
        ]);
        const rs1 = (sets[0] || []) as any[]; // metas
        const rs2 = (sets[1] || []) as any[]; // resumen

        const metas = rs1.map((r) => ({
          metaId: Number(r.metaId),
          nombre: String(r.nombre ?? ""),
          montoObjetivo: Number(r.montoObjetivo ?? 0),
          ahorroReal: Number(r.ahorroReal ?? 0),
          porcentajeAvance: Number(r.porcentajeAvance ?? 0),
        }));

        const resumenRow = rs2[0] || {};
        return {
          metas,
          resumen: {
            totalMetasActivas: Number(resumenRow.totalMetasActivas ?? metas.length),
            ahorroTotalPeriodo: Number(resumenRow.ahorroTotalPeriodo ?? metas.reduce((a, m) => a + m.ahorroReal, 0)),
            diferenciaObjetivo: Number(
              resumenRow.diferenciaObjetivo ?? (metas.reduce((a, m) => a + m.ahorroReal, 0) - metas.reduce((a, m) => a + m.montoObjetivo, 0))
            ),
          },
        };
      } catch (e) {
        console.error("Error consultando sp_dashboard_metas:", (e as Error).message);
        // Fallback a datos deterministas
      }
    }

    const days = Math.max(1, this.diffDays(desdeISO, hastaISO));
    const ahorroTotal = Number((days * 300).toFixed(2));

    const metas = [
      {
        metaId: 7,
        nombre: "Vacaciones 2026",
        montoObjetivo: 150000,
        ahorroReal: Number((ahorroTotal * 0.7).toFixed(2)),
        porcentajeAvance: Number(((ahorroTotal * 0.7) / 150000 * 100).toFixed(2)),
      },
      {
        metaId: 8,
        nombre: "Fondo de emergencia",
        montoObjetivo: 50000,
        ahorroReal: Number((ahorroTotal * 0.3).toFixed(2)),
        porcentajeAvance: Number(((ahorroTotal * 0.3) / 50000 * 100).toFixed(2)),
      },
    ];

    const objetivoTotal = metas.reduce((acc, m) => acc + m.montoObjetivo, 0);
    const ahorroRealTotal = metas.reduce((acc, m) => acc + m.ahorroReal, 0);

    return {
      metas,
      resumen: {
        totalMetasActivas: metas.length,
        ahorroTotalPeriodo: Number(ahorroRealTotal.toFixed(2)),
        diferenciaObjetivo: Number((ahorroRealTotal - objetivoTotal).toFixed(2)),
      },
    };
  }

  private diffDays(desdeISO: string, hastaISO: string): number {
    const d1 = new Date(desdeISO).getTime();
    const d2 = new Date(hastaISO).getTime();
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  }
}

export const dashboardRepository = new DashboardRepository();
