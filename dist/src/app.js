"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yaml_1 = __importDefault(require("yaml"));
const health_1 = __importDefault(require("./routes/health"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const egresos_routes_1 = __importDefault(require("./routes/egresos.routes"));
const ingresos_routes_1 = __importDefault(require("./routes/ingresos.routes"));
const inversiones_routes_1 = __importDefault(require("./routes/inversiones.routes"));
const metas_routes_1 = __importDefault(require("./routes/metas.routes"));
const version_routes_1 = __importDefault(require("./routes/version.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const catalogos_routes_1 = __importDefault(require("./routes/catalogos.routes"));
const catalogosProcedencia_routes_1 = __importDefault(require("./routes/catalogosProcedencia.routes"));
const tiposEgreso_routes_1 = __importDefault(require("./routes/tiposEgreso.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const db_1 = require("./config/db");
const tiposIngreso_routes_1 = __importDefault(require("./routes/tiposIngreso.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const api_key_middleware_1 = require("./middlewares/api-key.middleware");
const correlationId_middleware_1 = require("./middlewares/correlationId.middleware");
const logger_middleware_1 = __importDefault(require("./middlewares/logger.middleware"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
// Boot the Express application
const app = (0, express_1.default)();
// Middleware de traceId - DEBE ir primero para rastrear todas las requests
app.use(error_middleware_1.traceIdMiddleware);
// Observabilidad antes de parsear body
app.use(correlationId_middleware_1.correlationIdMiddleware);
app.use(logger_middleware_1.default);
// Helpful defaults for security and JSON payload parsing
app.disable("x-powered-by");
app.use(express_1.default.json());
app.use(error_middleware_1.requestLogger);
// Require x-api-key para todas las rutas bajo /api (placeholder)
app.use("/api", api_key_middleware_1.requireApiKey);
// Inicializa la conexión a BD si está habilitada
if (db_1.db.enabled) {
    db_1.db.init().catch((e) => console.error("DB init error:", e.message));
}
// Simple root banner to confirm the API is reachable
app.get("/", (_req, res) => {
    res.json({ message: "MoneyWise API" });
});
// Swagger UI (dev/build): leer docs/api/openapi.yaml desde la raíz del proyecto
try {
    const candidates = [
        process.env.OPENAPI_PATH,
        path_1.default.join(process.cwd(), "docs", "api", "openapi.yaml"),
        path_1.default.join(process.cwd(), "docs", "api", "openapi.yml"),
    ].filter((p) => !!p);
    const apiSpecPath = candidates.find((p) => fs_1.default.existsSync(p));
    if (apiSpecPath) {
        const file = fs_1.default.readFileSync(apiSpecPath, "utf8");
        const spec = yaml_1.default.parse(file);
        app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec));
        console.log(`Swagger UI disponible en /docs (spec: ${apiSpecPath})`);
    }
    else {
        console.warn("Swagger UI no disponible: no se encontró docs/api/openapi.yaml en la raíz del proyecto");
    }
}
catch (e) {
    console.warn("Swagger UI no disponible:", e?.message || String(e));
}
// Health check routes mounted under /health
app.use("/health", health_1.default);
// User routes mounted under /api/users
app.use("/api/users", users_routes_1.default);
// Egresos routes mounted under /api/v1/egresos
app.use("/api/v1/egresos", egresos_routes_1.default);
// Ingresos routes mounted under /api/v1/ingresos
app.use("/api/v1/ingresos", ingresos_routes_1.default);
// Inversiones routes mounted under /api/v1/inversiones
app.use("/api/v1/inversiones", inversiones_routes_1.default);
// Metas routes mounted under /api/v1/metas
app.use("/api/v1/metas", metas_routes_1.default);
// Version routes mounted under /api/v1/version
app.use("/api/v1/version", version_routes_1.default);
// Dashboard routes mounted under /api/v1/dashboard
app.use("/api/v1/dashboard", dashboard_routes_1.default);
// Catálogos routes mounted under /api/v1/catalogos
app.use("/api/v1/catalogos", catalogos_routes_1.default);
app.use("/api/v1/catalogos", catalogosProcedencia_routes_1.default);
app.use("/api/v1/catalogos", tiposEgreso_routes_1.default);
// Tipos de ingreso (catálogo)
app.use("/api/v1/tipos-ingreso", tiposIngreso_routes_1.default);
// Auth routes
app.use("/api/v1/auth", auth_routes_1.default);
// Ruta de prueba de error handler (solo en entorno de test)
if (process.env.NODE_ENV === "test") {
    app.use("/api/v1/test", test_routes_1.default);
}
// Manejador de rutas no encontradas (404) - DEBE ir después de todas las rutas
app.use(error_middleware_1.notFoundHandler);
// Manejador centralizado de errores - DEBE ir al final
app.use(error_middleware_1.errorHandler);
exports.default = app;
