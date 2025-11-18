import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import {
  RegistroBodySchema,
  AccesoBodySchema,
  OlvidoBodySchema,
  RestablecerBodySchema,
} from "../dtos/auth.dto";
import { ValidationError } from "../utils/errors";

/**
 * @fileoverview Controller para endpoints de autenticación
 * Maneja Request/Response y delega lógica al Service
 */

export class AuthController {
  /**
   * POST /api/v1/auth/registro
   * Registra un nuevo usuario
   */
  async registro(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar body
      const bodyValidation = RegistroBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre, apellidoP, apellidoM, correo, fechaN, contrasena } =
        bodyValidation.data;

      // Llamar al service
      const resultado = await authService.registrarUsuario(
        nombre,
        apellidoP,
        apellidoM,
        correo,
        fechaN,
        contrasena
      );

      // Respuesta exitosa
      res.status(201).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/acceso
   * Autentica un usuario y devuelve JWT
   */
  async acceso(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar body
      const bodyValidation = AccesoBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { correo, contrasena } = bodyValidation.data;

      // Llamar al service
      const resultado = await authService.acceso(correo, contrasena);

      // Respuesta exitosa
      res.status(200).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/olvido
   * Inicia proceso de recuperación de contraseña
   */
  async olvido(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar body
      const bodyValidation = OlvidoBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { correo } = bodyValidation.data;

      // Llamar al service
      const resultado = await authService.olvidoContrasena(correo);

      // Siempre responder éxito (para evitar enumeración)
      res.status(200).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
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
  async restablecer(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar body
      const bodyValidation = RestablecerBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { token, contrasenaNueva } = bodyValidation.data;

      // Llamar al service
      const resultado = await authService.restablecerContrasena(
        token,
        contrasenaNueva
      );

      // Respuesta exitosa
      res.status(200).json({
        ok: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Exportar instancia singleton
export const authController = new AuthController();