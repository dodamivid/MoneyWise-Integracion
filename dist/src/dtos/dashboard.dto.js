"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetasQuerySchema = exports.BalanceQuerySchema = exports.ResumenQuerySchema = void 0;
const zod_1 = require("zod");
// Helpers
const IsoDateString = zod_1.z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), {
    message: "Fecha en formato ISO-8601 inválido",
});
exports.ResumenQuerySchema = zod_1.z
    .object({
    usuarioId: zod_1.z.string().optional(),
    desde: IsoDateString,
    hasta: IsoDateString,
})
    .refine((vals) => new Date(vals.desde) <= new Date(vals.hasta), {
    message: "Rango de fechas inválido: 'desde' debe ser menor o igual que 'hasta'",
    path: ["desde"],
})
    // Rango máximo sugerido 12 meses
    .refine((vals) => {
    const d1 = new Date(vals.desde).getTime();
    const d2 = new Date(vals.hasta).getTime();
    const diffDays = Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    return diffDays <= 370; // ~12 meses
}, {
    message: "Rango máximo excedido (12 meses)",
    path: ["hasta"],
});
exports.BalanceQuerySchema = zod_1.z.object({
    usuarioId: zod_1.z.string().optional(),
    fechaCorte: IsoDateString.optional(),
});
exports.MetasQuerySchema = zod_1.z
    .object({
    usuarioId: zod_1.z.string().optional(),
    desde: IsoDateString,
    hasta: IsoDateString,
})
    .refine((vals) => new Date(vals.desde) <= new Date(vals.hasta), {
    message: "Rango de fechas inválido: 'desde' debe ser menor o igual que 'hasta'",
    path: ["desde"],
});
