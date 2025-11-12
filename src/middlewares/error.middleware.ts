/**
 * @fileoverview Middleware de manejo de errores y registro para la API de Money Wise.
 * 
 * Este módulo centraliza el manejo de errores, registro de peticiones
 * y control de rutas inexistentes. Mejora la trazabilidad con correlationId
 * y usa el logger global de Pino configurado en utils/logger.ts.
 * 
 * @module middlewares/error.middleware
 * @category Middlewares
 * 
 * @example
 * import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
 * app.use(notFoundHandler);
 * app.use(errorHandler);
 */

import { Request, Response, NextFunction } from "express";
import { isAppError, AppError } from "../utils/errors";
import { createErrorResponse } from "../dtos/user.dto";
import logger from "../utils/logger";

/**
 * Middleware centralizado de manejo de errores.
 * 
 * Captura errores de controladores o middlewares, los clasifica,
 * registra y devuelve una respuesta JSON uniforme al cliente.
 * 
 * Flujo de manejo:
 * 1. Si el error es AppError → usa su código y mensaje.
 * 2. Si es error de validación (Zod) → devuelve 400 con detalle.
 * 3. Si es error inesperado → devuelve 500 con mensaje genérico.
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.headers["x-correlation-id"];

  // Registrar error con trazabilidad
  logger.error({
    msg: "Error capturado por el manejador global",
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    method: req.method,
    path: req.path,
    correlationId,
  });

  // --- 1. Errores de aplicación conocidos ---
  if (isAppError(err)) {
    const errorResponse = createErrorResponse(
      err.message,
      err.statusCode,
      process.env.NODE_ENV === "development"
        ? { name: err.name, stack: err.stack }
        : undefined
    );

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // --- 2. Errores de validación (Zod) ---
  if (err.name === "ZodError") {
    const zodError = err as any;
    const validationErrors = zodError.errors?.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    const errorResponse = createErrorResponse(
      "Validación fallida",
      400,
      process.env.NODE_ENV === "development"
        ? { errors: validationErrors, stack: err.stack }
        : { errors: validationErrors }
    );

    res.status(400).json(errorResponse);
    return;
  }

  // --- 3. Errores inesperados ---
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Error interno del servidor";

  const errorResponse = createErrorResponse(
    message,
    statusCode,
    process.env.NODE_ENV === "development"
      ? {
          name: err.name,
          stack: err.stack,
          originalError: err.message,
        }
      : undefined
  );

  res.status(statusCode).json(errorResponse);
}

/**
 * Middleware para manejar rutas no definidas (404).
 * 
 * Debe ir después de todas las rutas, antes del manejador principal de errores.
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse = createErrorResponse(
    `Ruta no encontrada: ${req.method} ${req.path}`,
    404
  );

  logger.warn({
    msg: "Ruta no encontrada",
    method: req.method,
    path: req.path,
    correlationId: req.headers["x-correlation-id"],
  });

  res.status(404).json(errorResponse);
}

/**
 * Envoltorio asíncrono para capturar errores en promesas y pasarlos al manejador global.
 * 
 * Evita rechazos de promesas no manejados en controladores async.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware de registro de peticiones HTTP.
 * 
 * Registra solicitudes entrantes y respuestas con su duración, IP y correlationId.
 * Evita ruido en entorno de test (NODE_ENV=test).
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV === "test") return next();

  const start = Date.now();
  const correlationId = req.headers["x-correlation-id"];

  logger.info({
    msg: "Petición entrante",
    method: req.method,
    path: req.path,
    ip: req.ip,
    correlationId,
    query: req.query,
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      msg: "Petición completada",
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      correlationId,
    });
  });

  next();
}
