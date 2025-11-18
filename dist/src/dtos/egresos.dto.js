"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarEgresoBodySchema = exports.CrearEgresoBodySchema = exports.ListarEgresosQuerySchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para validar fechas ISO-8601
 */
const ISODateTimeSchema = zod_1.z.string().datetime({ message: "Fecha debe estar en formato ISO-8601" });
/**
 * Schema para query params de listado de egresos
 */
exports.ListarEgresosQuerySchema = zod_1.z
    .object({
    usuarioId: zod_1.z.string().optional(),
    desde: ISODateTimeSchema.optional(),
    hasta: ISODateTimeSchema.optional(),
    tipoId: zod_1.z.coerce.number().int().positive().optional(),
    destinoId: zod_1.z.coerce.number().int().positive().optional(),
    min: zod_1.z.coerce.number().positive().optional(),
    max: zod_1.z.coerce.number().positive().optional(),
    pagina: zod_1.z.coerce.number().int().positive().default(1),
    tamanoPagina: zod_1.z.coerce.number().int().positive().max(100).default(20),
    orden: zod_1.z
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
    .refine((data) => {
    // Si ambos desde y hasta existen, validar que desde <= hasta
    if (data.desde && data.hasta) {
        return new Date(data.desde) <= new Date(data.hasta);
    }
    // Si solo uno existe, es inválido
    if (data.desde || data.hasta) {
        return false;
    }
    return true;
}, {
    message: "Debe proporcionar ambos 'desde' y 'hasta', y desde <= hasta",
})
    .refine((data) => {
    if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
    }
    return true;
}, { message: "min debe ser <= max" });
/**
 * Schema para body de creación de egreso
 */
exports.CrearEgresoBodySchema = zod_1.z
    .object({
    usuarioId: zod_1.z.string().optional(),
    tipoId: zod_1.z.number().int().positive({ message: "tipoId debe ser positivo" }),
    destinoId: zod_1.z.number().int().positive().optional(),
    monto: zod_1.z
        .number()
        .positive({ message: "monto debe ser positivo" })
        .refine((val) => Number(val.toFixed(2)) === val || val.toFixed(2).split(".")[1]?.length <= 2, {
        message: "monto debe tener máximo 2 decimales",
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
/**
 * Schema para body de actualización de egreso (parcial)
 */
exports.ActualizarEgresoBodySchema = zod_1.z
    .object({
    tipoId: zod_1.z.number().int().positive().optional(),
    destinoId: zod_1.z.number().int().positive().optional(),
    monto: zod_1.z
        .number()
        .positive()
        .refine((val) => Number(val.toFixed(2)) === val || val.toFixed(2).split(".")[1]?.length <= 2, {
        message: "monto debe tener máximo 2 decimales",
    })
        .optional(),
    descripcion: zod_1.z.string().max(255).optional(),
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
