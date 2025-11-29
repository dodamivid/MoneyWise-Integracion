"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoEgresoIdParamSchema = exports.ActualizarTipoEgresoBodySchema = exports.CrearTipoEgresoBodySchema = exports.ListarTiposEgresoQuerySchema = void 0;
const zod_1 = require("zod");
/**
 * @fileoverview DTOs para el módulo de Tipos de Egreso
 * Issue #21 - API Catálogos Tipos de Egreso
 * Validaciones con Zod para asegurar integridad de datos
 */
// ============================================
// TIPOS DE EGRESO - SCHEMAS DE VALIDACIÓN
// ============================================
/**
 * Schema para listar tipos de egreso (GET)
 */
exports.ListarTiposEgresoQuerySchema = zod_1.z.object({
    buscar: zod_1.z.string().max(60).optional(),
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
        .refine((val) => {
        const regex = /^(nombre|creadoEn|actualizadoEn)(:(asc|desc))?$/;
        return regex.test(val);
    }, {
        message: "Orden inválido. Use: nombre|creadoEn|actualizadoEn seguido opcionalmente de :asc o :desc",
    }),
});
/**
 * Schema para crear tipo de egreso (POST)
 */
exports.CrearTipoEgresoBodySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(60, "El nombre no puede exceder 60 caracteres")
        .transform((val) => val.trim()),
});
/**
 * Schema para actualizar tipo de egreso (PUT)
 */
exports.ActualizarTipoEgresoBodySchema = exports.CrearTipoEgresoBodySchema;
/**
 * Schema para parámetros de ruta con ID (tipos de egreso)
 */
exports.TipoEgresoIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "El ID debe ser un número entero positivo",
    }),
});
