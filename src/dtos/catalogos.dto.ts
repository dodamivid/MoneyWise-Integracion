import { z } from "zod";

/**
 * @fileoverview DTOs para el módulo de catálogos (Destinos y Frecuencias)
 * Validaciones con Zod para asegurar integridad de datos
 */

// ============================================
// DESTINOS - SCHEMAS DE VALIDACIÓN
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
 * Schema para parámetros de ruta con ID (destinos)
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
// FRECUENCIAS - SCHEMAS DE VALIDACIÓN
// ============================================

/**
 * Schema para listar frecuencias (GET)
 */
export const ListarFrecuenciasQuerySchema = z.object({
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
        const regex = /^(nombre|creadoEn)(:(asc|desc))?$/;
        return regex.test(val);
      },
      {
        message:
          "Orden inválido. Use: nombre|creadoEn seguido opcionalmente de :asc o :desc",
      }
    ),
});

export type ListarFrecuenciasQuery = z.infer<typeof ListarFrecuenciasQuerySchema>;

/**
 * Schema para crear frecuencia (POST)
 */
export const CrearFrecuenciaBodySchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres")
    .transform((val) => {
      // Convertir a formato título
      return val
        .trim()
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }),
});

export type CrearFrecuenciaBody = z.infer<typeof CrearFrecuenciaBodySchema>;

/**
 * Schema para actualizar frecuencia (PUT)
 */
export const ActualizarFrecuenciaBodySchema = CrearFrecuenciaBodySchema;
export type ActualizarFrecuenciaBody = z.infer<typeof ActualizarFrecuenciaBodySchema>;

/**
 * Schema para parámetros de ruta con ID (frecuencias)
 */
export const FrecuenciaIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número entero positivo",
    }),
});

export type FrecuenciaIdParam = z.infer<typeof FrecuenciaIdParamSchema>;

// ============================================
// DESTINOS - TIPOS DE RESPUESTA
// ============================================

export interface DestinoDTO {
  destinoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

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

export interface CrearDestinoResponse {
  ok: boolean;
  data: {
    destinoId: number;
    nombre: string;
  };
}

export interface ActualizarDestinoResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

export interface EliminarDestinoResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}

// ============================================
// FRECUENCIAS - TIPOS DE RESPUESTA
// ============================================

export interface FrecuenciaDTO {
  frecuenciaId: number;
  nombre: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarFrecuenciasResponse {
  ok: boolean;
  data: FrecuenciaDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

export interface CrearFrecuenciaResponse {
  ok: boolean;
  data: {
    frecuenciaId: number;
    nombre: string;
  };
}

export interface ActualizarFrecuenciaResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

export interface EliminarFrecuenciaResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}