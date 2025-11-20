"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/boom", (_req, _res) => {
    throw new Error("Test Boom Error");
});
exports.default = router;
