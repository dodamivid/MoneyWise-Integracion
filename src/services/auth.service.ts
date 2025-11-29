import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { authRepository } from "../repositories/auth.repository";
import { userRepository } from "../repositories/user.repository";
import { authMailer } from "../emails/auth.mailer";
import { jwtConfig, bcryptConfig, resetTokenConfig } from "../config/jwt.config";
import {
  BadRequestError,
  ValidationError,
  InternalServerError,
} from "../utils/errors";

/**
 * @fileoverview Service para lÃ³gica de negocio de autenticaciÃ³n
 * Maneja hashing de contraseÃ±as, generaciÃ³n de JWT y flujos de recuperaciÃ³n
 */

// Tipos personalizados de error para autenticaciÃ³n
export class CredencialesInvalidasError extends BadRequestError {
  constructor() {
    super("Correo o contraseÃ±a incorrectos");
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
    super("El correo ya estÃ¡ registrado");
    this.name = "EMAIL_DUPLICADO";
  }
}

export class TokenInvalidoError extends BadRequestError {
  constructor() {
    super("Token de restablecimiento invÃ¡lido");
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
interface JWTPayload extends jwt.JwtPayload {
  sub: string; // usuarioId como string en el JWT
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
      // 1. Generar hash de la contraseÃ±a
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

      // 2b. Sincronizar repositorio en memoria usado por /api/users
      try {
        await userRepository.upsert({
          usuarioId: usuario.usuarioId,
          correo,
          contrasena: hash,
          nombre,
          apellidoP,
          apellidoM,
          fechaN,
          activo: true,
          creadoEn: usuario.creadoEn ?? new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        });
      } catch (syncError) {
        console.warn("No se pudo sincronizar usuario en memoria:", syncError);
      }

      // 3. Enviar correo de bienvenida (no bloquear si falla)
      authMailer.enviarBienvenida(correo, nombre).catch((error) => {
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

    // 2. Verificar que estÃ© activo
    if (!usuario.activo) {
      throw new UsuarioInactivoError();
    }

    // 3. Comparar contraseÃ±a con hash
    const passwordValida = await bcrypt.compare(contrasena, usuario.hash);

    if (!passwordValida) {
      throw new CredencialesInvalidasError();
    }

    // 4. Generar JWT
    const payload: JWTPayload = {
      sub: usuario.usuarioId.toString(),
      nombre: usuario.nombre,
      correo: usuario.correo,
      scopes: usuario.scopes,
    };

    const token = jwt.sign(payload, jwtConfig.secret as jwt.Secret, {
      algorithm: jwtConfig.algorithm as jwt.Algorithm,
      expiresIn: jwtConfig.expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    } as jwt.SignOptions);

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
  async olvidoContrasena(correo: string): Promise<{ enviado: boolean }> {
    try {
      // 1. Generar token Ãºnico
      const token = randomUUID();

      // 2. Calcular fecha de expiraciÃ³n (15 minutos)
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
          // TODO: Registrar mÃ©trica de error
        }
      }

      // Siempre retornar Ã©xito (evitar enumeraciÃ³n)
      return { enviado: true };
    } catch (error) {
      console.error("Error en proceso de olvido:", error);
      // Siempre retornar Ã©xito (evitar enumeraciÃ³n)
      return { enviado: true };
    }
  }

  /**
   * Restablece la contraseÃ±a usando un token
   */
  async restablecerContrasena(
    token: string,
    contrasenaNueva: string
  ): Promise<{ restablecido: boolean }> {
    try {
      // 1. Generar hash de la nueva contraseÃ±a
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
  verificarToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(
        token,
        jwtConfig.secret as jwt.Secret,
        {
          algorithms: [jwtConfig.algorithm as jwt.Algorithm],
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience,
        }
      );

      if (typeof decoded === "string") {
        throw new BadRequestError("Token invalido o expirado");
      }

      return decoded as JWTPayload;
    } catch (error: any) {
      throw new BadRequestError("Token invalido o expirado");
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();



