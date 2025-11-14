import { z } from "zod";

/**
 * Schema para validar fechas ISO-8601
 */
const ISODateTimeSchema = z.string().datetime({ message: "Fecha debe estar en formato ISO-8601" });

/**
 * Schema para query params de listado de egresos
 */
export const ListarEgresosQuerySchema = z
  .object({
    usuarioId: z.string().optional(),
    desde: ISODateTimeSchema.optional(),
    hasta: ISODateTimeSchema.optional(),
    tipoId: z.coerce.number().int().positive().optional(),
    destinoId: z.coerce.number().int().positive().optional(),
    min: z.coerce.number().positive().optional(),
    max: z.coerce.number().positive().optional(),
    pagina: z.coerce.number().int().positive().default(1),
    tamanoPagina: z.coerce.number().int().positive().max(100).default(20),
    orden: z
      .enum([
        "creadoEn:asc",
        "creadoEn:desc",
        "fechaInicio:asc",
        "fechaInicio:desc",
        "monto:asc",
        "monto:desc",
      ])
      .default("creadoEn:desc"),
  })
  .refine(
    (data) => {
      // Si ambos desde y hasta existen, validar que desde <= hasta
      if (data.desde && data.hasta) {
        return new Date(data.desde) <= new Date(data.hasta);
      }
      // Si solo uno existe, es inválido
      if (data.desde || data.hasta) {
        return false;
      }
      return true;
    },
    {
      message: "Debe proporcionar ambos 'desde' y 'hasta', y desde <= hasta",
    }
  )
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
      return true;
    },
    { message: "min debe ser <= max" }
  );

export type ListarEgresosQuery = z.infer<typeof ListarEgresosQuerySchema>;

/**
 * Schema para body de creación de egreso
 */
export const CrearEgresoBodySchema = z
  .object({
    usuarioId: z.string().optional(),
    tipoId: z.number().int().positive({ message: "tipoId debe ser positivo" }),
    destinoId: z.number().int().positive().optional(),
    monto: z
      .number()
      .positive({ message: "monto debe ser positivo" })
      .refine((val) => Number(val.toFixed(2)) === val || val.toFixed(2).split(".")[1]?.length <= 2, {
        message: "monto debe tener máximo 2 decimales",
      }),
    descripcion: z.string().max(255).optional(),
    fechaInicio: ISODateTimeSchema,
    fechaFin: ISODateTimeSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.fechaFin) {
        return new Date(data.fechaInicio) <= new Date(data.fechaFin);
      }
      return true;
    },
    { message: "fechaInicio debe ser <= fechaFin" }
  );

export type CrearEgresoBody = z.infer<typeof CrearEgresoBodySchema>;

/**
 * Schema para body de actualización de egreso (parcial)
 */
export const ActualizarEgresoBodySchema = z
  .object({
    tipoId: z.number().int().positive().optional(),
    destinoId: z.number().int().positive().optional(),
    monto: z
      .number()
      .positive()
      .refine((val) => Number(val.toFixed(2)) === val || val.toFixed(2).split(".")[1]?.length <= 2, {
        message: "monto debe tener máximo 2 decimales",
      })
      .optional(),
    descripcion: z.string().max(255).optional(),
    fechaInicio: ISODateTimeSchema.optional(),
    fechaFin: ISODateTimeSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaInicio) <= new Date(data.fechaFin);
      }
      return true;
    },
    { message: "fechaInicio debe ser <= fechaFin" }
  );

export type ActualizarEgresoBody = z.infer<typeof ActualizarEgresoBodySchema>;

/**
 * Interfaz para egreso completo (DTO de respuesta)
 */
export interface EgresoDTO {
  egresoId: number;
  usuarioId: number;
  tipoId: number;
  destinoId: number | null;
  monto: number;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Interfaz para respuesta de listado con paginación
 */
export interface ListarEgresosResponse {
  ok: boolean;
  data: EgresoDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

/**
 * Interfaz para respuesta de creación
 */
export interface CrearEgresoResponse {
  ok: boolean;
  data: {
    egresoId: number;
  };
}

/**
 * Interfaz para respuesta de obtener un egreso
 */
export interface ObtenerEgresoResponse {
  ok: boolean;
  data: EgresoDTO;
}

/**
 * Interfaz para respuesta de actualización
 */
export interface ActualizarEgresoResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

/**
 * Interfaz para respuesta de eliminación
 */
export interface EliminarEgresoResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}
