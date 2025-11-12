"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const version_controller_1 = require("../controllers/version.controller");
const router = (0, express_1.Router)();
// GET /api/v1/version
router.get("/", version_controller_1.versionController.getVersion);
exports.default = router;
