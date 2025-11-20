"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarIngresoBodySchema = exports.CrearIngresoBodySchema = exports.ListarIngresosQuerySchema = void 0;
const zod_1 = require("zod");
const ISODateTimeSchema = zod_1.z.string().datetime({
    message: "Fecha debe estar en formato ISO-8601",
});
const blankToUndefined = (value) => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    return value === "" ? undefined : value;
};
const moneyHasTwoDecimals = (value) => Number.isFinite(value) && Number(value.toFixed(2)) === value;
const optionalPositiveInt = zod_1.z
    .preprocess((val) => blankToUndefined(val), zod_1.z.coerce.number().int().positive())
    .optional();
const optionalPositiveMoney = zod_1.z
    .preprocess((val) => blankToUndefined(val), zod_1.z.coerce.number().positive())
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
];
const OrdenSchema = zod_1.z
    .preprocess((val) => blankToUndefined(val), zod_1.z.enum(orderValues).default("creadoEn:desc"))
    .transform((value) => {
    if (value === "creadoEn")
        return "creadoEn:desc";
    if (value === "fechaInicio")
        return "fechaInicio:desc";
    if (value === "monto")
        return "monto:desc";
    return value;
});
exports.ListarIngresosQuerySchema = zod_1.z
    .object({
    usuarioId: zod_1.z
        .preprocess((val) => blankToUndefined(val), zod_1.z.string().optional())
        .optional(),
    desde: zod_1.z
        .preprocess((val) => blankToUndefined(val), ISODateTimeSchema.optional())
        .optional(),
    hasta: zod_1.z
        .preprocess((val) => blankToUndefined(val), ISODateTimeSchema.optional())
        .optional(),
    tipoId: optionalPositiveInt,
    procedenciaId: optionalPositiveInt,
    min: optionalPositiveMoney,
    max: optionalPositiveMoney,
    pagina: zod_1.z.coerce.number().int().positive().default(1),
    tamanoPagina: zod_1.z.coerce.number().int().positive().max(100).default(20),
    orden: OrdenSchema,
})
    .refine((data) => {
    if (data.desde && data.hasta) {
        return new Date(data.desde) <= new Date(data.hasta);
    }
    return true;
}, { message: "desde debe ser <= hasta" })
    .refine((data) => {
    if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
    }
    return true;
}, { message: "min debe ser <= max" });
exports.CrearIngresoBodySchema = zod_1.z
    .object({
    usuarioId: zod_1.z.string().optional(),
    tipoId: zod_1.z.number().int().positive({
        message: "tipoId debe ser positivo",
    }),
    procedenciaId: zod_1.z.number().int().positive().nullable().optional(),
    monto: zod_1.z
        .number()
        .positive({ message: "monto debe ser positivo" })
        .refine(moneyHasTwoDecimals, {
        message: "monto debe tener maximo 2 decimales",
    }),
    descripcion: zod_1.z.string().max(255).optional(),
    fechaInicio: ISODateTimeSchema,
    fechaFin: ISODateTimeSchema.optional(),
})
    .refine((data) => {
    if (data.fechaFin) {
        return new Date(data.fechaInicio) <= new Date(data.fechaFin);
    }
    return true;
}, { message: "fechaInicio debe ser <= fechaFin" });
exports.ActualizarIngresoBodySchema = zod_1.z
    .object({
    tipoId: zod_1.z.number().int().positive().optional(),
    procedenciaId: zod_1.z.number().int().positive().nullable().optional(),
    monto: zod_1.z
        .number()
        .positive()
        .refine(moneyHasTwoDecimals, {
        message: "monto debe tener maximo 2 decimales",
    })
        .optional(),
    descripcion: zod_1.z.string().max(255).nullable().optional(),
    fechaInicio: ISODateTimeSchema.optional(),
    fechaFin: ISODateTimeSchema.optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
})
    .refine((data) => {
    if (data.fechaInicio && data.fechaFin) {
        return new Date(data.fechaInicio) <= new Date(data.fechaFin);
    }
    return true;
}, { message: "fechaInicio debe ser <= fechaFin" });
