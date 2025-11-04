import { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({
      status: "error",
      message: "Falta la clave de API en los encabezados (x-api-key)",
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      status: "error",
      message: "Clave de API inválida",
    });
  }

  next(); // Si pasa las validaciones, continúa con la siguiente función
}
