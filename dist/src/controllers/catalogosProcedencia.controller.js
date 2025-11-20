"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogosProcedenciaController = exports.CatalogosProcedenciaController = void 0;
const catalogosProcedencia_service_1 = require("../services/catalogosProcedencia.service");
const catalogosProcedencia_dto_1 = require("../dtos/catalogosProcedencia.dto");
class CatalogosProcedenciaController {
    constructor(service = new catalogosProcedencia_service_1.CatalogosProcedenciaService()) {
        this.service = service;
        this.listarProcedencias = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const validated = catalogosProcedencia_dto_1.ListarProcedenciasQuerySchema.safeParse(req.query);
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
                const resultado = await this.service.listarProcedencias(auth.userId, buscar, pagina, tamanoPagina, orden);
                res.status(200).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
        this.crearProcedencia = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const validated = catalogosProcedencia_dto_1.CrearProcedenciaBodySchema.safeParse(req.body);
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
                const resultado = await this.service.crearProcedencia(auth.userId, validated.data.nombre);
                res.status(201).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
        this.actualizarProcedencia = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const params = catalogosProcedencia_dto_1.ProcedenciaIdParamSchema.safeParse(req.params);
                const body = catalogosProcedencia_dto_1.ActualizarProcedenciaBodySchema.safeParse(req.body);
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
                const esAdmin = auth.scopes?.includes("admin:catalogos") ?? false;
                const resultado = await this.service.actualizarProcedencia(params.data.id, auth.userId, body.data.nombre, esAdmin);
                res.status(200).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
        this.eliminarProcedencia = async (req, res, next) => {
            try {
                const auth = res.locals.auth;
                const params = catalogosProcedencia_dto_1.ProcedenciaIdParamSchema.safeParse(req.params);
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
                const esAdmin = auth.scopes?.includes("admin:catalogos") ?? false;
                const resultado = await this.service.eliminarProcedencia(params.data.id, auth.userId, esAdmin);
                res.status(200).json(resultado);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.CatalogosProcedenciaController = CatalogosProcedenciaController;
exports.catalogosProcedenciaController = new CatalogosProcedenciaController();
