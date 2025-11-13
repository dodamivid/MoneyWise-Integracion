import { Request, Response } from "express";
import { getVersionInfo } from "../services/version.service";
import { logger } from "../config/logger";

/**
 * Controlador que maneja la ruta /api/v1/version
 */
export const versionController = {
  getVersion: (_req: Request, res: Response) => {
    try {
      const data = getVersionInfo();
      res.status(200).json({ ok: true, data });
    } catch (error) {
      logger.error({ err: error }, "Error al obtener la version");
      res.status(500).json({
        ok: false,
        error: {
          codigo: "SERVER_ERROR",
          mensaje: "Error interno al obtener la version del backend",
        },
      });
    }
  },
};
