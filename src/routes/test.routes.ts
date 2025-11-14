import { Router } from "express";

const router = Router();

router.get("/boom", (_req, _res) => {
  throw new Error("Forced error for tests");
});

export default router;
