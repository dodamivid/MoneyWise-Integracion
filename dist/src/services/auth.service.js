"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = exports.TokenExpiradoError = exports.TokenInvalidoError = exports.EmailDuplicadoError = exports.UsuarioInactivoError = exports.CredencialesInvalidasError = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const auth_repository_1 = require("../repositories/auth.repository");
const auth_mailer_1 = require("../emails/auth.mailer");
const jwt_config_1 = require("../config/jwt.config");
const errors_1 = require("../utils/errors");
/**
 * @fileoverview Service para lÃ³gica de negocio de autenticaciÃ³n
 * Maneja hashing de contraseÃ±as, generaciÃ³n de JWT y flujos de recuperaciÃ³n
 */
// Tipos personalizados de error para autenticaciÃ³n
class CredencialesInvalidasError extends errors_1.BadRequestError {
    constructor() {
        super("Correo o contraseÃ±a incorrectos");
        this.name = "CREDENCIALES_INVALIDAS";
    }
}
exports.CredencialesInvalidasError = CredencialesInvalidasError;
class UsuarioInactivoError extends errors_1.BadRequestError {
    constructor() {
        super("Usuario inactivo. Contacta al administrador");
        this.name = "USUARIO_INACTIVO";
    }
}
exports.UsuarioInactivoError = UsuarioInactivoError;
class EmailDuplicadoError extends errors_1.BadRequestError {
    constructor() {
        super("El correo ya estÃ¡ registrado");
        this.name = "EMAIL_DUPLICADO";
    }
}
exports.EmailDuplicadoError = EmailDuplicadoError;
class TokenInvalidoError extends errors_1.BadRequestError {
    constructor() {
        super("Token de restablecimiento invÃ¡lido");
        this.name = "TOKEN_INVALIDO";
    }
}
exports.TokenInvalidoError = TokenInvalidoError;
class TokenExpiradoError extends errors_1.BadRequestError {
    constructor() {
        super("El token de restablecimiento ha expirado");
        this.name = "TOKEN_EXPIRADO";
    }
}
exports.TokenExpiradoError = TokenExpiradoError;
class AuthService {
    /**
     * Registra un nuevo usuario
     */
    async registrarUsuario(nombre, apellidoP, apellidoM, correo, fechaN, contrasena) {
        try {
            // 1. Generar hash de la contraseÃ±a
            const hash = await bcrypt_1.default.hash(contrasena, jwt_config_1.bcryptConfig.saltRounds);
            // 2. Llamar al repository para registrar
            const usuario = await auth_repository_1.authRepository.registrarUsuario(nombre, apellidoP, apellidoM, correo, fechaN, hash);
            // 3. Enviar correo de bienvenida (no bloquear si falla)
            auth_mailer_1.authMailer.enviarBienvenida(correo, nombre).catch((error) => {
                console.error("Error enviando correo de bienvenida:", error);
                // TODO: Registrar mÃ©trica de error de correo
            });
            // 4. Retornar datos del usuario
            return {
                usuarioId: usuario.usuarioId,
                nombreCompleto: `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`,
                correo: usuario.correo,
                creadoEn: usuario.creadoEn,
                scopes: usuario.scopes,
            };
        }
        catch (error) {
            // Detectar error de duplicado del SP
            if (error.message?.includes("DUPLICADO") ||
                error.message?.includes("Duplicate") ||
                error.code === "ER_DUP_ENTRY") {
                throw new EmailDuplicadoError();
            }
            throw error;
        }
    }
    /**
     * Autentica un usuario y genera JWT
     */
    async acceso(correo, contrasena) {
        // 1. Buscar usuario por correo
        const usuario = await auth_repository_1.authRepository.obtenerUsuarioPorCorreo(correo);
        if (!usuario) {
            throw new CredencialesInvalidasError();
        }
        // 2. Verificar que estÃ© activo
        if (!usuario.activo) {
            throw new UsuarioInactivoError();
        }
        // 3. Comparar contraseÃ±a con hash
        const passwordValida = await bcrypt_1.default.compare(contrasena, usuario.hash);
        if (!passwordValida) {
            throw new CredencialesInvalidasError();
        }
        // 4. Generar JWT
        const payload = {
            sub: usuario.usuarioId.toString(),
            nombre: usuario.nombre,
            correo: usuario.correo,
            scopes: usuario.scopes,
        };
        const token = jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.secret, {
            algorithm: jwt_config_1.jwtConfig.algorithm,
            expiresIn: jwt_config_1.jwtConfig.expiresIn,
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        });
        // 5. Calcular tiempo de expiraciÃ³n en segundos
        const expiraEn = 24 * 60 * 60; // 24 horas en segundos
        return {
            token,
            expiraEn,
            usuario: {
                usuarioId: usuario.usuarioId,
                nombre: usuario.nombre,
                correo: usuario.correo,
                scopes: usuario.scopes,
            },
        };
    }
    /**
     * Inicia proceso de recuperaciÃ³n de contraseÃ±a
     * Siempre retorna Ã©xito (para evitar enumeraciÃ³n de usuarios)
     */
    async olvidoContrasena(correo) {
        try {
            // 1. Generar token Ãºnico
            const token = (0, crypto_1.randomUUID)();
            // 2. Calcular fecha de expiraciÃ³n (15 minutos)
            const expira = new Date();
            expira.setMinutes(expira.getMinutes() + jwt_config_1.resetTokenConfig.expirationMinutes);
            // 3. Guardar token en BD
            const guardado = await auth_repository_1.authRepository.iniciarRecuperacion(correo, token, expira);
            // 4. Si el correo existe, enviar email
            if (guardado) {
                const enviado = await auth_mailer_1.authMailer.enviarRestablecimiento(correo, token);
                if (!enviado) {
                    console.error("Error enviando correo de restablecimiento");
                    // TODO: Registrar mÃ©trica de error
                }
            }
            // Siempre retornar Ã©xito (evitar enumeraciÃ³n)
            return { enviado: true };
        }
        catch (error) {
            console.error("Error en proceso de olvido:", error);
            // Siempre retornar Ã©xito (evitar enumeraciÃ³n)
            return { enviado: true };
        }
    }
    /**
     * Restablece la contraseÃ±a usando un token
     */
    async restablecerContrasena(token, contrasenaNueva) {
        try {
            // 1. Generar hash de la nueva contraseÃ±a
            const hashNuevo = await bcrypt_1.default.hash(contrasenaNueva, jwt_config_1.bcryptConfig.saltRounds);
            // 2. Llamar al SP para confirmar restablecimiento
            const restablecido = await auth_repository_1.authRepository.confirmarRestablecimiento(token, hashNuevo);
            if (!restablecido) {
                throw new TokenInvalidoError();
            }
            return { restablecido: true };
        }
        catch (error) {
            // Detectar errores especÃ­ficos del SP
            if (error.message?.includes("TOKEN_EXPIRADO")) {
                throw new TokenExpiradoError();
            }
            if (error.message?.includes("TOKEN_INVALIDO")) {
                throw new TokenInvalidoError();
            }
            throw error;
        }
    }
    /**
     * Verifica un JWT y extrae el payload
     * (Ãštil para middleware de autenticaciÃ³n en producciÃ³n)
     */
    /**
     * Verifica un JWT y extrae el payload
     * (util para middleware de autenticacion en produccion)
     */
    verificarToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.secret, {
                algorithms: [jwt_config_1.jwtConfig.algorithm],
                issuer: jwt_config_1.jwtConfig.issuer,
                audience: jwt_config_1.jwtConfig.audience,
            });
            if (typeof decoded === "string") {
                throw new errors_1.BadRequestError("Token invalido o expirado");
            }
            return decoded;
        }
        catch (error) {
            throw new errors_1.BadRequestError("Token invalido o expirado");
        }
    }
}
exports.AuthService = AuthService;
// Exportar instancia singleton
exports.authService = new AuthService();
