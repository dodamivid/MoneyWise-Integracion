"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersionInfo = void 0;
const package_json_1 = __importDefault(require("../../package.json"));
/**
 * Obtiene la información de versión del backend
 */
const getVersionInfo = () => {
    return {
        version: process.env.API_VERSION || package_json_1.default.version,
        build: process.env.BUILD_ID || "local",
        environment: process.env.NODE_ENV || "development",
        fecha: new Date().toISOString()
    };
};
exports.getVersionInfo = getVersionInfo;
