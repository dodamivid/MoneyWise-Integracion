"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrecuenciaIdParamSchema = exports.ActualizarFrecuenciaBodySchema = exports.CrearFrecuenciaBodySchema = exports.ListarFrecuenciasQuerySchema = exports.DestinoIdParamSchema = exports.ActualizarDestinoBodySchema = exports.CrearDestinoBodySchema = exports.ListarDestinosQuerySchema = void 0;
const zod_1 = require("zod");
/**
 * @fileoverview DTOs para el módulo de catálogos (Destinos y Frecuencias)
 * Validaciones con Zod para asegurar integridad de datos
 */
// ============================================
// DESTINOS - SCHEMAS DE VALIDACIÓN
// ============================================
/**
 * Schema para listar destinos (GET)
 */
exports.ListarDestinosQuerySchema = zod_1.z.object({
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
        .refine((val) => {
        const regex = /^(nombre|creadoEn)(:(asc|desc))?$/;
        return regex.test(val);
    }, {
        message: "Orden inválido. Use: nombre|creadoEn seguido opcionalmente de :asc o :desc",
    }),
});
/**
 * Schema para crear destino (POST)
 */
exports.CrearDestinoBodySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .transform((val) => {
        // Convertir a formato título: "suscripciones" -> "Suscripciones"
        return val
            .trim()
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }),
});
/**
 * Schema para actualizar destino (PUT)
 */
exports.ActualizarDestinoBodySchema = exports.CrearDestinoBodySchema;
/**
 * Schema para parámetros de ruta con ID (destinos)
 */
exports.DestinoIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "El ID debe ser un número entero positivo",
    }),
});
// ============================================
// FRECUENCIAS - SCHEMAS DE VALIDACIÓN
// ============================================
/**
 * Schema para listar frecuencias (GET)
 */
exports.ListarFrecuenciasQuerySchema = zod_1.z.object({
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
        const regex = /^(nombre|creadoEn)(:(asc|desc))?$/;
        return regex.test(val);
    }, {
        message: "Orden inválido. Use: nombre|creadoEn seguido opcionalmente de :asc o :desc",
    }),
});
/**
 * Schema para crear frecuencia (POST)
 */
exports.CrearFrecuenciaBodySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(60, "El nombre no puede exceder 60 caracteres")
        .transform((val) => {
        // Convertir a formato título
        return val
            .trim()
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }),
});
/**
 * Schema para actualizar frecuencia (PUT)
 */
exports.ActualizarFrecuenciaBodySchema = exports.CrearFrecuenciaBodySchema;
/**
 * Schema para parámetros de ruta con ID (frecuencias)
 */
exports.FrecuenciaIdParamSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && val > 0, {
        message: "El ID debe ser un número entero positivo",
    }),
});
