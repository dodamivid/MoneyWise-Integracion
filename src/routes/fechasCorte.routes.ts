import { Router } from "express";
import { fechasCorteController } from "../controllers/fechasCorte.controller";

const router = Router();

router.get("/", (req, res, next) => fechasCorteController.listar(req, res, next));
router.post("/", (req, res, next) => fechasCorteController.crear(req, res, next));
router.delete("/:id", (req, res, next) => fechasCorteController.eliminar(req, res, next));

export default router;
