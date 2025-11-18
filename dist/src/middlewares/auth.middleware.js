"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockAuth = mockAuth;
exports.requireScope = requireScope;
/**
 * Middleware de autenticación simulado para entorno de integración.
 * - Lee encabezados opcionales:
 *   - x-mw-user: ID de usuario
 *   - x-mw-scopes: scopes separados por comas (p.ej. "egresos:leer,egresos:escribir")
 * - Coloca el contexto en res.locals.auth
 */
function mockAuth(req, res, next) {
    const userId = (req.header("x-mw-user") || "demo-user").trim();
    // En tests dejamos vacío para permitir validar 403; en otros entornos damos scopes básicos por defecto
    const defaultScopes = process.env.MOCK_DEFAULT_SCOPES ??
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
    };
    next();
}
/**
 * Middleware de autorización por scope.
 * - Verifica que res.locals.auth.scopes incluya el scope requerido.
 * - Si no está presente, retorna 403.
 */
function requireScope(scope) {
    return (req, res, next) => {
        const auth = res.locals.auth;
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
