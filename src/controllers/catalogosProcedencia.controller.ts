/**
 * Controller para Catálogos - Procedencias de Ingreso
 * Maneja las peticiones HTTP y respuestas
 * Fecha: 2025-10-31
 * Archivo: src/controllers/catalogosProcedencia.controller.ts
 */

import { Request, Response, NextFunction } from 'express';
import { CatalogosProcedenciaService } from '../services/catalogosProcedencia.service';

/**
 * Controller para gestionar los endpoints de Procedencias
 */
export class CatalogosProcedenciaController {
  private service: CatalogosProcedenciaService;

  constructor() {
    this.service = new CatalogosProcedenciaService();
  }

  /**
   * GET /api/v1/catalogos/procedencias
   * Lista todas las procedencias del usuario con filtros y paginación
   */
  listarProcedencias = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Obtener usuario del JWT (viene del middleware de autenticación)
      const usuarioId = (req as any).usuario?.usuarioId || (req as any).usuario?.id;

      if (!usuarioId) {
        res.status(401).json({
          ok: false,
          error: {
            codigo: 'NO_AUTORIZADO',
            mensaje: 'Token de autenticación requerido',
          },
        });
        return;
      }

      // Validar scopes (permisos)
      const scopes = (req as any).usuario?.scopes || [];
      const tienePermiso =
        scopes.includes('catalogos:leer') || scopes.includes('admin:catalogos');

      if (!tienePermiso) {
        res.status(403).json({
          ok: false,
          error: {
            codigo: 'PERMISO_DENEGADO',
            mensaje: 'No tienes permisos para leer catálogos',
          },
        });
        return;
      }

      // Obtener query params
      const { buscar, pagina, tamanoPagina, orden } = req.query;

      // Llamar al service
      const resultado = await this.service.listarProcedencias(
        usuarioId,
        buscar as string,
        pagina ? parseInt(pagina as string) : undefined,
        tamanoPagina ? parseInt(tamanoPagina as string) : undefined,
        orden as string
      );

      res.status(200).json(resultado);
    } catch (error: any) {
      // Manejo de errores con status code
      if (error.status) {
        res.status(error.status).json({
          ok: false,
          error: {
            codigo: error.codigo,
            mensaje: error.mensaje,
          },
        });
        return;
      }
      // Pasar al middleware de manejo de errores global
      next(error);
    }
  };

  /**
   * POST /api/v1/catalogos/procedencias
   * Crea una nueva procedencia
   */
  crearProcedencia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = (req as any).usuario?.usuarioId || (req as any).usuario?.id;

      if (!usuarioId) {
        res.status(401).json({
          ok: false,
          error: {
            codigo: 'NO_AUTORIZADO',
            mensaje: 'Token de autenticación requerido',
          },
        });
        return;
      }

      // Validar scopes
      const scopes = (req as any).usuario?.scopes || [];
      const tienePermiso =
        scopes.includes('catalogos:escribir') ||
        scopes.includes('admin:catalogos');

      if (!tienePermiso) {
        res.status(403).json({
          ok: false,
          error: {
            codigo: 'PERMISO_DENEGADO',
            mensaje: 'No tienes permisos para crear catálogos',
          },
        });
        return;
      }

      // Validar body
      const { nombre } = req.body;

      if (!nombre) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'El campo nombre es requerido',
          },
        });
        return;
      }

      // Llamar al service
      const resultado = await this.service.crearProcedencia(usuarioId, nombre);

      res.status(201).json(resultado);
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json({
          ok: false,
          error: {
            codigo: error.codigo,
            mensaje: error.mensaje,
          },
        });
        return;
      }
      next(error);
    }
  };

  /**
   * PUT /api/v1/catalogos/procedencias/:id
   * Actualiza una procedencia existente
   */
  actualizarProcedencia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = (req as any).usuario?.usuarioId || (req as any).usuario?.id;

      if (!usuarioId) {
        res.status(401).json({
          ok: false,
          error: {
            codigo: 'NO_AUTORIZADO',
            mensaje: 'Token de autenticación requerido',
          },
        });
        return;
      }

      // Validar scopes
      const scopes = (req as any).usuario?.scopes || [];
      const esAdmin = scopes.includes('admin:catalogos');
      const tienePermiso = scopes.includes('catalogos:escribir') || esAdmin;

      if (!tienePermiso) {
        res.status(403).json({
          ok: false,
          error: {
            codigo: 'PERMISO_DENEGADO',
            mensaje: 'No tienes permisos para actualizar catálogos',
          },
        });
        return;
      }

      // Validar params y body
      const procedenciaId = parseInt(req.params.id);
      const { nombre } = req.body;

      if (isNaN(procedenciaId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'ID de procedencia inválido',
          },
        });
        return;
      }

      if (!nombre) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'El campo nombre es requerido',
          },
        });
        return;
      }

      // Llamar al service
      const resultado = await this.service.actualizarProcedencia(
        procedenciaId,
        usuarioId,
        nombre,
        esAdmin
      );

      res.status(200).json(resultado);
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json({
          ok: false,
          error: {
            codigo: error.codigo,
            mensaje: error.mensaje,
          },
        });
        return;
      }
      next(error);
    }
  };

  /**
   * DELETE /api/v1/catalogos/procedencias/:id
   * Elimina una procedencia (soft delete)
   */
  eliminarProcedencia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuarioId = (req as any).usuario?.usuarioId || (req as any).usuario?.id;

      if (!usuarioId) {
        res.status(401).json({
          ok: false,
          error: {
            codigo: 'NO_AUTORIZADO',
            mensaje: 'Token de autenticación requerido',
          },
        });
        return;
      }

      // Validar scopes
      const scopes = (req as any).usuario?.scopes || [];
      const esAdmin = scopes.includes('admin:catalogos');
      const tienePermiso = scopes.includes('catalogos:escribir') || esAdmin;

      if (!tienePermiso) {
        res.status(403).json({
          ok: false,
          error: {
            codigo: 'PERMISO_DENEGADO',
            mensaje: 'No tienes permisos para eliminar catálogos',
          },
        });
        return;
      }

      // Validar params
      const procedenciaId = parseInt(req.params.id);

      if (isNaN(procedenciaId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'ID de procedencia inválido',
          },
        });
        return;
      }

      // Llamar al service
      const resultado = await this.service.eliminarProcedencia(
        procedenciaId,
        usuarioId,
        esAdmin
      );

      res.status(200).json(resultado);
    } catch (error: any) {
      if (error.status) {
        res.status(error.status).json({
          ok: false,
          error: {
            codigo: error.codigo,
            mensaje: error.mensaje,
          },
        });
        return;
      }
      next(error);
    }
  };
}