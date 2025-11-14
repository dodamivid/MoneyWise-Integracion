"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Lightweight liveness probe that the integration ticket expects
router.get("/", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
exports.default = router;
