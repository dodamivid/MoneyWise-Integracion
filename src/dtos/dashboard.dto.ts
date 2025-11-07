import { z } from "zod";

// Utilidad para validar ISO-8601 y normalizar a Date
export const IsoDateTimeString = z
  .string({ message: "Fecha requerida" })
  .datetime({ message: "Formato de fecha inválido (ISO-8601)" });

export const ResumenQuerySchema = z.object({
  desde: IsoDateTimeString,
  hasta: IsoDateTimeString,
  usuarioId: z.string().optional(),
});

export type ResumenQuery = z.infer<typeof ResumenQuerySchema>;

export const BalanceQuerySchema = z.object({
  fechaCorte: IsoDateTimeString.optional(), // Fallback a última fecha en repo si falta
  usuarioId: z.string().optional(),
});

export type BalanceQuery = z.infer<typeof BalanceQuerySchema>;

export const MetasQuerySchema = z.object({
  desde: IsoDateTimeString,
  hasta: IsoDateTimeString,
  usuarioId: z.string().optional(),
});

export type MetasQuery = z.infer<typeof MetasQuerySchema>;

// Tipos de salida (contrato del ticket)
export interface ResumenOutputDTO {
  totales: { ingresos: number; egresos: number; balance: number };
  ingresosPorTipo: Array<{ tipoId: number; tipo: string; total: number }>;
  egresosPorTipo: Array<{ tipoId: number; tipo: string; total: number }>;
  ingresosPorProcedencia: Array<{
    procedenciaId: number;
    procedencia: string;
    total: number;
  }>;
  egresosPorDestino: Array<{ destinoId: number; destino: string; total: number }>;
}

export interface BalanceOutputDTO {
  fechaCorte: string; // ISO
  ingresosAcumulados: number;
  egresosAcumulados: number;
  balanceAcumulado: number;
}

export interface MetasVsAhorroOutputDTO {
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
