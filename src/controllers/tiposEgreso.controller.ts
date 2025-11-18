import { Request, Response, NextFunction } from "express";
import { TiposEgresoService } from "../services/tiposEgreso.service";
import {
  ListarTiposEgresoQuerySchema,
  CrearTipoEgresoBodySchema,
  ActualizarTipoEgresoBodySchema,
  TipoEgresoIdParamSchema,
} from "../dtos/tiposEgreso.dto";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

/**
 * @fileoverview Controller para endpoints de Tipos de Egreso
 * Issue #21 - Maneja requests HTTP y validaciones con Zod
 */

// ============================================
// INTERFAZ DE REQUEST AUTENTICADO
// ============================================

/**
 * Interfaz extendida de Request con datos de autenticación
 * Asume que el middleware de auth ya agregó estos datos
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    usuarioId: string;
    scopes: string[];
    esAdmin?: boolean;
  };
}

// ============================================
// CONTROLLER
// ============================================

export class TiposEgresoController {
  constructor(private readonly service: TiposEgresoService) {}

  /**
   * GET /api/v1/catalogos/tipos-egreso
   * Listar tipos de egreso con paginación
   */
  listarTiposEgreso = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Verificar autenticación
      if (!req.user?.usuarioId) {
        throw new UnauthorizedError("Usuario no autenticado");
      }

      // Verificar scope
      if (!req.user.scopes.includes("catalogos:leer")) {
        throw new ForbiddenError("No tienes permiso para leer catálogos");
      }

      // Validar query params con Zod
      const validatedQuery = ListarTiposEgresoQuerySchema.parse(req.query);

      // Llamar al servicio
      const resultado = await this.service.listarTiposEgreso(
        req.user.usuarioId,
        validatedQuery.buscar,
        validatedQuery.pagina,
        validatedQuery.tamanoPagina,
        validatedQuery.orden
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/catalogos/tipos-egreso
   * Crear nuevo tipo de egreso
   */
  crearTipoEgreso = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.usuarioId) {
        throw new UnauthorizedError("Usuario no autenticado");
      }

      if (!req.user.scopes.includes("catalogos:escribir")) {
        throw new ForbiddenError("No tienes permiso para crear catálogos");
      }

      // Validar body con Zod
      const validatedBody = CrearTipoEgresoBodySchema.parse(req.body);

      // Llamar al servicio
      const resultado = await this.service.crearTipoEgreso(
        req.user.usuarioId,
        validatedBody.nombre
      );

      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/v1/catalogos/tipos-egreso/:id
   * Actualizar tipo de egreso existente
   */
  actualizarTipoEgreso = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.usuarioId) {
        throw new UnauthorizedError("Usuario no autenticado");
      }

      if (!req.user.scopes.includes("catalogos:escribir")) {
        throw new ForbiddenError("No tienes permiso para actualizar catálogos");
      }

      // Validar parámetro ID con Zod
      const validatedParams = TipoEgresoIdParamSchema.parse(req.params);

      // Validar body con Zod
      const validatedBody = ActualizarTipoEgresoBodySchema.parse(req.body);

      // Llamar al servicio
      const resultado = await this.service.actualizarTipoEgreso(
        validatedParams.id,
        req.user.usuarioId,
        validatedBody.nombre
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/v1/catalogos/tipos-egreso/:id
   * Eliminar tipo de egreso (soft delete)
   */
  eliminarTipoEgreso = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.usuarioId) {
        throw new UnauthorizedError("Usuario no autenticado");
      }

      if (!req.user.scopes.includes("catalogos:escribir")) {
        throw new ForbiddenError("No tienes permiso para eliminar catálogos");
      }

      // Validar parámetro ID con Zod
      const validatedParams = TipoEgresoIdParamSchema.parse(req.params);

      // Llamar al servicio
      const resultado = await this.service.eliminarTipoEgreso(
        validatedParams.id,
        req.user.usuarioId
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}