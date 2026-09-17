import { Request, Response, NextFunction } from "express";
import { TiposIngresoService } from "../services/tiposIngreso.service";
import {
  ListarTiposIngresoQuerySchema,
  CrearTipoIngresoBodySchema,
  ActualizarTipoIngresoBodySchema,
  TipoIngresoIdParamSchema,
} from "../dtos/tiposIngreso.dto";

/**
 * @fileoverview Controller para Tipos de Ingreso.
 * Issue #77: rediseñado siguiendo el patrón de tiposEgreso.controller.ts
 * (mismo formato de respuesta, mismos códigos de error, auth vía
 * mockAuth/requireScope en las rutas).
 */
export class TiposIngresoController {
  constructor(private readonly service: TiposIngresoService) {}

  listarTiposIngreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const validated = ListarTiposIngresoQuerySchema.safeParse(req.query);
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

      const { buscar, pagina, tamanoPagina, orden } = validated.data;
      const resultado = await this.service.listarTiposIngreso(
        auth.userId,
        buscar,
        pagina,
        tamanoPagina,
        orden
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  crearTipoIngreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const validated = CrearTipoIngresoBodySchema.safeParse(req.body);
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

      const resultado = await this.service.crearTipoIngreso(
        auth.userId,
        validated.data.nombre
      );
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  actualizarTipoIngreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = TipoIngresoIdParamSchema.safeParse(req.params);
      const body = ActualizarTipoIngresoBodySchema.safeParse(req.body);

      if (!params.success || !body.success) {
        const issues = [
          ...(params.success ? [] : params.error.issues),
          ...(body.success ? [] : body.error.issues),
        ];
        res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: issues.map((i) => i.message).join(", "),
          },
        });
        return;
      }

      const resultado = await this.service.actualizarTipoIngreso(
        params.data.id,
        auth.userId,
        body.data.nombre
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  eliminarTipoIngreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = TipoIngresoIdParamSchema.safeParse(req.params);
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

      const resultado = await this.service.eliminarTipoIngreso(
        params.data.id,
        auth.userId
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const tiposIngresoController = new TiposIngresoController(
  new TiposIngresoService()
);
