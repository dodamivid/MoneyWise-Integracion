"use strict";
/**
 * @fileoverview Middleware de manejo de errores para la API de Money Wise.
 *
 * Este módulo proporciona manejo centralizado de errores para la aplicación.
 * Captura todos los errores lanzados por controladores y servicios, los formatea
 * de manera consistente y envía respuestas HTTP apropiadas a los clientes.
 *
 * Características clave:
 * - Formato de respuesta de error consistente
 * - Mapeo automático de códigos de estado HTTP
 * - Detalles de error para desarrollo vs producción
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
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceIdMiddleware = traceIdMiddleware;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
exports.requestLogger = requestLogger;
const crypto_1 = require("crypto");
const errors_1 = require("../utils/errors");
const user_dto_1 = require("../dtos/user.dto");
/**
 * Middleware para generar y adjuntar un traceId único a cada request.
 *
 * Este middleware propaga el correlation ID entrante si existe (header x-correlation-id),
 * o genera un UUID único para cada request entrante y lo almacena en `req.traceId`.
 * Este traceId puede ser usado para rastrear requests a través de toda la aplicación,
 * facilitando el debugging y el monitoreo.
 *
 * El traceId también se puede incluir en respuestas y logs para correlacionar
 * requests con sus respuestas y errores correspondientes.
 *
 * @function traceIdMiddleware
 * @param {Request} req - Objeto de petición de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función de siguiente middleware de Express
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
function traceIdMiddleware(req, res, next) {
    // Propagar el correlation ID entrante si existe, o generar uno nuevo
    const incomingCorrelationId = req.headers['x-correlation-id'];
    req.traceId = typeof incomingCorrelationId === 'string'
        ? incomingCorrelationId
        : (0, crypto_1.randomUUID)();
    // Opcional: También se puede incluir en el header de respuesta
    res.setHeader('X-Trace-Id', req.traceId);
    next();
}
/**
 * Middleware centralizado de manejo de errores.
 *
 * Este middleware debe registrarse después de todas las rutas en la aplicación Express.
 * Captura cualquier error que se pase a `next(error)` desde controladores
 * u otro middleware, los formatea apropiadamente y envía una respuesta
 * JSON consistente al cliente.
 *
 * Flujo de Manejo de Errores:
 * 1. Verificar si el error es una instancia de AppError (errores personalizados)
 * 2. Si es así, usar el código de estado y mensaje del error
 * 3. Si no, tratar como error inesperado (500) y registrarlo
 * 4. Formatear respuesta de error usando createErrorResponse
 * 5. Enviar respuesta JSON con código de estado apropiado
 *
 * **Desarrollo vs Producción**:
 * - En desarrollo: Incluir stack traces e información detallada del error
 * - En producción: Retornar mensajes de error genéricos para errores inesperados
 *
 * @function errorHandler
 * @param {Error | AppError} err - El error que fue lanzado
 * @param {Request} req - Objeto de petición de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función de siguiente middleware de Express (no usado pero requerido por Express)
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Registrar manejador de errores (DEBE ser el último middleware)
 * app.use('/api/users', usersRouter);
 * app.use(errorHandler);
 *
 * // El error será capturado por este middleware
 * app.get('/example', async (req, res, next) => {
 *   try {
 *     throw new NotFoundError('User', '123');
 *   } catch (error) {
 *     next(error); // Pasa a errorHandler
 *   }
 * });
 * ```
 */
