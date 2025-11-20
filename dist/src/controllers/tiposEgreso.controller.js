"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiposEgresoController = exports.TiposEgresoController = void 0;
const tiposEgreso_service_1 = require("../services/tiposEgreso.service");
const tiposEgreso_dto_1 = require("../dtos/tiposEgreso.dto");
class TiposEgresoController {
    constructor(service) {
        this.service = service;
        this.listarTiposEgreso = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const validated = tiposEgreso_dto_1.ListarTiposEgresoQuerySchema.safeParse(req.query);
                if (!validated.success) {
                    res.status(422).json({
                        ok: false,
                        error: {
                            codigo: "DATOS_INVALIDOS",
                            mensaje: validated.error.issues.map((i) => i.message).join(", "),
                        },
                    });
                    return;
                }
                const { buscar, pagina, tamanoPagina, orden } = validated.data;
                const resultado = await this.service.listarTiposEgreso(auth.userId, buscar, pagina, tamanoPagina, orden);
                res.status(200).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
        this.crearTipoEgreso = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const validated = tiposEgreso_dto_1.CrearTipoEgresoBodySchema.safeParse(req.body);
                if (!validated.success) {
                    res.status(422).json({
                        ok: false,
                        error: {
                            codigo: "DATOS_INVALIDOS",
                            mensaje: validated.error.issues.map((i) => i.message).join(", "),
                        },
                    });
                    return;
                }
                const resultado = await this.service.crearTipoEgreso(auth.userId, validated.data.nombre);
                res.status(201).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
        this.actualizarTipoEgreso = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const params = tiposEgreso_dto_1.TipoEgresoIdParamSchema.safeParse(req.params);
                const body = tiposEgreso_dto_1.ActualizarTipoEgresoBodySchema.safeParse(req.body);
                if (!params.success || !body.success) {
                    const issues = [
                        ...(params.success ? [] : params.error.issues),
                        ...(body.success ? [] : body.error.issues),
                    ];
                    res.status(422).json({
                        ok: false,
                        error: {
                            codigo: "DATOS_INVALIDOS",
                            mensaje: issues.map((i) => i.message).join(", "),
                        },
                    });
                    return;
                }
                const resultado = await this.service.actualizarTipoEgreso(params.data.id, auth.userId, body.data.nombre);
                res.status(200).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
        this.eliminarTipoEgreso = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const params = tiposEgreso_dto_1.TipoEgresoIdParamSchema.safeParse(req.params);
                if (!params.success) {
                    res.status(422).json({
                        ok: false,
                        error: {
                            codigo: "DATOS_INVALIDOS",
                            mensaje: params.error.issues.map((i) => i.message).join(", "),
                        },
                    });
                    return;
                }
                const resultado = await this.service.eliminarTipoEgreso(params.data.id, auth.userId);
                res.status(200).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.TiposEgresoController = TiposEgresoController;
exports.tiposEgresoController = new TiposEgresoController(new tiposEgreso_service_1.TiposEgresoService());
