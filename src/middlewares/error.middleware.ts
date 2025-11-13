/**
 * @fileoverview Middleware de manejo de errores para la API de Money Wise.
 * 
 * Este mÃ³dulo proporciona manejo centralizado de errores para la aplicaciÃ³n.
 * Captura todos los errores lanzados por controladores y servicios, los formatea
 * de manera consistente y envÃ­a respuestas HTTP apropiadas a los clientes.
 * 
 * CaracterÃ­sticas clave:
 * - Formato de respuesta de error consistente
 * - Mapeo automÃ¡tico de cÃ³digos de estado HTTP
 * - Detalles de error para desarrollo vs producciÃ³n
 * - Registro de errores
 * - Manejo de errores operacionales e inesperados
 * 
 * @module middlewares/error.middleware
 * @category Middlewares
 * 
 * @example
 * ```typescript
 * import { errorHandler } from './middlewares/error.middleware';
 * 
 * // En index.ts
 * app.use(errorHandler);
 * ```
 * 
 * @author Equipo de IntegraciÃ³n Money Wise
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import pinoHttp from "pino-http";
import { isAppError, AppError } from "../utils/errors";
import { createErrorResponse } from "../dtos/user.dto";
import { logger, getLoggerWithTraceId } from "../config/logger";

/**
 * Extiende la interfaz Request de Express para incluir traceId.
 * Esto permite que TypeScript reconozca la propiedad traceId en objetos Request.
 */
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
      id?: string;
    }
  }
}

/**
 * Middleware para generar y adjuntar un traceId Ãºnico a cada request.
 *
 * Este middleware propaga el correlation ID entrante si existe (header x-correlation-id),
 * o genera un UUID Ãºnico para cada request entrante y lo almacena en `req.traceId`.
 * Este traceId puede ser usado para rastrear requests a travÃ©s de toda la aplicaciÃ³n,
 * facilitando el debugging y el monitoreo.
 *
 * El traceId tambiÃ©n se puede incluir en respuestas y logs para correlacionar
 * requests con sus respuestas y errores correspondientes.
 *
 * @function traceIdMiddleware
 * @param {Request} req - Objeto de peticiÃ³n de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - FunciÃ³n de siguiente middleware de Express
 * @returns {void}
 *
 * @example
 * ```typescript
 * import { traceIdMiddleware } from './middlewares/error.middleware';
 *
 * // Registrar como primer middleware
 * app.use(traceIdMiddleware);
 *
 * // Usar en otros middlewares o controladores
 * app.get('/example', (req, res) => {
 *   console.log(`Request traceId: ${req.traceId}`);
 *   res.json({ traceId: req.traceId });
 * });
 * ```
 */
export function traceIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerCandidates = [
    req.headers["x-correlation-id"],
    req.headers["x-request-id"],
    req.headers["x-trace-id"],
  ];

  const candidate = headerCandidates.find((value) => value !== undefined);
  const headerValue = Array.isArray(candidate) ? candidate[0] : candidate;

  const traceId =
    typeof headerValue === "string" && headerValue.trim().length > 0
      ? headerValue
      : randomUUID();

  req.traceId = traceId;
  res.locals.traceId = traceId;
  res.setHeader("X-Trace-Id", traceId);
  res.setHeader("X-Correlation-Id", traceId);

  next();
}

