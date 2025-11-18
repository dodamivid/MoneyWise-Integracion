"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionController = void 0;
const version_service_1 = require("../services/version.service");
/**
 * Controlador que maneja la ruta /api/v1/version
 */
exports.versionController = {
    getVersion: (_req, res) => {
        try {
            const data = (0, version_service_1.getVersionInfo)();
            res.status(200).json({ ok: true, data });
        }
        catch (error) {
            console.error("Error al obtener la versión:", error);
            res.status(500).json({
                ok: false,
                error: {
                    codigo: "SERVER_ERROR",
                    mensaje: "Error interno al obtener la versión del backend"
                }
            });
        }
    }
};
