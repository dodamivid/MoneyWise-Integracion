import { Request, Response, NextFunction } from "express";

/**
 * Middleware de autenticación simulado para entorno de integración.
 * - Lee encabezados opcionales:
 *   - x-mw-user: ID de usuario
 *   - x-mw-scopes: scopes separados por comas (p.ej. "egresos:leer,egresos:escribir")
 * - Coloca el contexto en res.locals.auth
 */
export function mockAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.header("x-mw-user") || "demo-user").trim();
  // En tests dejamos vacío para permitir validar 403; en otros entornos damos scopes básicos por defecto
  const defaultScopes =
    process.env.MOCK_DEFAULT_SCOPES ??
    (process.env.NODE_ENV === "test"
      ? ""
      : "egresos:leer,egresos:escribir,admin:egresos");
  const scopeHeader = req.header("x-mw-scopes") || defaultScopes;
  const scopes = scopeHeader
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!req.header("x-mw-scopes")) {
    [
      "inversiones:leer",
      "inversiones:escribir",
      "admin:inversiones",
    ].forEach((scope) => {
      if (!scopes.includes(scope)) {
        scopes.push(scope);
      }
    });
  }

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
    const auth = res.locals.auth as
      | { userId: string; scopes: string[] }
      | undefined;
    const hasScope = auth?.scopes?.includes(scope);

    if (!hasScope) {
      return res.status(403).json({
        ok: false,
        error: {
          codigo: "PERMISO_DENEGADO",
          mensaje: `Falta scope requerido: ${scope}`,
        },
      });
    }

    next();
  };
}

const INVERSIONES_METHOD_SCOPE: Record<string, string> = {
  GET: "inversiones:leer",
  POST: "inversiones:escribir",
  PATCH: "inversiones:escribir",
  PUT: "inversiones:escribir",
  DELETE: "inversiones:escribir",
};

export function requireInversionesScopeByMethod() {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = res.locals.auth as
      | { userId: string; scopes: string[] }
      | undefined;
    const requiredScope = INVERSIONES_METHOD_SCOPE[req.method.toUpperCase()];

    if (!requiredScope) {
      return next();
    }

    if (!auth || !auth.scopes?.includes(requiredScope)) {
      return res.status(403).json({
        ok: false,
        error: {
          codigo: "PERMISO_DENEGADO",
          mensaje: `Falta scope requerido: ${requiredScope}`,
        },
      });
    }

    next();
  };
}
