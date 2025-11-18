import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { dashboardService } from "../services/dashboard.service";
import {
  ResumenQuerySchema,
  BalanceQuerySchema,
  MetasQuerySchema,
} from "../dtos/dashboard.dto";
import { createErrorResponse } from "../dtos/user.dto";

export const dashboardController = {
  async resumen(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = ResumenQuerySchema.parse(req.query);
      const data = await dashboardService.resumen(params, auth);
      return res.status(200).json({ status: "success", data });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res
          .status(422)
          .json(createErrorResponse("Parámetros inválidos", 422, { detalles: err.issues }));
      }
      const msg = err?.message || "Error";
      if (msg.startsWith("DATOS_INVALIDOS")) {
        return res.status(422).json(createErrorResponse(msg, 422));
      }
      if (msg.startsWith("PERMISO_DENEGADO")) {
        return res.status(403).json(createErrorResponse(msg, 403));
      }
      next(err);
    }
  },

  async balance(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = BalanceQuerySchema.parse(req.query);
      const data = await dashboardService.balance(params, auth);
      return res.status(200).json({ status: "success", data });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res
          .status(422)
          .json(createErrorResponse("Parámetros inválidos", 422, { detalles: err.issues }));
      }
      const msg = err?.message || "Error";
      if (msg.startsWith("DATOS_INVALIDOS")) {
        return res.status(422).json(createErrorResponse(msg, 422));
      }
      if (msg.startsWith("NO_ENCONTRADO")) {
        return res.status(404).json(createErrorResponse(msg, 404));
      }
      if (msg.startsWith("PERMISO_DENEGADO")) {
        return res.status(403).json(createErrorResponse(msg, 403));
      }
      next(err);
    }
  },

  async metasVsAhorro(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = res.locals.auth as { userId: string; scopes: string[] };
      const params = MetasQuerySchema.parse(req.query);
      const data = await dashboardService.metas(params, auth);
      return res.status(200).json({ status: "success", data });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return res
          .status(422)
          .json(createErrorResponse("Parámetros inválidos", 422, { detalles: err.issues }));
      }
      const msg = err?.message || "Error";
      if (msg.startsWith("DATOS_INVALIDOS")) {
        return res.status(422).json(createErrorResponse(msg, 422));
      }
      if (msg.startsWith("PERMISO_DENEGADO")) {
        return res.status(403).json(createErrorResponse(msg, 403));
      }
      next(err);
    }
  },
};
