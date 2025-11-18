// src/routes/inversiones.routes.ts
import { Router } from "express";
import { inversionesController } from "../controllers/inversiones.controller";
import {
  mockAuth,
  requireInversionesScopeByMethod,
} from "../middlewares/auth.middleware";

const router = Router();

router.use(mockAuth);
router.use(requireInversionesScopeByMethod());

router.get("/", inversionesController.getAll);
router.get("/:id", inversionesController.getById);
router.post("/", inversionesController.create);
router.patch("/:id", inversionesController.update);
router.delete("/:id", inversionesController.remove);

export default router;
