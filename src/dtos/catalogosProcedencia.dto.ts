import { z } from "zod";

export const ListarProcedenciasQuerySchema = z.object({
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
      (val) => /^(nombre|creadoEn)(:(asc|desc))?$/.test(val),
      {
        message:
          "Orden inválido. Use: nombre|creadoEn seguido opcionalmente de :asc o :desc",
      }
    ),
});

export type ListarProcedenciasQuery = z.infer<
  typeof ListarProcedenciasQuerySchema
>;

export const ProcedenciaIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "El ID debe ser un número entero positivo",
    }),
});

export type ProcedenciaIdParam = z.infer<typeof ProcedenciaIdParamSchema>;

export const CrearProcedenciaBodySchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .transform((val) => val.trim()),
});

export type CrearProcedenciaBody = z.infer<typeof CrearProcedenciaBodySchema>;
export const ActualizarProcedenciaBodySchema = CrearProcedenciaBodySchema;
export type ActualizarProcedenciaBody = z.infer<
  typeof ActualizarProcedenciaBodySchema
>;

export interface ProcedenciaDTO {
  procedenciaId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarProcedenciasResponse {
  ok: boolean;
  data: ProcedenciaDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

export interface CrearProcedenciaResponse {
  ok: boolean;
  data: {
    procedenciaId: number;
    nombre: string;
  };
}

export interface ActualizarProcedenciaResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

export interface EliminarProcedenciaResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}
