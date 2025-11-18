import { NextFunction, Request, Response } from "express";
import { createErrorResponse } from "../dtos/user.dto";

const API_KEY_HEADER = "x-api-key";

function getExpectedApiKey(): string | undefined {
  return (
    process.env.MW_API_KEY?.trim() ||
    process.env.MONEYWISE_API_KEY?.trim() ||
    process.env.API_KEY?.trim()
  );
}

export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const providedKey = req.header(API_KEY_HEADER)?.trim();

  if (!providedKey) {
    return res.status(401).json(
      createErrorResponse("Missing x-api-key header", 401, {
        traceId: req.traceId ?? "unknown",
      })
    );
  }

  const expectedKey = getExpectedApiKey();

  if (expectedKey && providedKey !== expectedKey) {
    return res.status(401).json(
      createErrorResponse("Invalid x-api-key", 401, {
        traceId: req.traceId ?? "unknown",
      })
    );
  }

  const currentAuth =
    (res.locals.auth as Record<string, unknown> | undefined) ?? {};

  res.locals.auth = {
    ...currentAuth,
    apiKey: providedKey,
  };

  next();
}
