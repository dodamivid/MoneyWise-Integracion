"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingresosController = void 0;
const zod_1 = require("zod");
const ingresos_service_1 = require("../services/ingresos.service");
class IngresosController {
    async listar(req, res, next) {
        try {
            const auth = res.locals.auth;
            const { ingresos, total, pagina, tamanoPagina } = await ingresos_service_1.ingresosService.listar(req.query, auth);
            return res.status(200).json({
                ok: true,
                data: ingresos,
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
                        mensaje: "Parametros de consulta invalidos",
                        detalles: error.issues,
                    },
                });
            }
            const message = error.message || "Error";
            if (message.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: message,
                    },
                });
            }
            next(error);
        }
    }
    async crear(req, res, next) {
        try {
            const auth = res.locals.auth;
            const ingresoId = await ingresos_service_1.ingresosService.crear(req.body, auth);
            return res.status(201).json({
                ok: true,
                data: { ingresoId },
            });
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Datos del ingreso invalidos",
                        detalles: error.issues,
                    },
                });
            }
            const message = error.message || "Error";
            if (message.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("FK_INEXISTENTE")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "FK_INEXISTENTE",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: message,
                    },
                });
            }
            next(error);
        }
    }
    async obtener(req, res, next) {
        try {
            const auth = res.locals.auth;
            const ingresoId = parseInt(req.params.id, 10);
            if (isNaN(ingresoId)) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID de ingreso invalido",
                    },
                });
            }
            const ingreso = await ingresos_service_1.ingresosService.obtener(ingresoId, auth);
            return res.status(200).json({
                ok: true,
                data: ingreso,
            });
        }
        catch (error) {
            const message = error.message || "Error";
            if (message.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        codigo: "NO_ENCONTRADO",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: message,
                    },
                });
            }
            next(error);
        }
    }
    async actualizar(req, res, next) {
        try {
            const auth = res.locals.auth;
            const ingresoId = parseInt(req.params.id, 10);
            if (isNaN(ingresoId)) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID de ingreso invalido",
                    },
                });
            }
            const actualizado = await ingresos_service_1.ingresosService.actualizar(ingresoId, req.body, auth);
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
                        mensaje: "Datos de actualizacion invalidos",
                        detalles: error.issues,
                    },
                });
            }
            const message = error.message || "Error";
            if (message.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("FK_INEXISTENTE")) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "FK_INEXISTENTE",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        codigo: "NO_ENCONTRADO",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: message,
                    },
                });
            }
            next(error);
        }
    }
    async eliminar(req, res, next) {
        try {
            const auth = res.locals.auth;
            const ingresoId = parseInt(req.params.id, 10);
            if (isNaN(ingresoId)) {
                return res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID de ingreso invalido",
                    },
                });
            }
            const eliminado = await ingresos_service_1.ingresosService.eliminar(ingresoId, auth);
            return res.status(200).json({
                ok: true,
                data: { eliminado },
            });
        }
        catch (error) {
            const message = error.message || "Error";
            if (message.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json({
                    ok: false,
                    error: {
                        codigo: "NO_ENCONTRADO",
                        mensaje: message,
                    },
                });
            }
            if (message.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: message,
                    },
                });
            }
            next(error);
        }
    }
}
exports.ingresosController = new IngresosController();
