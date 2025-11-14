"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.egresosController = void 0;
const egresos_service_1 = require("../services/egresos.service");
const zod_1 = require("zod");
class EgresosController {
    /**
     * GET /api/v1/egresos - Lista egresos con filtros
     */
    async listar(req, res, next) {
        try {
            const auth = res.locals.auth;
            const { egresos, total } = await egresos_service_1.egresosService.listar(req.query, auth);
            const pagina = parseInt(req.query.pagina || "1", 10);
            const tamanoPagina = parseInt(req.query.tamanoPagina || "20", 10);
            return res.status(200).json({
                ok: true,
                data: egresos,
                meta: {
                    paginacion: {
                        pagina,
                        tamanoPagina,
                        total,
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Parámetros de consulta inválidos",
                        detalles: error.issues,
                    },
                });
            }
            const msg = error.message || "Error";
            if (msg.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: msg,
                    },
                });
            }
            next(error);
        }
    }
    /**
     * POST /api/v1/egresos - Crea un nuevo egreso
     */
    async crear(req, res, next) {
        try {
            const auth = res.locals.auth;
            const egresoId = await egresos_service_1.egresosService.crear(req.body, auth);
            return res.status(201).json({
                ok: true,
                data: { egresoId },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Datos del egreso inválidos",
                        detalles: error.issues,
                    },
                });
            }
            const msg = error.message || "Error";
            if (msg.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("FK_INEXISTENTE")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "FK_INEXISTENTE",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: msg,
                    },
                });
            }
            next(error);
        }
    }
    /**
     * GET /api/v1/egresos/:id - Obtiene un egreso por ID
     */
    async obtener(req, res, next) {
        try {
            const auth = res.locals.auth;
            const egresoId = parseInt(req.params.id, 10);
            if (isNaN(egresoId)) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID de egreso inválido",
                    },
                });
            }
            const egreso = await egresos_service_1.egresosService.obtener(egresoId, auth);
            return res.status(200).json({
                ok: true,
                data: egreso,
            });
        }
        catch (error) {
            const msg = error.message || "Error";
            if (msg.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        codigo: "NO_ENCONTRADO",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: msg,
                    },
                });
            }
            next(error);
        }
    }
    /**
     * PATCH /api/v1/egresos/:id - Actualiza un egreso
     */
    async actualizar(req, res, next) {
        try {
            const auth = res.locals.auth;
            const egresoId = parseInt(req.params.id, 10);
            if (isNaN(egresoId)) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID de egreso inválido",
                    },
                });
            }
            const actualizado = await egresos_service_1.egresosService.actualizar(egresoId, req.body, auth);
            return res.status(200).json({
                ok: true,
                data: { actualizado },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Datos de actualización inválidos",
                        detalles: error.issues,
                    },
                });
            }
            const msg = error.message || "Error";
            if (msg.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("FK_INEXISTENTE")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "FK_INEXISTENTE",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        codigo: "NO_ENCONTRADO",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: msg,
                    },
                });
            }
            next(error);
        }
    }
    /**
     * DELETE /api/v1/egresos/:id - Elimina un egreso
     */
    async eliminar(req, res, next) {
        try {
            const auth = res.locals.auth;
            const egresoId = parseInt(req.params.id, 10);
            if (isNaN(egresoId)) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID de egreso inválido",
                    },
                });
            }
            const eliminado = await egresos_service_1.egresosService.eliminar(egresoId, auth);
            return res.status(200).json({
                ok: true,
                data: { eliminado },
            });
        }
        catch (error) {
            const msg = error.message || "Error";
            if (msg.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        codigo: "NO_ENCONTRADO",
                        mensaje: msg,
                    },
                });
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: msg,
                    },
                });
            }
            next(error);
        }
    }
}
exports.egresosController = new EgresosController();
