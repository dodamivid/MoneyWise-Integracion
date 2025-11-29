"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catalogosController = exports.CatalogosController = void 0;
const catalogos_service_1 = require("../services/catalogos.service");
const catalogos_dto_1 = require("../dtos/catalogos.dto");
const errors_1 = require("../utils/errors");
/**
 * @fileoverview Controller para endpoints de catálogos (Destinos y Frecuencias)
 */
class CatalogosController {
    // ============================================
    // DESTINOS
    // ============================================
    async listarDestinos(req, res, next) {
        try {
            const queryValidation = catalogos_dto_1.ListarDestinosQuerySchema.safeParse(req.query);
            if (!queryValidation.success) {
                throw new errors_1.ValidationError(queryValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { buscar, pagina, tamanoPagina, orden } = queryValidation.data;
            const auth = res.locals.auth;
            const { destinos, total } = await catalogos_service_1.catalogosService.listarDestinos(auth.userId, buscar, pagina, tamanoPagina, orden, auth.scopes);
            res.status(200).json({
                ok: true,
                data: destinos,
                meta: { paginacion: { pagina, tamanoPagina, total } },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async crearDestino(req, res, next) {
        try {
            const bodyValidation = catalogos_dto_1.CrearDestinoBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { nombre } = bodyValidation.data;
            const auth = res.locals.auth;
            const resultado = await catalogos_service_1.catalogosService.crearDestino(auth.userId, nombre);
            res.status(201).json({ ok: true, data: resultado });
        }
        catch (error) {
            next(error);
        }
    }
    async actualizarDestino(req, res, next) {
        try {
            const paramValidation = catalogos_dto_1.DestinoIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                throw new errors_1.ValidationError(paramValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { id: destinoId } = paramValidation.data;
            const bodyValidation = catalogos_dto_1.ActualizarDestinoBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { nombre } = bodyValidation.data;
            const auth = res.locals.auth;
            await catalogos_service_1.catalogosService.actualizarDestino(destinoId, auth.userId, nombre, auth.scopes);
            res.status(200).json({ ok: true, data: { actualizado: true } });
        }
        catch (error) {
            next(error);
        }
    }
    async eliminarDestino(req, res, next) {
        try {
            const paramValidation = catalogos_dto_1.DestinoIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                throw new errors_1.ValidationError(paramValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { id: destinoId } = paramValidation.data;
            const auth = res.locals.auth;
            await catalogos_service_1.catalogosService.eliminarDestino(destinoId, auth.userId, auth.scopes);
            res.status(200).json({ ok: true, data: { eliminado: true } });
        }
        catch (error) {
            next(error);
        }
    }
    // ============================================
    // FRECUENCIAS
    // ============================================
    async listarFrecuencias(req, res, next) {
        try {
            const queryValidation = catalogos_dto_1.ListarFrecuenciasQuerySchema.safeParse(req.query);
            if (!queryValidation.success) {
                throw new errors_1.ValidationError(queryValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { buscar, pagina, tamanoPagina, orden } = queryValidation.data;
            const { frecuencias, total } = await catalogos_service_1.catalogosService.listarFrecuencias(buscar, pagina, tamanoPagina, orden);
            res.status(200).json({
                ok: true,
                data: frecuencias,
                meta: { paginacion: { pagina, tamanoPagina, total } },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async crearFrecuencia(req, res, next) {
        try {
            const bodyValidation = catalogos_dto_1.CrearFrecuenciaBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { nombre } = bodyValidation.data;
            const auth = res.locals.auth;
            // Verificar scope admin
            if (!auth.scopes.includes("admin:catalogos")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: "Se requiere scope admin:catalogos",
                    },
                });
            }
            const resultado = await catalogos_service_1.catalogosService.crearFrecuencia(nombre);
            res.status(201).json({ ok: true, data: resultado });
        }
        catch (error) {
            next(error);
        }
    }
    async actualizarFrecuencia(req, res, next) {
        try {
            const paramValidation = catalogos_dto_1.FrecuenciaIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                throw new errors_1.ValidationError(paramValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { id: frecuenciaId } = paramValidation.data;
            const bodyValidation = catalogos_dto_1.ActualizarFrecuenciaBodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new errors_1.ValidationError(bodyValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { nombre } = bodyValidation.data;
            const auth = res.locals.auth;
            // Verificar scope admin
            if (!auth.scopes.includes("admin:catalogos")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: "Se requiere scope admin:catalogos",
                    },
                });
            }
            await catalogos_service_1.catalogosService.actualizarFrecuencia(frecuenciaId, nombre);
            res.status(200).json({ ok: true, data: { actualizado: true } });
        }
        catch (error) {
            next(error);
        }
    }
    async eliminarFrecuencia(req, res, next) {
        try {
            const paramValidation = catalogos_dto_1.FrecuenciaIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                throw new errors_1.ValidationError(paramValidation.error.issues
                    .map((e) => `${e.path.join(".")}: ${e.message}`)
                    .join(", "));
            }
            const { id: frecuenciaId } = paramValidation.data;
            const auth = res.locals.auth;
            // Verificar scope admin
            if (!auth.scopes.includes("admin:catalogos")) {
                return res.status(403).json({
                    ok: false,
                    error: {
                        codigo: "PERMISO_DENEGADO",
                        mensaje: "Se requiere scope admin:catalogos",
                    },
                });
            }
            await catalogos_service_1.catalogosService.eliminarFrecuencia(frecuenciaId);
            res.status(200).json({ ok: true, data: { eliminado: true } });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CatalogosController = CatalogosController;
exports.catalogosController = new CatalogosController();
