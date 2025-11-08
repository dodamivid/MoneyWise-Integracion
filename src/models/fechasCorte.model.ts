import { z } from "zod";

// Identificador entero autoincremental proveniente de la BD/SP
export const FechaCorteIdSchema = z
  .number({ message: "El id de fecha de corte debe ser numérico" })
  .int({ message: "El id de fecha de corte debe ser entero" })
  .positive({ message: "El id de fecha de corte debe ser positivo" });

// UsuarioId entero según supuestos del ticket
export const UsuarioIdSchema = z
  .number({ message: "El usuarioId debe ser numérico" })
  .int({ message: "El usuarioId debe ser entero" })
  .positive({ message: "El usuarioId debe ser positivo" });

// ISO-8601 en UTC
export const ISODateStringSchema = z
  .string({ message: "La fecha debe ser una cadena ISO-8601" })
  .datetime({ message: "Formato de fecha inválido, se espera ISO-8601" });

export const FechaCorteSchema = z.object({
  fechaCorteId: FechaCorteIdSchema,
  usuarioId: UsuarioIdSchema,
  fechaCorte: ISODateStringSchema,
  creadoEn: ISODateStringSchema,
});

export type FechaCorte = z.infer<typeof FechaCorteSchema>;

// Entrada para crear
export const CrearFechaCorteSchema = z.object({
  usuarioId: UsuarioIdSchema.optional(), // Si no viene, se tomará de JWT `sub`
  fechaCorte: ISODateStringSchema,
});
export type CrearFechaCorteInput = z.infer<typeof CrearFechaCorteSchema>;

// Query params de listado
export const ListarFechasCorteQuerySchema = z.object({
  usuarioId: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isInteger(v) && v > 0), {
      message: "usuarioId inválido",
    }),
  pagina: z.coerce.number().int().positive().default(1),
  tamanoPagina: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
  orden: z
    .string()
    .optional()
    .transform((v) => v ?? "fechaCorte:desc")
    .refine(
      (v) =>
        ["fechaCorte", "creadoEn"].some((k) =>
          v === k || v === `${k}:asc` || v === `${k}:desc`
        ),
      {
        message:
          "orden inválido. Use fechaCorte|creadoEn[:asc|:desc]",
      }
    ),
});
export type ListarFechasCorteQuery = z.infer<
  typeof ListarFechasCorteQuerySchema
>;

export interface PaginacionMeta {
  pagina: number;
  tamanoPagina: number;
  total: number;
}
