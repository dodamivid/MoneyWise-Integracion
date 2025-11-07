import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";

class DashboardController {
  async getResumen(req: Request, res: Response, next: NextFunction) {
    try {
      const { desde, hasta, usuarioId } = req.query as Record<string, string>;
      const auth = (res.locals.auth || { userId: "demo-user", scopes: ["dashboard:leer"] }) as {
        userId: string;
        scopes: string[];
      };

      const data = await dashboardService.resumen(
        { desde, hasta, usuarioId },
        auth
      );

      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      // Para mantener consistencia con el app.ts actual, devolvemos 422 en validación y 500 en otros casos
      if (error?.name === 'ZodError') {
        return res.status(422).json({ status: "error", message: "DATOS_INVALIDOS: parámetros requeridos o formato", statusCode: 422 });
      }
      const msg = (error as Error).message || "Error";
      if (msg.startsWith("DATOS_INVALIDOS")) {
        return res.status(422).json({ status: "error", message: msg, statusCode: 422 });
      }
      if (msg.startsWith("PERMISO_DENEGADO")) {
        return res.status(403).json({ status: "error", message: msg, statusCode: 403 });
      }
      next(error);
    }
  }

  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { fechaCorte, usuarioId } = req.query as Record<string, string>;
      const auth = (res.locals.auth || { userId: "demo-user", scopes: ["dashboard:leer"] }) as {
        userId: string;
        scopes: string[];
      };

      const data = await dashboardService.balance({ fechaCorte, usuarioId }, auth);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return res.status(422).json({ status: "error", message: "DATOS_INVALIDOS: parámetros requeridos o formato", statusCode: 422 });
      }
      const msg = (error as Error).message || "Error";
      if (msg.includes("Fecha") || msg.includes("formato") || msg.startsWith("DATOS_INVALIDOS")) {
        return res.status(422).json({ status: "error", message: msg, statusCode: 422 });
      }
      if (msg.startsWith("PERMISO_DENEGADO")) {
        return res.status(403).json({ status: "error", message: msg, statusCode: 403 });
      }
      next(error);
    }
  }

  async getMetasVsAhorro(req: Request, res: Response, next: NextFunction) {
    try {
      const { desde, hasta, usuarioId } = req.query as Record<string, string>;
      const auth = (res.locals.auth || { userId: "demo-user", scopes: ["dashboard:leer"] }) as {
        userId: string;
        scopes: string[];
      };

      const data = await dashboardService.metas({ desde, hasta, usuarioId }, auth);
      res.status(200).json({ ok: true, data });
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return res.status(422).json({ status: "error", message: "DATOS_INVALIDOS: parámetros requeridos o formato", statusCode: 422 });
      }
      const msg = (error as Error).message || "Error";
      if (msg.startsWith("DATOS_INVALIDOS")) {
        return res.status(422).json({ status: "error", message: msg, statusCode: 422 });
      }
      if (msg.startsWith("PERMISO_DENEGADO")) {
        return res.status(403).json({ status: "error", message: msg, statusCode: 403 });
      }
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
