import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

// Lightweight liveness probe that the integration ticket expects
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

export default router;
