import { Router } from "express";
import { versionController } from "../controllers/version.controller";

const router = Router();

// GET /api/v1/version
router.get("/", versionController.getVersion);

export default router;
