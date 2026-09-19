import { Request, Response, NextFunction } from "express";
import { fechasCorteService } from "../services/fechasCorte.service";
import {
  ListarFechasCorteQuerySchema,
  CrearFechaCorteBodySchema,
  FechaCorteIdParamSchema,
} from "../dtos/fechasCorte.dto";

/**
 * @fileoverview Controller para Fechas de Corte de Ahorro (issue #91).
 * `usuarioId` se toma del contexto de auth (`res.locals.auth`, igual que
 * ingresos/egresos/inversiones), no del body ni de query — la spec original
 * (tickets/API_fechas_corte.md) solo permite operar sobre terceros con un
 * scope admin, y este módulo no expone ese escape hatch por ahora: siempre
 * opera sobre el usuario autenticado.
 */
export class FechasCorteController {
  listar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const usuarioId = parseInt(auth.userId, 10);
      if (isNaN(usuarioId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "userId del token debe ser numerico",
          },
        });
        return;
      }

      const validated = ListarFechasCorteQuerySchema.safeParse(req.query);
      if (!validated.success) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: validated.error.issues.map((i) => i.message).join(", "),
          },
        });
        return;
      }

      const { pagina, tamanoPagina, orden } = validated.data;
      const resultado = await fechasCorteService.listar(
        usuarioId,
        pagina,
        tamanoPagina,
        orden
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  crear = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const usuarioId = parseInt(auth.userId, 10);
      if (isNaN(usuarioId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "userId del token debe ser numerico",
          },
        });
        return;
      }

      const validated = CrearFechaCorteBodySchema.safeParse(req.body);
      if (!validated.success) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: validated.error.issues.map((i) => i.message).join(", "),
          },
        });
        return;
      }

      const resultado = await fechasCorteService.crear(
        usuarioId,
        validated.data.fechaCorte
      );
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  eliminar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const usuarioId = parseInt(auth.userId, 10);
      if (isNaN(usuarioId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "userId del token debe ser numerico",
          },
        });
        return;
      }

      const params = FechaCorteIdParamSchema.safeParse(req.params);
      if (!params.success) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: params.error.issues.map((i) => i.message).join(", "),
          },
        });
        return;
      }

      const resultado = await fechasCorteService.eliminar(
        params.data.id,
        usuarioId
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const fechasCorteController = new FechasCorteController();