/**
 * Middleware centralizado de manejo de errores.
 * 
 * Este middleware debe registrarse despuÃ©s de todas las rutas en la aplicaciÃ³n Express.
 * Captura cualquier error que se pase a 
ext(error)` desde controladores
 * u otro middleware, los formatea apropiadamente y envÃ­a una respuesta
 * JSON consistente al cliente.
 * 
 * Flujo de Manejo de Errores:
 * 1. Verificar si el error es una instancia de AppError (errores personalizados)
 * 2. Si es asÃ­, usar el cÃ³digo de estado y mensaje del error
 * 3. Si no, tratar como error inesperado (500) y registrarlo
 * 4. Formatear respuesta de error usando createErrorResponse
 * 5. Enviar respuesta JSON con cÃ³digo de estado apropiado
 * 
 * **Desarrollo vs ProducciÃ³n**:
 * - En desarrollo: Incluir stack traces e informaciÃ³n detallada del error
 * - En producciÃ³n: Retornar mensajes de error genÃ©ricos para errores inesperados
 * 
 * @function errorHandler
 * @param {Error | AppError} err - El error que fue lanzado
 * @param {Request} req - Objeto de peticiÃ³n de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - FunciÃ³n de siguiente middleware de Express (no usado pero requerido por Express)
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Registrar manejador de errores (DEBE ser el Ãºltimo middleware)
 * app.use('/api/users', usersRouter);
 * app.use(errorHandler);
 * 
 * // El error serÃ¡ capturado por este middleware
 * app.get('/example', async (req, res, next) => {
 *   try {
 *     throw new NotFoundError('User', '123');
 *   } catch (error) {
 *     next(error); // Pasa a errorHandler
 *   }
 * });
 * ```
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const existingTraceId = req.traceId;
  const traceId = existingTraceId && existingTraceId !== '' ? existingTraceId : randomUUID();

  if (!existingTraceId) {
    req.traceId = traceId;
    res.setHeader("X-Trace-Id", traceId);
    res.setHeader("X-Correlation-Id", traceId);
  }

  const env = process.env.NODE_ENV || "development";
  const includeDebugInfo = env === "development";
  const log = getLoggerWithTraceId(traceId);
  const logContext = {
    path: req.path,
    method: req.method,
  };

  if (isAppError(err)) {
    const detailPayload: Record<string, any> = { traceId };
    if (err.details) {
      detailPayload.details = err.details;
    }
    if (includeDebugInfo) {
      detailPayload.name = err.name;
      detailPayload.stack = err.stack;
    }

    log.warn({ ...logContext, statusCode: err.statusCode, details: err.details }, err.message);

    const errorResponse = createErrorResponse(
      err.message,
      err.statusCode,
      detailPayload
    );

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  if (err.name === "ZodError") {
    const zodError = err as any;
    const validationErrors = zodError.errors?.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    log.warn({ ...logContext, errors: validationErrors }, "Validacion fallida");

    const errorResponse = createErrorResponse(
      "Validacion fallida",
      400,
      includeDebugInfo
        ? { traceId, errors: validationErrors, stack: err.stack }
        : { traceId, errors: validationErrors }
    );

    res.status(400).json(errorResponse);
    return;
  }

  const statusCode = 500;
  const message = includeDebugInfo ? err.message : "Ocurrio un error inesperado";

  log.error({ ...logContext, statusCode, err }, message);

  const errorResponse = createErrorResponse(
    message,
    statusCode,
    includeDebugInfo
      ? {
          traceId,
          name: err.name,
          stack: err.stack,
          originalError: err.message,
        }
      : { traceId }
  );

  res.status(statusCode).json(errorResponse);
}

/**
 * Middleware para manejar errores 404 para rutas no definidas.
 * 
 * Este middleware debe registrarse despuÃ©s de todas las definiciones de rutas
 * pero antes del manejador principal de errores. Captura cualquier peticiÃ³n a
 * rutas que no han sido definidas y retorna una respuesta 404 consistente.
 * 
 * @function notFoundHandler
 * @param {Request} req - Objeto de peticiÃ³n de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Registrar despuÃ©s de todas las rutas
 * app.use('/api/users', usersRouter);
 * app.use(notFoundHandler);  // Captura rutas no definidas
 * app.use(errorHandler);      // Captura otros errores
 * 
 * // PeticiÃ³n a ruta no definida
 * GET /api/undefined-route
 * 
 * // Respuesta (404)
 * {
 *   "status": "error",
 *   "message": "Ruta no encontrada: GET /api/undefined-route",
 *   "statusCode": 404
 * }
 * ```
 */
export function notFoundHandler(req: Request, res: Response): void {
  const traceId = req.traceId || randomUUID();
  const log = getLoggerWithTraceId(traceId);

  log.warn({ path: req.path, method: req.method }, "Route not found");

  const errorResponse = createErrorResponse(
    `Route not found: ${req.method} ${req.path}`,
    404,
    { traceId }
  );

  res.status(404).json(errorResponse);
}

/**
 * Envoltorio asÃ­ncrono para manejadores de rutas para capturar rechazos de promesas.
 * 
 * Esta funciÃ³n utilitaria envuelve manejadores de rutas asÃ­ncronos para
 * capturar automÃ¡ticamente cualquier rechazo de promesa y pasarlos al middleware
 * de manejo de errores. Esto previene rechazos de promesas no manejados.
 * 
 * **Nota**: Con Express 5, esto es menos necesario ya que Express 5
 * maneja automÃ¡ticamente rechazos de promesas en manejadores asÃ­ncronos.
 * 
 * @function asyncHandler
 * @param {Function} fn - FunciÃ³n manejadora de ruta asÃ­ncrona
 * @returns {Function} Manejador de ruta envuelto
 * 
 * @example
 * ```typescript
 * import { asyncHandler } from './middlewares/error.middleware';
 * 
 * // Sin asyncHandler (los errores podrÃ­an no ser capturados)
 * router.get('/:id', async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   res.json(user);
 * });
 * 
 * // Con asyncHandler (errores capturados automÃ¡ticamente)
 * router.get('/:id', asyncHandler(async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   res.json(user);
 * }));
 * ```
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware de registro de peticiones.
 * 
 * Registra las peticiones entrantes con informaciÃ³n relevante para depuraciÃ³n
 * y propÃ³sitos de monitoreo.
 * 
 * @function requestLogger
 * @param {Request} req - Objeto de peticiÃ³n de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - FunciÃ³n de siguiente middleware de Express
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Registrar temprano en la cadena de middleware
 * app.use(requestLogger);
 * app.use('/api/users', usersRouter);
 * ```
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: Request, res: Response) => {
    if (!req.traceId) {
      const newTraceId = randomUUID();
      req.traceId = newTraceId;
      res.locals.traceId = newTraceId;
      res.setHeader("X-Trace-Id", newTraceId);
      res.setHeader("X-Correlation-Id", newTraceId);
    }
    return req.traceId;
  },
  customProps: (req) => ({
    traceId: req.traceId,
    route: req.route?.path,
  }),
  customSuccessMessage: (req) => `${req.method} ${req.originalUrl ?? req.url} completed`,
  customErrorMessage: (req) => `${req.method} ${req.originalUrl ?? req.url} failed`,
  customLogLevel: (res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.originalUrl || req.url,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});









