import { Request, Response, NextFunction } from "express";
import { fechasCorteService, ContextAuth } from "../services/fechasCorte.service";
import { crearListarResponse } from "../dtos/fechasCorte.dto";

// Nota: En ausencia de autenticación real, se simula extracción de usuarioId y scopes
function buildContext(req: Request): ContextAuth {
  // En un futuro: decodificar JWT. Por ahora se permite header X-Usuario-Id y X-Scopes
  const usuarioIdHeader = req.header("X-Usuario-Id");
  const scopesHeader = req.header("X-Scopes");
  const usuarioIdToken = usuarioIdHeader ? Number(usuarioIdHeader) : 1; // default 1
  const scopes = scopesHeader ? scopesHeader.split(" ") : [];
  const esAdminAhorro = scopes.includes("admin:ahorro");
  return { usuarioIdToken, scopes, esAdminAhorro };
}

export class FechasCorteController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = buildContext(req);
      const { rows, meta } = await fechasCorteService.listar(req.query as any, ctx);
      res.status(200).json(
        crearListarResponse(rows, meta.paginacion.pagina, meta.paginacion.tamanoPagina, meta.paginacion.total)
      );
    } catch (e) {
      next(e);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = buildContext(req);
      const data = await fechasCorteService.crear(req.body, ctx);
      res.status(201).json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const ctx = buildContext(req);
      const data = await fechasCorteService.eliminar(req.params.id, ctx);
      res.status(200).json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  }
}

export const fechasCorteController = new FechasCorteController();
