import { NextFunction, Request, Response } from "express";
import { CatalogosProcedenciaService } from "../services/catalogosProcedencia.service";
import {
  ActualizarProcedenciaBodySchema,
  CrearProcedenciaBodySchema,
  ListarProcedenciasQuerySchema,
  ProcedenciaIdParamSchema,
} from "../dtos/catalogosProcedencia.dto";

type AuthContext = { userId: string; scopes: string[] };

export class CatalogosProcedenciaController {
  constructor(private readonly service = new CatalogosProcedenciaService()) {}

  listarProcedencias = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const auth = res.locals.auth as AuthContext;
      const validated = ListarProcedenciasQuerySchema.safeParse(req.query);

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
      const resultado = await this.service.listarProcedencias(
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

  crearProcedencia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const auth = res.locals.auth as AuthContext;
      const validated = CrearProcedenciaBodySchema.safeParse(req.body);

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

      const resultado = await this.service.crearProcedencia(
        auth.userId,
        validated.data.nombre
      );

      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  actualizarProcedencia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const auth = res.locals.auth as AuthContext;
      const params = ProcedenciaIdParamSchema.safeParse(req.params);
      const body = ActualizarProcedenciaBodySchema.safeParse(req.body);

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

      const esAdmin = auth.scopes?.includes("admin:catalogos") ?? false;
      const resultado = await this.service.actualizarProcedencia(
        params.data.id,
        auth.userId,
        body.data.nombre,
        esAdmin
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  eliminarProcedencia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const auth = res.locals.auth as AuthContext;
      const params = ProcedenciaIdParamSchema.safeParse(req.params);

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

      const esAdmin = auth.scopes?.includes("admin:catalogos") ?? false;
      const resultado = await this.service.eliminarProcedencia(
        params.data.id,
        auth.userId,
        esAdmin
      );

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };
}

export const catalogosProcedenciaController =
  new CatalogosProcedenciaController();
