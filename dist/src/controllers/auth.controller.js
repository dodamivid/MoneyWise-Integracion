"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_dto_1 = require("../dtos/auth.dto");
const errors_1 = require("../utils/errors");
/**
 * @fileoverview Controller para endpoints de autenticación
 * Maneja Request/Response y delega lógica al Service
 */
class AuthController {
    /**
     * POST /api/v1/auth/registro
     * Registra un nuevo usuario
     */
    async registro(req, res, next) {
        try {
            // Validar body
            const bodyValidation = auth_dto_1.RegistroBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { nombre, apellidoP, apellidoM, correo, fechaN, contrasena } = bodyValidation.data;
            // Llamar al service
            const resultado = await auth_service_1.authService.registrarUsuario(nombre, apellidoP, apellidoM, correo, fechaN, contrasena);
            // Respuesta exitosa
            res.status(201).json({
                ok: true,
                data: resultado,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/auth/acceso
     * Autentica un usuario y devuelve JWT
     */
    async acceso(req, res, next) {
        try {
            // Validar body
            const bodyValidation = auth_dto_1.AccesoBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { correo, contrasena } = bodyValidation.data;
            // Llamar al service
            const resultado = await auth_service_1.authService.acceso(correo, contrasena);
            // Respuesta exitosa
            res.status(200).json({
                ok: true,
                data: resultado,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/auth/olvido
     * Inicia proceso de recuperación de contraseña
     */
    async olvido(req, res, next) {
        try {
            // Validar body
            const bodyValidation = auth_dto_1.OlvidoBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { correo } = bodyValidation.data;
            // Llamar al service
            const resultado = await auth_service_1.authService.olvidoContrasena(correo);
            // Siempre responder éxito (para evitar enumeración)
            res.status(200).json({
                ok: true,
                data: resultado,
            });
        }
        catch (error) {
            // Incluso en error, responder éxito
            res.status(200).json({
                ok: true,
                data: { enviado: true },
            });
        }
    }
    /**
     * POST /api/v1/auth/restablecer
     * Restablece la contraseña usando un token
     */
    async restablecer(req, res, next) {
        try {
            // Validar body
            const bodyValidation = auth_dto_1.RestablecerBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { token, contrasenaNueva } = bodyValidation.data;
            // Llamar al service
            const resultado = await auth_service_1.authService.restablecerContrasena(token, contrasenaNueva);
            // Respuesta exitosa
            res.status(200).json({
                ok: true,
                data: resultado,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
// Exportar instancia singleton
exports.authController = new AuthController();
