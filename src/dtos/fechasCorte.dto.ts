import { z } from "zod";

/**
 * @fileoverview DTOs para el módulo de Fechas de Corte de Ahorro
 * Issue #91 - expone `fechas_corte_ahorro` por API (los SPs ya existían,
 * pero no había routes/controller/service/repository que los llamaran).
 * Spec original: tickets/API_fechas_corte.md
 */

const ISODateTimeSchema = z.string().datetime({
  message: "fechaCorte debe estar en formato ISO-8601",
});

// ============================================
// FECHAS DE CORTE - SCHEMAS DE VALIDACIÓN
// ============================================

/**
 * Schema para listar fechas de corte (GET)
 */
export const ListarFechasCorteQuerySchema = z.object({
  pagina: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, { message: "La página debe ser mayor a 0" }),
  tamanoPagina: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, {
      message: "El tamaño de página debe estar entre 1 y 100",
    }),
  orden: z
    .string()
    .optional()
    .default("fechaCorte:desc")
    .refine(
      (val) => /^(fechaCorte|creadoEn)(:(asc|desc))?$/.test(val),
      {
        message:
          "Orden inválido. Use: fechaCorte|creadoEn seguido opcionalmente de :asc o :desc",
      }
    ),
});

export type ListarFechasCorteQuery = z.infer<
  typeof ListarFechasCorteQuerySchema
>;

/**
 * Schema para crear fecha de corte (POST)
 */
export const CrearFechaCorteBodySchema = z.object({
  fechaCorte: ISODateTimeSchema,
});

export type CrearFechaCorteBody = z.infer<typeof CrearFechaCorteBodySchema>;

/**
 * Schema para parámetros de ruta con ID (fecha de corte)
 */
export const FechaCorteIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número entero positivo",
    }),
});

export type FechaCorteIdParam = z.infer<typeof FechaCorteIdParamSchema>;

// ============================================
// FECHAS DE CORTE - TIPOS DE RESPUESTA
// ============================================

/**
 * DTO de Fecha de Corte
 */
export interface FechaCorteDTO {
  fechaCorteId: number;
  usuarioId: string;
  fechaCorte: string;
  creadoEn: string;
}

/**
 * Respuesta al listar fechas de corte
 */
export interface ListarFechasCorteResponse {
  ok: boolean;
  data: FechaCorteDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

/**
 * Respuesta al crear fecha de corte
 */
export interface CrearFechaCorteResponse {
  ok: boolean;
  data: {
    fechaCorteId: number;
  };
}

/**
 * Respuesta al eliminar fecha de corte
 */
export interface EliminarFechaCorteResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}
