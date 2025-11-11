import { Request, Response, NextFunction } from "express";

/**
 * Middleware simulado para validar un token JWT.
 * En un caso real, aquí se debería verificar el token con jsonwebtoken.
 */
export const validarJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 🔸 Si no hay token, rechaza la solicitud
  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      message: "Token JWT requerido (simulado)",
    });
  }

  // 🔸 Aquí podrías decodificar el token y agregar info al request
  // req.user = { id: 1, scopes: ["catalogos:leer", "catalogos:escribir"] };

  next();
};

/**
 * Middleware simulado para validar los scopes (permisos)
 */
export const validarScopes = (scopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 🔸 En un caso real, los scopes vienen del JWT decodificado
    const userScopes = (req.headers["x-scopes"] as string)?.split(",") || [];

    const autorizado = scopes.every((scope) => userScopes.includes(scope));

    if (!autorizado) {
      return res.status(403).json({
        ok: false,
        message: "Permiso denegado (simulado)",
      });
    }

    next();
  };
};
