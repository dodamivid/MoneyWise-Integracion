"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InversionDTO = void 0;
// src/dtos/inversiones.dto.ts
const zod_1 = require("zod");
// Esquema de validación para crear/actualizar inversión
exports.InversionDTO = zod_1.z.object({
    usuarioIdusuarioId: zod_1.z.number().int({ message: "El usuarioId es obligatorio" }),
    monto: zod_1.z.number().positive("El monto debe ser positivo"),
    plazoMeses: zod_1.z.number().min(1, "El plazo debe ser mínimo de 1 mes"),
    tipo: zod_1.z.string().min(1, "El tipo de inversión es obligatorio"),
    fechaInicio: zod_1.z.string().datetime("Formato de fecha inválido"),
});
