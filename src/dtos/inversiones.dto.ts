// src/dtos/inversiones.dto.ts
import { z } from "zod";

// Esquema de validación para crear/actualizar inversión
export const InversionDTO = z.object({
  usuarioIdusuarioId: z.number().int({ message: "El usuarioId es obligatorio" }),
  monto: z.number().positive("El monto debe ser positivo"),
  plazoMeses: z.number().min(1, "El plazo debe ser mínimo de 1 mes"),
  tipo: z.string().min(1, "El tipo de inversión es obligatorio"),
  fechaInicio: z.string().datetime("Formato de fecha inválido"),
});

export type Inversion = z.infer<typeof InversionDTO>;

const positiveInt = z
  .coerce.number({ invalid_type_error: "Debe ser numérico" })
  .int("Debe ser un entero")
  .positive("Debe ser positivo");

const destinoIdNullable = z.union([
  z
    .coerce.number({ invalid_type_error: "destinoId debe ser numérico" })
    .int("destinoId debe ser entero")
    .positive("destinoId debe ser positivo"),
  z.null(),
]);

const objetivoSchema = z
  .string({ required_error: "El objetivo es obligatorio" })
  .min(1, "El objetivo es obligatorio")
  .max(120, "El objetivo debe tener máximo 120 caracteres");

const fechaSchema = z
  .string({ required_error: "La fecha es obligatoria" })
  .datetime("Formato de fecha inválido");

const fechaFinNullableSchema = z
  .union([fechaSchema, z.null()])
  .optional()
  .refine(
    (value) => value === undefined || value === null || typeof value === "string",
    { message: "fechaFin debe ser una fecha válida o null" }
  );

const montoSchema = z
  .coerce.number({ invalid_type_error: "El monto debe ser numérico" })
  .gt(0, "El monto debe ser mayor a 0");

const tasaSchema = z
  .coerce.number({ invalid_type_error: "La tasa debe ser numérica" })
  .min(0, "La tasa debe ser mayor o igual a 0")
  .max(100, "La tasa no puede superar 100");

const ordenRegex =
  /^(fechaInicio|fechaFin|monto|creadoEn)(?::(asc|desc))?$/i;

const paginaSchema = z
  .coerce.number({ invalid_type_error: "La página debe ser numérica" })
  .int("La página debe ser entera")
  .min(1, "La página debe ser al menos 1")
  .default(1);

const tamanoPaginaSchema = z
  .coerce.number({
    invalid_type_error: "El tamaño de página debe ser numérico",
  })
  .int("El tamaño de página debe ser entero")
  .min(1, "El tamaño de página debe ser al menos 1")
  .max(100, "El tamaño de página no puede exceder 100")
  .default(20);

const ordenSchema = z
  .string({ required_error: "El orden es obligatorio" })
  .regex(
    ordenRegex,
    "El orden debe ser uno de fechaInicio,fechaFin,monto,creadoEn con opcional :asc o :desc"
  )
  .default("fechaInicio:desc");

export const InversionListQuerySchema = z
  .object({
    usuarioId: positiveInt.optional(),
    desde: fechaSchema.optional(),
    hasta: fechaSchema.optional(),
    pagina: paginaSchema,
    tamanoPagina: tamanoPaginaSchema,
    orden: ordenSchema,
  })
  .refine((data) => {
    if (data.desde && data.hasta) {
      return new Date(data.desde) <= new Date(data.hasta);
    }
    return true;
  }, { message: "desde no puede ser mayor que hasta" });

export const InversionCreateSchema = z
  .object({
    usuarioId: positiveInt.optional(),
    destinoId: destinoIdNullable
      .optional()
      .transform((value) => (value === undefined ? null : value)),
    monto: montoSchema,
    objetivo: objetivoSchema,
    fechaInicio: fechaSchema,
    fechaFin: fechaFinNullableSchema.transform((value) =>
      value === undefined ? null : value
    ),
    tasaInteresPorc: tasaSchema,
  })
  .superRefine((data, ctx) => {
    if (data.fechaFin && data.fechaFin < data.fechaInicio) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fechaFin"],
        message: "La fechaFin debe ser mayor o igual a fechaInicio",
      });
    }
  });

export const InversionUpdateSchema = z
  .object({
    destinoId: destinoIdNullable.optional(),
    monto: montoSchema.optional(),
    objetivo: objetivoSchema.optional(),
    fechaInicio: fechaSchema.optional(),
    fechaFin: fechaFinNullableSchema,
    tasaInteresPorc: tasaSchema.optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some(
        (value) => value !== undefined
      ),
    { message: "Debe proporcionar al menos un campo a actualizar" }
  )
  .superRefine((data, ctx) => {
    if (data.fechaFin && data.fechaInicio) {
      if (
        data.fechaFin !== null &&
        data.fechaInicio !== undefined &&
        new Date(data.fechaFin) < new Date(data.fechaInicio)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fechaFin"],
          message: "La fechaFin debe ser mayor o igual a fechaInicio",
        });
      }
    }
  });

export const InversionRecordSchema = z.object({
  inversionId: positiveInt,
  usuarioId: positiveInt,
  destinoId: destinoIdNullable.transform((value) =>
    value === undefined ? null : value
  ),
  monto: montoSchema,
  objetivo: objetivoSchema,
  fechaInicio: fechaSchema,
  fechaFin: fechaFinNullableSchema.transform((value) =>
    value === undefined ? null : value
  ),
  tasaInteresPorc: tasaSchema,
  creadoEn: fechaSchema,
  actualizadoEn: fechaSchema,
});

export type InversionListQuery = z.infer<typeof InversionListQuerySchema>;
export type InversionCreateInput = z.infer<typeof InversionCreateSchema>;
export type InversionUpdateInput = z.infer<typeof InversionUpdateSchema>;
export type InversionRecord = z.infer<typeof InversionRecordSchema>;
