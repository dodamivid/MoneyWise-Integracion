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
 * validarScopes - middleware factory
 * acepta requiredScopes: string[]
 * normaliza req.headers['x-scopes'] que puede ser string | string[] | undefined
 */
export const validarScopes = (requiredScopes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const raw = req.headers["x-scopes"];

    // Normalizar a array de strings
    let scopes: string[] = [];
    if (Array.isArray(raw)) {
      // raw puede ser ['a,b', 'c'] o ['a','b']
      scopes = raw.flatMap((r) =>
        String(r)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else if (typeof raw === "string") {
      scopes = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      scopes = [];
    }

    const hasAll = requiredScopes.every((s) => scopes.includes(s));
    if (!hasAll) {
      return res.status(403).json({ ok: false, message: "Insufficient scopes" });
    }

    // attach normalized scopes for downstream use if needed
    (req as any).scopes = scopes;
    next();
  };
};

export default validarScopes;
