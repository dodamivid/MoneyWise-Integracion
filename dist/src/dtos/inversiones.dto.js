"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InversionRecordSchema = exports.InversionUpdateSchema = exports.InversionCreateSchema = exports.InversionListQuerySchema = exports.InversionDTO = void 0;
const zod_1 = require("zod");
// Esquema de validación para crear/actualizar inversión (versión simple legacy)
exports.InversionDTO = zod_1.z.object({
    usuarioIdusuarioId: zod_1.z.number().int({ message: "El usuarioId es obligatorio" }),
    monto: zod_1.z.number().positive("El monto debe ser positivo"),
    plazoMeses: zod_1.z.number().min(1, "El plazo debe ser mínimo de 1 mes"),
    tipo: zod_1.z.string().min(1, "El tipo de inversión es obligatorio"),
    fechaInicio: zod_1.z.string().datetime("Formato de fecha inválido"),
});
const positiveInt = zod_1.z.coerce.number().int("Debe ser un entero").positive("Debe ser positivo");
const destinoIdNullable = zod_1.z.union([
    zod_1.z.coerce.number().int("destinoId debe ser entero").positive("destinoId debe ser positivo"),
    zod_1.z.null(),
]);
const objetivoSchema = zod_1.z
    .string()
    .min(1, "El objetivo es obligatorio")
    .max(120, "El objetivo debe tener máximo 120 caracteres");
const fechaSchema = zod_1.z.string().datetime("Formato de fecha inválido");
const fechaFinNullableSchema = zod_1.z
    .union([fechaSchema, zod_1.z.null()])
    .optional()
    .refine((value) => value === undefined || value === null || typeof value === "string", { message: "fechaFin debe ser una fecha válida o null" });
const montoSchema = zod_1.z.coerce.number().gt(0, "El monto debe ser mayor a 0");
const tasaSchema = zod_1.z.coerce.number().min(0, "La tasa debe ser mayor o igual a 0").max(100, "La tasa no puede superar 100");
const ordenRegex = /^(fechaInicio|fechaFin|monto|creadoEn)(?::(asc|desc))?$/i;
const paginaSchema = zod_1.z.coerce.number().int("La página debe ser entera").min(1, "La página debe ser al menos 1").default(1);
const tamanoPaginaSchema = zod_1.z
    .coerce.number()
    .int("El tamaño de página debe ser entero")
    .min(1, "El tamaño de página debe ser al menos 1")
    .max(100, "El tamaño de página no puede exceder 100")
    .default(20);
const ordenSchema = zod_1.z
    .string()
    .regex(ordenRegex, "El orden debe ser uno de fechaInicio,fechaFin,monto,creadoEn con opcional :asc o :desc")
    .default("fechaInicio:desc");
exports.InversionListQuerySchema = zod_1.z
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
exports.InversionCreateSchema = zod_1.z
    .object({
    usuarioId: positiveInt.optional(),
    destinoId: destinoIdNullable.optional().transform((value) => (value === undefined ? null : value)),
    monto: montoSchema,
    objetivo: objetivoSchema,
    fechaInicio: fechaSchema,
    fechaFin: fechaFinNullableSchema.transform((value) => (value === undefined ? null : value)),
    tasaInteresPorc: tasaSchema,
})
    .superRefine((data, ctx) => {
    if (data.fechaFin && data.fechaFin < data.fechaInicio) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["fechaFin"],
            message: "La fechaFin debe ser mayor o igual a fechaInicio",
        });
    }
});
exports.InversionUpdateSchema = zod_1.z
    .object({
    destinoId: destinoIdNullable.optional(),
    monto: montoSchema.optional(),
    objetivo: objetivoSchema.optional(),
    fechaInicio: fechaSchema.optional(),
    fechaFin: fechaFinNullableSchema,
    tasaInteresPorc: tasaSchema.optional(),
})
    .refine((data) => Object.values(data).some((value) => value !== undefined), { message: "Debe proporcionar al menos un campo a actualizar" })
    .superRefine((data, ctx) => {
    if (data.fechaFin && data.fechaInicio) {
        if (data.fechaFin !== null && data.fechaInicio !== undefined && new Date(data.fechaFin) < new Date(data.fechaInicio)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["fechaFin"],
                message: "La fechaFin debe ser mayor o igual a fechaInicio",
            });
        }
    }
});
exports.InversionRecordSchema = zod_1.z.object({
    inversionId: positiveInt,
    usuarioId: positiveInt,
    destinoId: destinoIdNullable.transform((value) => (value === undefined ? null : value)),
    monto: montoSchema,
    objetivo: objetivoSchema,
    fechaInicio: fechaSchema,
    fechaFin: fechaFinNullableSchema.transform((value) => (value === undefined ? null : value)),
    tasaInteresPorc: tasaSchema,
    creadoEn: fechaSchema,
    actualizadoEn: fechaSchema,
});
