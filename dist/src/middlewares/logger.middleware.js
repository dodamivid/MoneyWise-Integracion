"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//logger.middleware.ts
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
// Detecta entorno para decidir transporte
const isJest = process.env.JEST_WORKER_ID !== undefined;
const isProd = (process.env.NODE_ENV || "").toLowerCase() === "production";
const enablePretty = !isProd && !isJest;
const logger = (0, pino_1.default)(enablePretty
    ? {
        level: process.env.LOG_LEVEL || "info",
        transport: {
            // Solo en local/dev; en Render (prod) evitamos pino-pretty
            target: "pino-pretty",
            options: { colorize: true },
        },
    }
    : {
        level: process.env.LOG_LEVEL || "info",
    });
const httpLogger = (0, pino_http_1.default)({
    logger,
    customProps: (req, res) => ({
        correlationId: req.correlationId,
    }),
});
exports.default = httpLogger;
