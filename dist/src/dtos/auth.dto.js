"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestablecerBodySchema = exports.OlvidoBodySchema = exports.AccesoBodySchema = exports.RegistroBodySchema = void 0;
const zod_1 = require("zod");
/**
 * @fileoverview DTOs para autenticación (registro, acceso, recuperación)
 */
// ============================================
// HELPERS DE VALIDACIÓN
// ============================================
/**
 * Validador de email según RFC5322 (básico)
 */
const EmailSchema = zod_1.z
    .string()
    .email("Formato de correo inválido")
    .max(120, "El correo no puede exceder 120 caracteres");
/**
 * Validador de contraseña segura
 * Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 dígito
 */
const PasswordSchema = zod_1.z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un dígito");
/**
 * Validador de fecha de nacimiento (mayor de 16 años)
 */
const FechaNacimientoSchema = zod_1.z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (debe ser YYYY-MM-DD)")
    .refine((fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    // Ajustar si aún no ha cumplido años este año
    const edadReal = mesActual < mesNacimiento ||
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())
        ? edad - 1
        : edad;
    return edadReal >= 16;
}, "Debes ser mayor de 16 años para registrarte");
// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================
/**
 * POST /api/v1/auth/registro
 */
exports.RegistroBodySchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(80, "El nombre no puede exceder 80 caracteres")
        .trim(),
    apellidoP: zod_1.z
        .string()
        .min(2, "El apellido paterno debe tener al menos 2 caracteres")
        .max(80, "El apellido paterno no puede exceder 80 caracteres")
        .trim(),
    apellidoM: zod_1.z
        .string()
        .min(2, "El apellido materno debe tener al menos 2 caracteres")
        .max(80, "El apellido materno no puede exceder 80 caracteres")
        .trim(),
    correo: EmailSchema,
    fechaN: FechaNacimientoSchema,
    contrasena: PasswordSchema,
});
/**
 * POST /api/v1/auth/acceso (login)
 */
exports.AccesoBodySchema = zod_1.z.object({
    correo: EmailSchema,
    contrasena: zod_1.z.string().min(1, "La contraseña es requerida"),
});
/**
 * POST /api/v1/auth/olvido
 */
exports.OlvidoBodySchema = zod_1.z.object({
    correo: EmailSchema,
});
/**
 * POST /api/v1/auth/restablecer
 */
exports.RestablecerBodySchema = zod_1.z.object({
    token: zod_1.z
        .string()
        .uuid("El token debe ser un UUID válido"),
    contrasenaNueva: PasswordSchema,
});
