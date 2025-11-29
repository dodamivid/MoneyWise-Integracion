"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correlationIdMiddleware = void 0;
const crypto_1 = require("crypto");
const correlationIdMiddleware = (req, res, next) => {
    const headerId = req.header("X-Correlation-Id");
    const correlationId = headerId || (0, crypto_1.randomUUID)();
    req.correlationId = correlationId;
    res.locals.correlationId = correlationId;
    res.setHeader("X-Correlation-Id", correlationId);
    next();
};
exports.correlationIdMiddleware = correlationIdMiddleware;
