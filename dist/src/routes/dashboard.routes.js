"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
// Autenticación simulada; en producción se reemplaza por middleware real JWT
router.use(auth_middleware_1.mockAuth);
// GET /api/v1/dashboard/resumen
router.get("/resumen", (0, auth_middleware_1.requireScope)("dashboard:leer"), dashboard_controller_1.dashboardController.resumen);
// GET /api/v1/dashboard/balance
router.get("/balance", (0, auth_middleware_1.requireScope)("dashboard:leer"), dashboard_controller_1.dashboardController.balance);
// GET /api/v1/dashboard/metas-vs-ahorro
router.get("/metas-vs-ahorro", (0, auth_middleware_1.requireScope)("dashboard:leer"), dashboard_controller_1.dashboardController.metasVsAhorro);
exports.default = router;
