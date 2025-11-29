import { Request, Response, NextFunction } from "express";
import { TiposEgresoService } from "../services/tiposEgreso.service";
import {
  ListarTiposEgresoQuerySchema,
  CrearTipoEgresoBodySchema,
  ActualizarTipoEgresoBodySchema,
  TipoEgresoIdParamSchema,
} from "../dtos/tiposEgreso.dto";

export class TiposEgresoController {
  constructor(private readonly service: TiposEgresoService) {}

  listarTiposEgreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const validated = ListarTiposEgresoQuerySchema.safeParse(req.query);
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
      const resultado = await this.service.listarTiposEgreso(
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

  crearTipoEgreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const validated = CrearTipoEgresoBodySchema.safeParse(req.body);
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

      const resultado = await this.service.crearTipoEgreso(
        auth.userId,
        validated.data.nombre
      );
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  actualizarTipoEgreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = TipoEgresoIdParamSchema.safeParse(req.params);
      const body = ActualizarTipoEgresoBodySchema.safeParse(req.body);

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

      const resultado = await this.service.actualizarTipoEgreso(
        params.data.id,
        auth.userId,
        body.data.nombre
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  eliminarTipoEgreso = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = TipoEgresoIdParamSchema.safeParse(req.params);
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

      const resultado = await this.service.eliminarTipoEgreso(
        params.data.id,
        auth.userId
      );
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const tiposEgresoController = new TiposEgresoController(
  new TiposEgresoService()
);
