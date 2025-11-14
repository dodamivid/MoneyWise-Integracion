import { z } from "zod";

/**
 * @fileoverview DTOs para el módulo de catálogos (Destinos)
 * Validaciones con Zod para asegurar integridad de datos
 */

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

/**
 * Schema para listar destinos (GET)
 */
export const ListarDestinosQuerySchema = z.object({
  buscar: z.string().max(100).optional(),
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
        const regex = /^(nombre|creadoEn)(:(asc|desc))?$/;
        return regex.test(val);
      },
      {
        message:
          "Orden inválido. Use: nombre|creadoEn seguido opcionalmente de :asc o :desc",
      }
    ),
});

export type ListarDestinosQuery = z.infer<typeof ListarDestinosQuerySchema>;

/**
 * Schema para crear destino (POST)
 */
export const CrearDestinoBodySchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .transform((val) => {
      // Convertir a formato título: "suscripciones" -> "Suscripciones"
      return val
        .trim()
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }),
});

export type CrearDestinoBody = z.infer<typeof CrearDestinoBodySchema>;

/**
 * Schema para actualizar destino (PUT)
 */
export const ActualizarDestinoBodySchema = CrearDestinoBodySchema;
export type ActualizarDestinoBody = z.infer<typeof ActualizarDestinoBodySchema>;

/**
 * Schema para parámetros de ruta con ID
 */
export const DestinoIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número entero positivo",
    }),
});

export type DestinoIdParam = z.infer<typeof DestinoIdParamSchema>;

// ============================================
// TIPOS DE RESPUESTA (DTOs de salida)
// ============================================

/**
 * DTO de un destino individual
 */
export interface DestinoDTO {
  destinoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: string; // ISO-8601
  actualizadoEn: string; // ISO-8601
}

/**
 * Respuesta de listado con paginación
 */
export interface ListarDestinosResponse {
  ok: boolean;
  data: DestinoDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

/**
 * Respuesta de creación
 */
export interface CrearDestinoResponse {
  ok: boolean;
  data: {
    destinoId: number;
    nombre: string;
  };
}

/**
 * Respuesta de actualización
 */
export interface ActualizarDestinoResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

/**
 * Respuesta de eliminación
 */
export interface EliminarDestinoResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}