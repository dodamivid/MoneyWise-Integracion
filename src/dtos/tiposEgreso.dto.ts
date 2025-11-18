import { z } from "zod";

/**
 * @fileoverview DTOs para el módulo de Tipos de Egreso
 * Issue #21 - API Catálogos Tipos de Egreso
 * Validaciones con Zod para asegurar integridad de datos
 */

// ============================================
// TIPOS DE EGRESO - SCHEMAS DE VALIDACIÓN
// ============================================

/**
 * Schema para listar tipos de egreso (GET)
 */
export const ListarTiposEgresoQuerySchema = z.object({
  buscar: z.string().max(60).optional(),
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
    .default("nombre:asc")
    .refine(
      (val) => {
        const regex = /^(nombre|creadoEn|actualizadoEn)(:(asc|desc))?$/;
        return regex.test(val);
      },
      {
        message:
          "Orden inválido. Use: nombre|creadoEn|actualizadoEn seguido opcionalmente de :asc o :desc",
      }
    ),
});

export type ListarTiposEgresoQuery = z.infer<
  typeof ListarTiposEgresoQuerySchema
>;

/**
 * Schema para crear tipo de egreso (POST)
 */
export const CrearTipoEgresoBodySchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres")
    .transform((val) => val.trim()),
});

export type CrearTipoEgresoBody = z.infer<typeof CrearTipoEgresoBodySchema>;

/**
 * Schema para actualizar tipo de egreso (PUT)
 */
export const ActualizarTipoEgresoBodySchema = CrearTipoEgresoBodySchema;
export type ActualizarTipoEgresoBody = z.infer<
  typeof ActualizarTipoEgresoBodySchema
>;

/**
 * Schema para parámetros de ruta con ID (tipos de egreso)
 */
export const TipoEgresoIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número entero positivo",
    }),
});

export type TipoEgresoIdParam = z.infer<typeof TipoEgresoIdParamSchema>;

// ============================================
// TIPOS DE EGRESO - TIPOS DE RESPUESTA
// ============================================

/**
 * DTO de Tipo de Egreso
 */
export interface TipoEgresoDTO {
  tipoEgresoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Respuesta al listar tipos de egreso
 */
export interface ListarTiposEgresoResponse {
  ok: boolean;
  data: TipoEgresoDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

/**
 * Respuesta al crear tipo de egreso
 */
export interface CrearTipoEgresoResponse {
  ok: boolean;
  data: {
    tipoEgresoId: number;
    nombre: string;
  };
}

/**
 * Respuesta al actualizar tipo de egreso
 */
export interface ActualizarTipoEgresoResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

/**
 * Respuesta al eliminar tipo de egreso
 */
export interface EliminarTipoEgresoResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}