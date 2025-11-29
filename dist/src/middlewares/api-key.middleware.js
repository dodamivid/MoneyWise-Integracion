"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApiKey = requireApiKey;
const user_dto_1 = require("../dtos/user.dto");
const API_KEY_HEADER = "x-api-key";
function getExpectedApiKey() {
    return (process.env.MW_API_KEY?.trim() ||
        process.env.MONEYWISE_API_KEY?.trim() ||
        process.env.API_KEY?.trim());
}
function requireApiKey(req, res, next) {
    const providedKey = req.header(API_KEY_HEADER)?.trim();
    if (!providedKey) {
        return res.status(401).json((0, user_dto_1.createErrorResponse)("Missing x-api-key header", 401, {
            traceId: req.traceId ?? "unknown",
        }));
    }
    const expectedKey = getExpectedApiKey();
    if (expectedKey && providedKey !== expectedKey) {
        return res.status(401).json((0, user_dto_1.createErrorResponse)("Invalid x-api-key", 401, {
            traceId: req.traceId ?? "unknown",
        }));
    }
    const currentAuth = res.locals.auth ?? {};
    res.locals.auth = {
        ...currentAuth,
        apiKey: providedKey,
    };
    next();
}