function errorHandler(err, req, res, next) {
    // Obtener traceId del request
    const traceId = req.traceId || 'unknown';
    // Registrar el error para depuración (en producción, usar un servicio de logging apropiado)
    console.error("Error capturado por el manejador de errores:", {
        traceId,
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });
    // Verificar si es uno de nuestros tipos de AppError personalizados
    if ((0, errors_1.isAppError)(err)) {
        // Manejar errores de aplicación conocidos
        const errorResponse = (0, user_dto_1.createErrorResponse)(err.message, err.statusCode, process.env.NODE_ENV === "development"
            ? {
                name: err.name,
                stack: err.stack,
                traceId,
            }
            : { traceId });
        res.status(err.statusCode).json(errorResponse);
        return;
    }
    // Manejar errores de validación de Zod
    if (err.name === "ZodError") {
        const zodError = err;
        const validationErrors = zodError.errors?.map((e) => ({
            field: e.path.join("."),
            message: e.message,
        }));
        const errorResponse = (0, user_dto_1.createErrorResponse)("Validación fallida", 400, process.env.NODE_ENV === "development"
            ? {
                errors: validationErrors,
                stack: err.stack,
                traceId,
            }
            : { errors: validationErrors, traceId });
        res.status(400).json(errorResponse);
        return;
    }
    // Manejar errores inesperados (bugs, casos no manejados, etc.)
    const statusCode = 500;
    const message = process.env.NODE_ENV === "development"
        ? err.message
        : "Ocurrió un error inesperado";
    const errorResponse = (0, user_dto_1.createErrorResponse)(message, statusCode, process.env.NODE_ENV === "development"
        ? {
            name: err.name,
            stack: err.stack,
            originalError: err.message,
            traceId,
        }
        : { traceId });
    res.status(statusCode).json(errorResponse);
}
/**
 * Middleware para manejar errores 404 para rutas no definidas.
 *
 * Este middleware debe registrarse después de todas las definiciones de rutas
 * pero antes del manejador principal de errores. Captura cualquier petición a
 * rutas que no han sido definidas y retorna una respuesta 404 consistente.
 *
 * @function notFoundHandler
 * @param {Request} req - Objeto de petición de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Registrar después de todas las rutas
 * app.use('/api/users', usersRouter);
 * app.use(notFoundHandler);  // Captura rutas no definidas
 * app.use(errorHandler);      // Captura otros errores
 *
 * // Petición a ruta no definida
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
function notFoundHandler(req, res) {
    const traceId = req.traceId || 'unknown';
    const errorResponse = (0, user_dto_1.createErrorResponse)(`Route not found: ${req.method} ${req.path}`, 404, { traceId });
    res.status(404).json(errorResponse);
}
/**
 * Envoltorio asíncrono para manejadores de rutas para capturar rechazos de promesas.
 *
 * Esta función utilitaria envuelve manejadores de rutas asíncronos para
 * capturar automáticamente cualquier rechazo de promesa y pasarlos al middleware
 * de manejo de errores. Esto previene rechazos de promesas no manejados.
 *
 * **Nota**: Con Express 5, esto es menos necesario ya que Express 5
 * maneja automáticamente rechazos de promesas en manejadores asíncronos.
 *
 * @function asyncHandler
 * @param {Function} fn - Función manejadora de ruta asíncrona
 * @returns {Function} Manejador de ruta envuelto
 *
 * @example
 * ```typescript
 * import { asyncHandler } from './middlewares/error.middleware';
 *
 * // Sin asyncHandler (los errores podrían no ser capturados)
 * router.get('/:id', async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   res.json(user);
 * });
 *
 * // Con asyncHandler (errores capturados automáticamente)
 * router.get('/:id', asyncHandler(async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   res.json(user);
 * }));
 * ```
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Middleware de registro de peticiones.
 *
 * Registra las peticiones entrantes con información relevante para depuración
 * y propósitos de monitoreo.
 *
 * @function requestLogger
 * @param {Request} req - Objeto de petición de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función de siguiente middleware de Express
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Registrar temprano en la cadena de middleware
 * app.use(requestLogger);
 * app.use('/api/users', usersRouter);
 * ```
 */
function requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`, {
        query: req.query,
        body: req.method !== "GET" ? req.body : undefined,
        ip: req.ip,
    });
    // Registrar respuesta cuando se envíe
    const originalSend = res.json;
    res.json = function (data) {
        console.log(`[${timestamp}] Respuesta ${res.statusCode} para ${req.method} ${req.path}`);
        return originalSend.call(this, data);
    };
    next();
}
