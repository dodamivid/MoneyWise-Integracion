import { z } from "zod";

// Helpers
const IsoDateString = z
  .string()
  .refine((v) => !isNaN(Date.parse(v)), {
    message: "Fecha en formato ISO-8601 inválido",
  });

export const ResumenQuerySchema = z
  .object({
    usuarioId: z.string().optional(),
    desde: IsoDateString,
    hasta: IsoDateString,
  })
  .refine((vals) => new Date(vals.desde) <= new Date(vals.hasta), {
    message: "Rango de fechas inválido: 'desde' debe ser menor o igual que 'hasta'",
    path: ["desde"],
  })
  // Rango máximo sugerido 12 meses
  .refine((vals) => {
    const d1 = new Date(vals.desde).getTime();
    const d2 = new Date(vals.hasta).getTime();
    const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diffDays <= 370; // ~12 meses
  }, {
    message: "Rango máximo excedido (12 meses)",
    path: ["hasta"],
  });

export type ResumenQuery = z.infer<typeof ResumenQuerySchema>;

export const BalanceQuerySchema = z.object({
  usuarioId: z.string().optional(),
  fechaCorte: IsoDateString.optional(),
});
export type BalanceQuery = z.infer<typeof BalanceQuerySchema>;

export const MetasQuerySchema = z
  .object({
    usuarioId: z.string().optional(),
    desde: IsoDateString,
    hasta: IsoDateString,
  })
  .refine((vals) => new Date(vals.desde) <= new Date(vals.hasta), {
    message: "Rango de fechas inválido: 'desde' debe ser menor o igual que 'hasta'",
    path: ["desde"],
  });
export type MetasQuery = z.infer<typeof MetasQuerySchema>;

// Tipos de respuesta (contracto de salida del servicio)
export interface DashboardResumenDTO {
  totales: {
    ingresos: number;
    egresos: number;
    balance: number;
  };
  ingresosPorTipo: Array<{ tipoId: number; tipo: string; total: number }>;
  egresosPorTipo: Array<{ tipoId: number; tipo: string; total: number }>;
  ingresosPorProcedencia: Array<{
    procedenciaId: number;
    procedencia: string;
    total: number;
  }>;
  egresosPorDestino: Array<{ destinoId: number; destino: string; total: number }>;
}

export interface DashboardBalanceDTO {
  fechaCorte: string;
  ingresosAcumulados: number;
  egresosAcumulados: number;
  balanceAcumulado: number;
}

export interface DashboardMetasDTO {
  metas: Array<{
    metaId: number;
    nombre: string;
    montoObjetivo: number;
    ahorroReal: number;
    porcentajeAvance: number;
  }>;
  resumen: {
    totalMetasActivas: number;
    ahorroTotalPeriodo: number;
    diferenciaObjetivo: number;
  };
}
