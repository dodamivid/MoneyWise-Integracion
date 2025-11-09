import { Request, Response, NextFunction } from "express";


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

  res.locals.auth = {
    userId,
    scopes,
  } as {
    userId: string;
    scopes: string[];
  };

  next();
}


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
