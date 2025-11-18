import { z } from "zod";

const ISODateTimeSchema = z.string().datetime({
  message: "Fecha debe estar en formato ISO-8601",
});

const blankToUndefined = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return value === "" ? undefined : value;
};

const moneyHasTwoDecimals = (value: number) =>
  Number.isFinite(value) && Number(value.toFixed(2)) === value;

const optionalPositiveInt = z
  .preprocess(
    (val) => blankToUndefined(val),
    z.coerce.number().int().positive()
  )
  .optional();

const optionalPositiveMoney = z
  .preprocess(
    (val) => blankToUndefined(val),
    z.coerce.number().positive()
  )
  .refine(moneyHasTwoDecimals, {
    message: "El monto debe tener maximo 2 decimales",
  })
  .optional();

const orderValues = [
  "creadoEn",
  "creadoEn:asc",
  "creadoEn:desc",
  "fechaInicio",
  "fechaInicio:asc",
  "fechaInicio:desc",
  "monto",
  "monto:asc",
  "monto:desc",
] as const;

const OrdenSchema = z
  .preprocess((val) => blankToUndefined(val), z.enum(orderValues).default("creadoEn:desc"))
  .transform((value) => {
    if (value === "creadoEn") return "creadoEn:desc";
    if (value === "fechaInicio") return "fechaInicio:desc";
    if (value === "monto") return "monto:desc";
    return value;
  });

export const ListarIngresosQuerySchema = z
  .object({
    usuarioId: z
      .preprocess((val) => blankToUndefined(val), z.string().optional())
      .optional(),
    desde: z
      .preprocess(
        (val) => blankToUndefined(val),
        ISODateTimeSchema.optional()
      )
      .optional(),
    hasta: z
      .preprocess(
        (val) => blankToUndefined(val),
        ISODateTimeSchema.optional()
      )
      .optional(),
    tipoId: optionalPositiveInt,
    procedenciaId: optionalPositiveInt,
    min: optionalPositiveMoney,
    max: optionalPositiveMoney,
    pagina: z.coerce.number().int().positive().default(1),
    tamanoPagina: z.coerce.number().int().positive().max(100).default(20),
    orden: OrdenSchema,
  })
  .refine(
    (data) => {
      if (data.desde && data.hasta) {
        return new Date(data.desde) <= new Date(data.hasta);
      }
      return true;
    },
    { message: "desde debe ser <= hasta" }
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

export type ListarIngresosQuery = z.infer<typeof ListarIngresosQuerySchema>;

export const CrearIngresoBodySchema = z
  .object({
    usuarioId: z.string().optional(),
    tipoId: z.number().int().positive({
      message: "tipoId debe ser positivo",
    }),
    procedenciaId: z.number().int().positive().nullable().optional(),
    monto: z
      .number()
      .positive({ message: "monto debe ser positivo" })
      .refine(moneyHasTwoDecimals, {
        message: "monto debe tener maximo 2 decimales",
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

export type CrearIngresoBody = z.infer<typeof CrearIngresoBodySchema>;

export const ActualizarIngresoBodySchema = z
  .object({
    tipoId: z.number().int().positive().optional(),
    procedenciaId: z.number().int().positive().nullable().optional(),
    monto: z
      .number()
      .positive()
      .refine(moneyHasTwoDecimals, {
        message: "monto debe tener maximo 2 decimales",
      })
      .optional(),
    descripcion: z.string().max(255).nullable().optional(),
    fechaInicio: ISODateTimeSchema.optional(),
    fechaFin: ISODateTimeSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "Debe proporcionar al menos un campo para actualizar",
    }
  )
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaInicio) <= new Date(data.fechaFin);
      }
      return true;
    },
    { message: "fechaInicio debe ser <= fechaFin" }
  );

export type ActualizarIngresoBody = z.infer<typeof ActualizarIngresoBodySchema>;

export interface IngresoDTO {
  ingresoId: number;
  usuarioId: number;
  tipoId: number;
  procedenciaId: number | null;
  monto: number;
  descripcion: string | null;
  fechaInicio: string;
  fechaFin: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ListarIngresosResponse {
  ok: boolean;
  data: IngresoDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

export interface CrearIngresoResponse {
  ok: boolean;
  data: {
    ingresoId: number;
  };
}

export interface ObtenerIngresoResponse {
  ok: boolean;
  data: IngresoDTO;
}

export interface ActualizarIngresoResponse {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

export interface EliminarIngresoResponse {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}
