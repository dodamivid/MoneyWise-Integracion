import { Router } from "express";
import { authController } from "../controllers/auth.controller";

/**
 * @fileoverview Rutas para el módulo de autenticación
 * Endpoints: registro, acceso, olvido, restablecer
 */

const router = Router();

/**
 * POST /api/v1/auth/registro
 * Registra un nuevo usuario
 * 
 * Auth: público (no requiere autenticación)
 * 
 * Body:
 * {
 *   "nombre": "Juan",
 *   "apellidoP": "Pérez",
 *   "apellidoM": "López",
 *   "correo": "juan@example.com",
 *   "fechaN": "1995-05-20",
 *   "contrasena": "Pa$$w0rd!"
 * }
 * 
 * Validaciones:
 * - nombre/apellidos: 2-80 caracteres
 * - correo: formato RFC5322, máx 120 caracteres
 * - fechaN: YYYY-MM-DD, mayor de 16 años
 * - contrasena: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 dígito
 */
router.post("/registro", authController.registro.bind(authController));

/**
 * POST /api/v1/auth/acceso
 * Autentica un usuario y devuelve JWT
 * 
 * Auth: público (no requiere autenticación)
 * 
 * Body:
 * {
 *   "correo": "juan@example.com",
 *   "contrasena": "Pa$$w0rd!"
 * }
 * 
 * Responde con:
 * - token: JWT válido por 24 horas
 * - expiraEn: tiempo de expiración en segundos
 * - usuario: datos básicos del usuario con scopes
 */
router.post("/acceso", authController.acceso.bind(authController));

/**
 * POST /api/v1/auth/olvido
 * Inicia proceso de recuperación de contraseña
 * 
 * Auth: público (no requiere autenticación)
 * 
 * Body:
 * {
 *   "correo": "juan@example.com"
 * }
 * 
 * Nota: Siempre responde éxito para evitar enumeración de usuarios
 * Si el correo existe, envía email con token válido por 15 minutos
 */
router.post("/olvido", authController.olvido.bind(authController));

/**
 * POST /api/v1/auth/restablecer
 * Restablece la contraseña usando un token
 * 
 * Auth: público (no requiere autenticación)
 * 
 * Body:
 * {
 *   "token": "550e8400-e29b-41d4-a716-446655440000",
 *   "contrasenaNueva": "Nuev0P@ss!"
 * }
 * 
 * Validaciones:
 * - token: UUID válido
 * - contrasenaNueva: mismas reglas que registro
 * 
 * Errores:
 * - TOKEN_INVALIDO (400): token no existe
 * - TOKEN_EXPIRADO (410): token expiró (> 15 minutos)
 */
router.post("/restablecer", authController.restablecer.bind(authController));

export default router;