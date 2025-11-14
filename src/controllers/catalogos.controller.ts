import { Request, Response, NextFunction } from "express";
import { catalogosService } from "../services/catalogos.service";
import {
  ListarDestinosQuerySchema,
  CrearDestinoBodySchema,
  ActualizarDestinoBodySchema,
  DestinoIdParamSchema,
} from "../dtos/catalogos.dto";
import { ValidationError } from "../utils/errors";

/**
 * @fileoverview Controller para endpoints de catálogos de destinos
 * Maneja Request/Response y delega lógica al Service
 */

export class CatalogosController {
  /**
   * GET /api/v1/catalogos/destinos
   * Lista destinos con paginación
   */
  async listarDestinos(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar query params
      const queryValidation = ListarDestinosQuerySchema.safeParse(req.query);

      if (!queryValidation.success) {
        throw new ValidationError(
          queryValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { buscar, pagina, tamanoPagina, orden } = queryValidation.data;

      // Obtener usuario y scopes del middleware de auth
      const auth = res.locals.auth as {
        userId: string;
        scopes: string[];
      };

      // Llamar al service
      const { destinos, total } = await catalogosService.listarDestinos(
        auth.userId,
        buscar,
        pagina,
        tamanoPagina,
        orden,
        auth.scopes
      );

      // Respuesta exitosa
      res.status(200).json({
        ok: true,
        data: destinos,
        meta: {
          paginacion: {
            pagina,
            tamanoPagina,
            total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/catalogos/destinos
   * Crea un nuevo destino
   */
  async crearDestino(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar body
      const bodyValidation = CrearDestinoBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre } = bodyValidation.data;

      // Obtener usuario del middleware de auth
      const auth = res.locals.auth as {
        userId: string;
        scopes: string[];
      };

      // Llamar al service
      const resultado = await catalogosService.crearDestino(
        auth.userId,
        nombre
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
   * PUT /api/v1/catalogos/destinos/:id
   * Actualiza un destino existente
   */
  async actualizarDestino(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar ID del parámetro
      const paramValidation = DestinoIdParamSchema.safeParse(req.params);

      if (!paramValidation.success) {
        throw new ValidationError(
          paramValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { id: destinoId } = paramValidation.data;

      // Validar body
      const bodyValidation = ActualizarDestinoBodySchema.safeParse(req.body);

      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre } = bodyValidation.data;

      // Obtener usuario y scopes del middleware de auth
      const auth = res.locals.auth as {
        userId: string;
        scopes: string[];
      };

      // Llamar al service
      await catalogosService.actualizarDestino(
        destinoId,
        auth.userId,
        nombre,
        auth.scopes
      );

      // Respuesta exitosa
      res.status(200).json({
        ok: true,
        data: {
          actualizado: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/catalogos/destinos/:id
   * Elimina un destino (soft delete)
   */
  async eliminarDestino(req: Request, res: Response, next: NextFunction) {
    try {
      // Validar ID del parámetro
      const paramValidation = DestinoIdParamSchema.safeParse(req.params);

      if (!paramValidation.success) {
        throw new ValidationError(
          paramValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { id: destinoId } = paramValidation.data;

      // Obtener usuario y scopes del middleware de auth
      const auth = res.locals.auth as {
        userId: string;
        scopes: string[];
      };

      // Llamar al service
      await catalogosService.eliminarDestino(
        destinoId,
        auth.userId,
        auth.scopes
      );

      // Respuesta exitosa
      res.status(200).json({
        ok: true,
        data: {
          eliminado: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Exportar instancia singleton
export const catalogosController = new CatalogosController();