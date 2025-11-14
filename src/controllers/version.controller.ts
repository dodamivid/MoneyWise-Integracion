import { Request, Response } from "express";
import { getVersionInfo } from "../services/version.service";

/**
 * Controlador que maneja la ruta /api/v1/version
 */
export const versionController = {
  getVersion: (_req: Request, res: Response) => {
    try {
      const data = getVersionInfo();
      res.status(200).json({ ok: true, data });
    } catch (error) {
      console.error("Error al obtener la versión:", error);
      res.status(500).json({
        ok: false,
        error: {
          codigo: "SERVER_ERROR",
          mensaje: "Error interno al obtener la versión del backend"
        }
      });
    }
  }
};
