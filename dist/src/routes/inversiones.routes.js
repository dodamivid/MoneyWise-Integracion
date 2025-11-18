"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/inversiones.routes.ts
const express_1 = require("express");
const inversiones_controller_1 = require("../controllers/inversiones.controller");
const router = (0, express_1.Router)();
router.get("/", inversiones_controller_1.inversionesController.getAll);
router.get("/:id", inversiones_controller_1.inversionesController.getById);
router.post("/", inversiones_controller_1.inversionesController.create);
router.patch("/:id", inversiones_controller_1.inversionesController.update);
router.delete("/:id", inversiones_controller_1.inversionesController.remove);
exports.default = router;
