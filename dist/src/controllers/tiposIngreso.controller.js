"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiposIngresoController = exports.TiposIngresoController = void 0;
const tiposIngreso_service_1 = require("../services/tiposIngreso.service");
const tiposIngreso_dto_1 = require("../dtos/tiposIngreso.dto");
class TiposIngresoController {
    constructor() {
        this.listar = async (req, res) => {
            const parsed = tiposIngreso_dto_1.ListarTiposIngresoSchema.safeParse(req.query);
            if (!parsed.success) {
                res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Datos de entrada invalidos",
                        detalles: parsed.error.issues.map((i) => i.message),
                    },
                });
                return;
            }
            try {
                const { pagina, tamanoPagina, orden, activo } = parsed.data;
                const resultado = await this.service.listar(pagina, tamanoPagina, orden, activo);
                res.status(200).json({
                    ok: true,
                    ...resultado,
                });
            }
            catch (error) {
                this.manejarError(error, res);
            }
        };
        this.obtenerPorId = async (req, res) => {
            const tipoIngresoId = Number(req.params.id);
            if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
                res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID invalido",
                    },
                });
                return;
            }
            try {
                const tipoIngreso = await this.service.obtenerPorId(tipoIngresoId);
                res.status(200).json({
                    ok: true,
                    data: tipoIngreso,
                });
            }
            catch (error) {
                this.manejarError(error, res);
            }
        };
        this.crear = async (req, res) => {
            const parsed = tiposIngreso_dto_1.CrearTipoIngresoSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Datos de entrada invalidos",
                        detalles: parsed.error.issues.map((i) => i.message),
                    },
                });
                return;
            }
            try {
                const { nombre, descripcion, activo } = parsed.data;
                const resultado = await this.service.crear(nombre, descripcion, activo);
                res.status(201).json({ ok: true, data: resultado });
            }
            catch (error) {
                this.manejarError(error, res);
            }
        };
        this.actualizar = async (req, res) => {
            const tipoIngresoId = Number(req.params.id);
            if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
                res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID invalido",
                    },
                });
                return;
            }
            const parsed = tiposIngreso_dto_1.ActualizarTipoIngresoSchema.safeParse(req.body);
            if (!parsed.success) {
                res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "Datos de entrada invalidos",
                        detalles: parsed.error.issues.map((i) => i.message),
                    },
                });
                return;
            }
            try {
                const { nombre, descripcion, activo } = parsed.data;
                const resultado = await this.service.actualizar(tipoIngresoId, nombre, descripcion, activo);
                res.status(200).json({ ok: true, data: resultado });
            }
            catch (error) {
                this.manejarError(error, res);
            }
        };
        this.eliminar = async (req, res) => {
            const tipoIngresoId = Number(req.params.id);
            if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
                res.status(422).json({
                    ok: false,
                    error: {
                        codigo: "DATOS_INVALIDOS",
                        mensaje: "ID invalido",
                    },
                });
                return;
            }
            try {
                const resultado = await this.service.eliminar(tipoIngresoId);
                res.status(200).json({ ok: true, data: resultado });
            }
            catch (error) {
                this.manejarError(error, res);
            }
        };
        this.service = new tiposIngreso_service_1.TiposIngresoService();
    }
    manejarError(error, res) {
        if (error instanceof Error && error.message === "NO_ENCONTRADO") {
            res.status(404).json({
                ok: false,
                error: {
                    codigo: "NO_ENCONTRADO",
                    mensaje: "Recurso no encontrado",
                },
            });
            return;
        }
        if (error instanceof Error && error.message.startsWith("DATOS_INVALIDOS")) {
            res.status(400).json({
                ok: false,
                error: {
                    codigo: "DATOS_INVALIDOS",
                    mensaje: error.message,
                },
            });
            return;
        }
        res.status(500).json({
            ok: false,
            error: {
                codigo: "ERROR_INTERNO",
                mensaje: "Ocurrio un error inesperado",
            },
        });
    }
}
exports.TiposIngresoController = TiposIngresoController;
exports.tiposIngresoController = new TiposIngresoController();
