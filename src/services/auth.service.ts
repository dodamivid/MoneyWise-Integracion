import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { authRepository } from "../repositories/auth.repository";
import { authMailer } from "../emails/auth.mailer";
import { jwtConfig, bcryptConfig, resetTokenConfig } from "../config/jwt.config";
import {
  BadRequestError,
  ValidationError,
  InternalServerError,
} from "../utils/errors";

/**
 * @fileoverview Service para lógica de negocio de autenticación
 * Maneja hashing de contraseñas, generación de JWT y flujos de recuperación
 */

// Tipos personalizados de error para autenticación
export class CredencialesInvalidasError extends BadRequestError {
  constructor() {
    super("Correo o contraseña incorrectos");
    this.name = "CREDENCIALES_INVALIDAS";
  }
}

export class UsuarioInactivoError extends BadRequestError {
  constructor() {
    super("Usuario inactivo. Contacta al administrador");
    this.name = "USUARIO_INACTIVO";
  }
}

export class EmailDuplicadoError extends BadRequestError {
  constructor() {
    super("El correo ya está registrado");
    this.name = "EMAIL_DUPLICADO";
  }
}

export class TokenInvalidoError extends BadRequestError {
  constructor() {
    super("Token de restablecimiento inválido");
    this.name = "TOKEN_INVALIDO";
  }
}

export class TokenExpiradoError extends BadRequestError {
  constructor() {
    super("El token de restablecimiento ha expirado");
    this.name = "TOKEN_EXPIRADO";
  }
}

// Payload del JWT
interface JWTPayload {
  sub: number; // usuarioId
  nombre: string;
  correo: string;
  scopes: string[];
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async registrarUsuario(
    nombre: string,
    apellidoP: string,
    apellidoM: string,
    correo: string,
    fechaN: string,
    contrasena: string
  ): Promise<{
    usuarioId: number;
    nombreCompleto: string;
    correo: string;
    creadoEn: string;
    scopes: string[];
  }> {
    try {
      // 1. Generar hash de la contraseña
      const hash = await bcrypt.hash(contrasena, bcryptConfig.saltRounds);

      // 2. Llamar al repository para registrar
      const usuario = await authRepository.registrarUsuario(
        nombre,
        apellidoP,
        apellidoM,
        correo,
        fechaN,
        hash
      );

      // 3. Enviar correo de bienvenida (no bloquear si falla)
      authMailer.enviarBienvenida(correo, nombre).catch((error) => {
        console.error("Error enviando correo de bienvenida:", error);
        // TODO: Registrar métrica de error de correo
      });

      // 4. Retornar datos del usuario
      return {
        usuarioId: usuario.usuarioId,
        nombreCompleto: `${usuario.nombre} ${usuario.apellidoP} ${usuario.apellidoM}`,
        correo: usuario.correo,
        creadoEn: usuario.creadoEn,
        scopes: usuario.scopes,
      };
    } catch (error: any) {
      // Detectar error de duplicado del SP
      if (
        error.message?.includes("DUPLICADO") ||
        error.message?.includes("Duplicate") ||
        error.code === "ER_DUP_ENTRY"
      ) {
        throw new EmailDuplicadoError();
      }
      throw error;
    }
  }

  /**
   * Autentica un usuario y genera JWT
   */
  async acceso(
    correo: string,
    contrasena: string
  ): Promise<{
    token: string;
    expiraEn: number;
    usuario: {
      usuarioId: number;
      nombre: string;
      correo: string;
      scopes: string[];
    };
  }> {
    // 1. Buscar usuario por correo
    const usuario = await authRepository.obtenerUsuarioPorCorreo(correo);

    if (!usuario) {
      throw new CredencialesInvalidasError();
    }

    // 2. Verificar que esté activo
    if (!usuario.activo) {
      throw new UsuarioInactivoError();
    }

    // 3. Comparar contraseña con hash
    const passwordValida = await bcrypt.compare(contrasena, usuario.hash);

    if (!passwordValida) {
      throw new CredencialesInvalidasError();
    }

    // 4. Generar JWT
    const payload: JWTPayload = {
      sub: usuario.usuarioId,
      nombre: usuario.nombre,
      correo: usuario.correo,
      scopes: usuario.scopes,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      algorithm: jwtConfig.algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    // 5. Calcular tiempo de expiración en segundos
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
   * Inicia proceso de recuperación de contraseña
   * Siempre retorna éxito (para evitar enumeración de usuarios)
   */
  async olvidoContrasena(correo: string): Promise<{ enviado: boolean }> {
    try {
      // 1. Generar token único
      const token = uuidv4();

      // 2. Calcular fecha de expiración (15 minutos)
      const expira = new Date();
      expira.setMinutes(expira.getMinutes() + resetTokenConfig.expirationMinutes);

      // 3. Guardar token en BD
      const guardado = await authRepository.iniciarRecuperacion(
        correo,
        token,
        expira
      );

      // 4. Si el correo existe, enviar email
      if (guardado) {
        const enviado = await authMailer.enviarRestablecimiento(correo, token);
        
        if (!enviado) {
          console.error("Error enviando correo de restablecimiento");
          // TODO: Registrar métrica de error
        }
      }

      // Siempre retornar éxito (evitar enumeración)
      return { enviado: true };
    } catch (error) {
      console.error("Error en proceso de olvido:", error);
      // Siempre retornar éxito (evitar enumeración)
      return { enviado: true };
    }
  }

  /**
   * Restablece la contraseña usando un token
   */
  async restablecerContrasena(
    token: string,
    contrasenaNueva: string
  ): Promise<{ restablecido: boolean }> {
    try {
      // 1. Generar hash de la nueva contraseña
      const hashNuevo = await bcrypt.hash(contrasenaNueva, bcryptConfig.saltRounds);

      // 2. Llamar al SP para confirmar restablecimiento
      const restablecido = await authRepository.confirmarRestablecimiento(
        token,
        hashNuevo
      );

      if (!restablecido) {
        throw new TokenInvalidoError();
      }

      return { restablecido: true };
    } catch (error: any) {
      // Detectar errores específicos del SP
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
   * (Útil para middleware de autenticación en producción)
   */
  verificarToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm as jwt.Algorithm], // ← FIX AQUÍ
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as JWTPayload;

      return decoded;
    } catch (error: any) {
      throw new BadRequestError("Token inválido o expirado");
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();