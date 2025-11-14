import { Request, Response, NextFunction } from "express";
import { catalogosService } from "../services/catalogos.service";
import {
  ListarDestinosQuerySchema,
  CrearDestinoBodySchema,
  ActualizarDestinoBodySchema,
  DestinoIdParamSchema,
  ListarFrecuenciasQuerySchema,
  CrearFrecuenciaBodySchema,
  ActualizarFrecuenciaBodySchema,
  FrecuenciaIdParamSchema,
} from "../dtos/catalogos.dto";
import { ValidationError } from "../utils/errors";

/**
 * @fileoverview Controller para endpoints de catálogos (Destinos y Frecuencias)
 */

export class CatalogosController {
  // ============================================
  // DESTINOS
  // ============================================

  async listarDestinos(req: Request, res: Response, next: NextFunction) {
    try {
      const queryValidation = ListarDestinosQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        throw new ValidationError(
          queryValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { buscar, pagina, tamanoPagina, orden } = queryValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      const { destinos, total } = await catalogosService.listarDestinos(
        auth.userId,
        buscar,
        pagina,
        tamanoPagina,
        orden,
        auth.scopes
      );

      res.status(200).json({
        ok: true,
        data: destinos,
        meta: { paginacion: { pagina, tamanoPagina, total } },
      });
    } catch (error) {
      next(error);
    }
  }

  async crearDestino(req: Request, res: Response, next: NextFunction) {
    try {
      const bodyValidation = CrearDestinoBodySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre } = bodyValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      const resultado = await catalogosService.crearDestino(auth.userId, nombre);

      res.status(201).json({ ok: true, data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async actualizarDestino(req: Request, res: Response, next: NextFunction) {
    try {
      const paramValidation = DestinoIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          paramValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { id: destinoId } = paramValidation.data;

      const bodyValidation = ActualizarDestinoBodySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre } = bodyValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      await catalogosService.actualizarDestino(
        destinoId,
        auth.userId,
        nombre,
        auth.scopes
      );

      res.status(200).json({ ok: true, data: { actualizado: true } });
    } catch (error) {
      next(error);
    }
  }

  async eliminarDestino(req: Request, res: Response, next: NextFunction) {
    try {
      const paramValidation = DestinoIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          paramValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { id: destinoId } = paramValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      await catalogosService.eliminarDestino(destinoId, auth.userId, auth.scopes);

      res.status(200).json({ ok: true, data: { eliminado: true } });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // FRECUENCIAS
  // ============================================

  async listarFrecuencias(req: Request, res: Response, next: NextFunction) {
    try {
      const queryValidation = ListarFrecuenciasQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        throw new ValidationError(
          queryValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { buscar, pagina, tamanoPagina, orden } = queryValidation.data;

      const { frecuencias, total } = await catalogosService.listarFrecuencias(
        buscar,
        pagina,
        tamanoPagina,
        orden
      );

      res.status(200).json({
        ok: true,
        data: frecuencias,
        meta: { paginacion: { pagina, tamanoPagina, total } },
      });
    } catch (error) {
      next(error);
    }
  }

  async crearFrecuencia(req: Request, res: Response, next: NextFunction) {
    try {
      const bodyValidation = CrearFrecuenciaBodySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre } = bodyValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      // Verificar scope admin
      if (!auth.scopes.includes("admin:catalogos")) {
        return res.status(403).json({
          ok: false,
          error: {
            codigo: "PERMISO_DENEGADO",
            mensaje: "Se requiere scope admin:catalogos",
          },
        });
      }

      const resultado = await catalogosService.crearFrecuencia(nombre);

      res.status(201).json({ ok: true, data: resultado });
    } catch (error) {
      next(error);
    }
  }

  async actualizarFrecuencia(req: Request, res: Response, next: NextFunction) {
    try {
      const paramValidation = FrecuenciaIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          paramValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { id: frecuenciaId } = paramValidation.data;

      const bodyValidation = ActualizarFrecuenciaBodySchema.safeParse(req.body);
      if (!bodyValidation.success) {
        throw new ValidationError(
          bodyValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { nombre } = bodyValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      // Verificar scope admin
      if (!auth.scopes.includes("admin:catalogos")) {
        return res.status(403).json({
          ok: false,
          error: {
            codigo: "PERMISO_DENEGADO",
            mensaje: "Se requiere scope admin:catalogos",
          },
        });
      }

      await catalogosService.actualizarFrecuencia(frecuenciaId, nombre);

      res.status(200).json({ ok: true, data: { actualizado: true } });
    } catch (error) {
      next(error);
    }
  }

  async eliminarFrecuencia(req: Request, res: Response, next: NextFunction) {
    try {
      const paramValidation = FrecuenciaIdParamSchema.safeParse(req.params);
      if (!paramValidation.success) {
        throw new ValidationError(
          paramValidation.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
        );
      }

      const { id: frecuenciaId } = paramValidation.data;
      const auth = res.locals.auth as { userId: string; scopes: string[] };

      // Verificar scope admin
      if (!auth.scopes.includes("admin:catalogos")) {
        return res.status(403).json({
          ok: false,
          error: {
            codigo: "PERMISO_DENEGADO",
            mensaje: "Se requiere scope admin:catalogos",
          },
        });
      }

      await catalogosService.eliminarFrecuencia(frecuenciaId);

      res.status(200).json({ ok: true, data: { eliminado: true } });
    } catch (error) {
      next(error);
    }
  }
}

export const catalogosController = new CatalogosController();