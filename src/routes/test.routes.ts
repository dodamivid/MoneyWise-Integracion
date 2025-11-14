import { Router } from "express";

const router = Router();

router.get("/boom", (_req, _res) => {
  throw new Error("Test Boom Error");
});

export default router;
