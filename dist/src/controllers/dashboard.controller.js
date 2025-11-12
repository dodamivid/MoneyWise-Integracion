"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const zod_1 = require("zod");
const dashboard_service_1 = require("../services/dashboard.service");
const dashboard_dto_1 = require("../dtos/dashboard.dto");
const user_dto_1 = require("../dtos/user.dto");
exports.dashboardController = {
    async resumen(req, res, next) {
        try {
            const auth = res.locals.auth;
            const params = dashboard_dto_1.ResumenQuerySchema.parse(req.query);
            const data = await dashboard_service_1.dashboardService.resumen(params, auth);
            return res.status(200).json({ status: "success", data });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                return res
                    .status(422)
                    .json((0, user_dto_1.createErrorResponse)("Parámetros inválidos", 422, { detalles: err.issues }));
            }
            const msg = err?.message || "Error";
            if (msg.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json((0, user_dto_1.createErrorResponse)(msg, 422));
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json((0, user_dto_1.createErrorResponse)(msg, 403));
            }
            next(err);
        }
    },
    async balance(req, res, next) {
        try {
            const auth = res.locals.auth;
            const params = dashboard_dto_1.BalanceQuerySchema.parse(req.query);
            const data = await dashboard_service_1.dashboardService.balance(params, auth);
            return res.status(200).json({ status: "success", data });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                return res
                    .status(422)
                    .json((0, user_dto_1.createErrorResponse)("Parámetros inválidos", 422, { detalles: err.issues }));
            }
            const msg = err?.message || "Error";
            if (msg.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json((0, user_dto_1.createErrorResponse)(msg, 422));
            }
            if (msg.startsWith("NO_ENCONTRADO")) {
                return res.status(404).json((0, user_dto_1.createErrorResponse)(msg, 404));
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json((0, user_dto_1.createErrorResponse)(msg, 403));
            }
            next(err);
        }
    },
    async metasVsAhorro(req, res, next) {
        try {
            const auth = res.locals.auth;
            const params = dashboard_dto_1.MetasQuerySchema.parse(req.query);
            const data = await dashboard_service_1.dashboardService.metas(params, auth);
            return res.status(200).json({ status: "success", data });
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                return res
                    .status(422)
                    .json((0, user_dto_1.createErrorResponse)("Parámetros inválidos", 422, { detalles: err.issues }));
            }
            const msg = err?.message || "Error";
            if (msg.startsWith("DATOS_INVALIDOS")) {
                return res.status(422).json((0, user_dto_1.createErrorResponse)(msg, 422));
            }
            if (msg.startsWith("PERMISO_DENEGADO")) {
                return res.status(403).json((0, user_dto_1.createErrorResponse)(msg, 403));
            }
            next(err);
        }
    },
};
