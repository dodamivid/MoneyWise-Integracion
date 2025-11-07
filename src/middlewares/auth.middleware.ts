import { Request, Response, NextFunction } from "express";

/**
 * Middleware de autenticación simulado para entorno de integración.
 * - Lee encabezados opcionales:
 *   - x-mw-user: ID de usuario
 *   - x-mw-scopes: scopes separados por comas (p.ej. "dashboard:leer,admin:dashboard")
 * - Coloca el contexto en res.locals.auth
 */
export function mockAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.header("x-mw-user") || "demo-user").trim();
  // En tests dejamos vacío para permitir validar 403; en otros entornos damos dashboard:leer por defecto
  const defaultScopes =
    process.env.MOCK_DEFAULT_SCOPES ?? (process.env.NODE_ENV === "test" ? "" : "dashboard:leer,admin:dashboard");
  const scopeHeader = req.header("x-mw-scopes") || defaultScopes;
  const scopes = scopeHeader
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  res.locals.auth = {
    userId,
    scopes,
  } as {
    userId: string;
    scopes: string[];
  };

  next();
}

/**
 * Middleware de autorización por scope.
 * - Verifica que res.locals.auth.scopes incluya el scope requerido.
 * - Si no está presente, retorna 403.
 */
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = res.locals.auth as { userId: string; scopes: string[] } | undefined;
    const hasScope = auth?.scopes?.includes(scope);

    if (!hasScope) {
      return res.status(403).json({
        status: "error",
        message: "PERMISO_DENEGADO: falta scope requerido",
        statusCode: 403,
      });
    }

    next();
  };
}
