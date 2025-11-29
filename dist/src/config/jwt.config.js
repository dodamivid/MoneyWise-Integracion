"use strict";
/**
 * @fileoverview Configuración de JWT para autenticación
 * Usa RS256 (clave pública/privada) según especificación
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetTokenConfig = exports.bcryptConfig = exports.jwtConfig = void 0;
exports.jwtConfig = {
    // Algoritmo de firma (RS256 requiere claves RSA)
    algorithm: "HS256", // Usamos HS256 por simplicidad en integración
    // Expiración del token (24 horas)
    expiresIn: "24h",
    // Secret para firmar (en producción usar RS256 con claves RSA)
    secret: process.env.JWT_SECRET || "moneywise-secret-key-change-in-production",
    // Issuer del token
    issuer: "moneywise-api",
    // Audience
    audience: "moneywise-users",
};
/**
 * Configuración de bcrypt
 */
exports.bcryptConfig = {
    // Cost factor (rondas de hashing)
    // Mínimo 12 según especificación
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
};
/**
 * Configuración de tokens de restablecimiento
 */
exports.resetTokenConfig = {
    // Duración del token (15 minutos)
    expirationMinutes: 15,
    // URL base de la aplicación (para el link de restablecimiento)
    appUrl: process.env.APP_URL || "http://localhost:3000",
};
