// NUEVO ARCHIVO: src/middlewares/correlationId.middleware.ts
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headerId = req.header("X-Correlation-Id");
  const correlationId = headerId || randomUUID();

  (req as any).correlationId = correlationId;
  res.locals.correlationId = correlationId;

  res.setHeader("X-Correlation-Id", correlationId);
  next();
};
