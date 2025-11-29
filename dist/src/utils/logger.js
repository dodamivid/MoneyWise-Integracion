"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const level = process.env.LOG_LEVEL || "info";
const logger = (0, pino_1.default)({
    level,
    base: undefined,
});
exports.default = logger;
