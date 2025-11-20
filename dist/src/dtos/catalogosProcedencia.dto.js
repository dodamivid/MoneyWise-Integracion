"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarProcedenciaBodySchema = exports.CrearProcedenciaBodySchema = exports.ProcedenciaIdParamSchema = exports.ListarProcedenciasQuerySchema = void 0;
const zod_1 = require("zod");
exports.ListarProcedenciasQuerySchema = zod_1.z.object({
    buscar: zod_1.z.string().max(100).optional(),
    pagina: zod_1.z
        .string()
        .optional()
        .default("1")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, { message: "La página debe ser mayor a 0" }),
    tamanoPagina: zod_1.z
        .string()
        .optional()
        .default("20")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0 && val <= 100, {
        message: "El tamaño de página debe estar entre 1 y 100",
    }),
    orden: zod_1.z
        .string()
        .optional()
        .default("nombre:asc")
        .refine((val) => /^(nombre|creadoEn)(:(asc|desc))?$/.test(val), {
        message: "Orden inválido. Use: nombre|creadoEn seguido opcionalmente de :asc o :desc",
    }),
});
exports.ProcedenciaIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "El ID debe ser un número entero positivo",
    }),
});
exports.CrearProcedenciaBodySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .transform((val) => val.trim()),
});
exports.ActualizarProcedenciaBodySchema = exports.CrearProcedenciaBodySchema;
