import { z } from "zod";

/**
 * @fileoverview DTOs para el módulo de Tipos de Ingreso
 * Issue #77: rediseñado para alinear el modelo con la tabla real
 * (`usuario_id`/`es_por_defecto`, sin `descripcion`/`activo` que nunca
 * existieron en el schema) y con el patrón de los demás catálogos
 * (destinos, procedencias, tipos_egreso).
 */

// ============================================
// TIPOS DE INGRESO - SCHEMAS DE VALIDACIÓN
// ============================================

/**
 * Schema para listar tipos de ingreso (GET)
 */
export const ListarTiposIngresoQuerySchema = z.object({
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

export type ListarTiposIngresoQuery = z.infer<
  typeof ListarTiposIngresoQuerySchema
>;

/**
 * Schema para crear tipo de ingreso (POST)
 */
export const CrearTipoIngresoBodySchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres")
    .transform((val) => val.trim()),
});

export type CrearTipoIngresoBody = z.infer<typeof CrearTipoIngresoBodySchema>;

/**
 * Schema para actualizar tipo de ingreso (PUT)
 */
export const ActualizarTipoIngresoBodySchema = CrearTipoIngresoBodySchema;
export type ActualizarTipoIngresoBody = z.infer<
  typeof ActualizarTipoIngresoBodySchema
>;

/**
 * Schema para parámetros de ruta con ID (tipos de ingreso)
 */
export const TipoIngresoIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número entero positivo",
    }),
});

export type TipoIngresoIdParam = z.infer<typeof TipoIngresoIdParamSchema>;

// ============================================
// TIPOS DE INGRESO - TIPOS DE RESPUESTA
// ============================================

/**
 * DTO de Tipo de Ingreso
 */
export interface TipoIngresoDTO {
  tipoIngresoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Respuesta al listar tipos de ingreso
 */
export interface ListarTiposIngresoResponse {
  ok: boolean;
  data: TipoIngresoDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

/**
 * Respuesta al crear tipo de ingreso
 */
export interface CrearTipoIngresoResponse {
  ok: boolean;
  data: {
    tipoIngresoId: number;
    nombre: string;
  };
}

/**
 * Respuesta al actualizar tipo de ingreso
 */
export interface ActualizarTipoIngresoResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

/**
 * Respuesta al eliminar tipo de ingreso
 */
export interface EliminarTipoIngresoResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}
