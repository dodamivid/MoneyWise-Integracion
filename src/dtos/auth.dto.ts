import { z } from "zod";

/**
 * @fileoverview DTOs para autenticación (registro, acceso, recuperación)
 */

// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Validador de email según RFC5322 (básico)
 */
const EmailSchema = z
  .string()
  .email("Formato de correo inválido")
  .max(120, "El correo no puede exceder 120 caracteres");

/**
 * Validador de contraseña segura
 * Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 dígito
 */
const PasswordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
  .regex(/[0-9]/, "La contraseña debe contener al menos un dígito");

/**
 * Validador de fecha de nacimiento (mayor de 16 años)
 */
const FechaNacimientoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (debe ser YYYY-MM-DD)")
  .refine((fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    // Ajustar si aún no ha cumplido años este año
    const edadReal =
      mesActual < mesNacimiento ||
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
export const RegistroBodySchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede exceder 80 caracteres")
    .trim(),
  apellidoP: z
    .string()
    .min(2, "El apellido paterno debe tener al menos 2 caracteres")
    .max(80, "El apellido paterno no puede exceder 80 caracteres")
    .trim(),
  apellidoM: z
    .string()
    .min(2, "El apellido materno debe tener al menos 2 caracteres")
    .max(80, "El apellido materno no puede exceder 80 caracteres")
    .trim(),
  correo: EmailSchema,
  fechaN: FechaNacimientoSchema,
  contrasena: PasswordSchema,
});

export type RegistroBody = z.infer<typeof RegistroBodySchema>;

/**
 * POST /api/v1/auth/acceso (login)
 */
export const AccesoBodySchema = z.object({
  correo: EmailSchema,
  contrasena: z.string().min(1, "La contraseña es requerida"),
});

export type AccesoBody = z.infer<typeof AccesoBodySchema>;

/**
 * POST /api/v1/auth/olvido
 */
export const OlvidoBodySchema = z.object({
  correo: EmailSchema,
});

export type OlvidoBody = z.infer<typeof OlvidoBodySchema>;

/**
 * POST /api/v1/auth/restablecer
 */
export const RestablecerBodySchema = z.object({
  token: z
    .string()
    .uuid("El token debe ser un UUID válido"),
  contrasenaNueva: PasswordSchema,
});

export type RestablecerBody = z.infer<typeof RestablecerBodySchema>;

// ============================================
// TIPOS DE RESPUESTA (DTOs de salida)
// ============================================

/**
 * Respuesta de registro
 */
export interface RegistroResponse {
  ok: boolean;
  data: {
    usuarioId: number;
    nombreCompleto: string;
    correo: string;
    creadoEn: string;
    scopes: string[];
  };
}

/**
 * Respuesta de acceso (login)
 */
export interface AccesoResponse {
  ok: boolean;
  data: {
    token: string;
    refreshToken?: string;
    expiraEn: number;
    usuario: {
      usuarioId: number;
      nombre: string;
      correo: string;
      scopes: string[];
    };
  };
}

/**
 * Respuesta de olvido contraseña
 */
export interface OlvidoResponse {
  ok: boolean;
  data: {
    enviado: boolean;
  };
}

/**
 * Respuesta de restablecer contraseña
 */
export interface RestablecerResponse {
  ok: boolean;
  data: {
    restablecido: boolean;
  };
}