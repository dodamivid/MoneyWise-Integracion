"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//logger.middleware.ts
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
// Detecta entorno de Jest (CI y pruebas locales)
const isJest = process.env.JEST_WORKER_ID !== undefined;
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || "info",
    // En JEST / CI → NO usar transport (pino-pretty truena)
    ...(isJest
        ? {}
        : {
            transport: {
                target: "pino-pretty",
                options: { colorize: true },
            },
        }),
});
const httpLogger = (0, pino_http_1.default)({
    logger,
    customProps: (req, res) => ({
        correlationId: req.correlationId,
    }),
});
exports.default = httpLogger;
