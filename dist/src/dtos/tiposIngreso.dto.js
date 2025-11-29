"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListarTiposIngresoSchema = exports.ActualizarTipoIngresoSchema = exports.CrearTipoIngresoSchema = void 0;
const zod_1 = require("zod");
exports.CrearTipoIngresoSchema = zod_1.z.object({
    nombre: zod_1.z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
    descripcion: zod_1.z.string().max(255, "La descripción no puede exceder 255 caracteres").optional(),
    activo: zod_1.z.boolean().optional(),
});
exports.ActualizarTipoIngresoSchema = exports.CrearTipoIngresoSchema.partial().refine((data) => Object.keys(data).length > 0, { message: "Debe proporcionar al menos un campo para actualizar" });
exports.ListarTiposIngresoSchema = zod_1.z.object({
    pagina: zod_1.z.coerce.number().int().positive().default(1),
    tamanoPagina: zod_1.z.coerce.number().int().positive().max(100).default(20),
    orden: zod_1.z
        .string()
        .default("nombre:asc")
        .refine((val) => /^(nombre|creadoEn)(:(asc|desc))?$/.test(val), { message: "Orden invalido" }),
    activo: zod_1.z
        .union([zod_1.z.string(), zod_1.z.boolean()])
        .optional()
        .transform((val) => {
        if (typeof val === "string") {
            if (val.toLowerCase() === "true")
                return true;
            if (val.toLowerCase() === "false")
                return false;
        }
        return val;
    }),
});
