/**
 * @fileoverview Error handling middleware for the Money Wise API.
 * 
 * This module provides centralized error handling for the application.
 * It catches all errors thrown by controllers and services, formats them
 * consistently, and sends appropriate HTTP responses to clients.
 * 
 * Key features:
 * - Consistent error response format
 * - Automatic HTTP status code mapping
 * - Development vs production error details
 * - Logging of errors
 * - Handling of both operational and unexpected errors
 * 
 * @module middlewares/error.middleware
 * @category Middlewares
 * 
 * @example
 * ```typescript
 * import { errorHandler } from './middlewares/error.middleware';
 * 
 * // In index.ts
 * app.use(errorHandler);
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { isAppError, AppError } from "../utils/errors";
import { createErrorResponse } from "../dtos/User.dto";

/**
 * Centralized error handling middleware.
 * 
 * This middleware should be registered after all routes in the Express app.
 * It catches any errors that are passed to `next(error)` from controllers
 * or other middleware, formats them appropriately, and sends a consistent
 * JSON response to the client.
 * 
 * Error Handling Flow:
 * 1. Check if error is an instance of AppError (custom errors)
 * 2. If yes, use the error's status code and message
 * 3. If no, treat as unexpected error (500) and log it
 * 4. Format error response using createErrorResponse
 * 5. Send JSON response with appropriate status code
 * 
 * **Development vs Production**:
 * - In development: Include stack traces and detailed error info
 * - In production: Return generic error messages for unexpected errors
 * 
 * @function errorHandler
 * @param {Error | AppError} err - The error that was thrown
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function (unused but required by Express)
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Register error handler (MUST be last middleware)
 * app.use('/api/users', usersRouter);
 * app.use(errorHandler);
 * 
 * // Error will be caught by this middleware
 * app.get('/example', async (req, res, next) => {
 *   try {
 *     throw new NotFoundError('User', '123');
 *   } catch (error) {
 *     next(error); // Passes to errorHandler
 *   }
 * });
 * ```
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error for debugging (in production, use proper logging service)
  console.error("Error caught by error handler:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Check if it's one of our custom AppError types
  if (isAppError(err)) {
    // Handle known application errors
    const errorResponse = createErrorResponse(
      err.message,
      err.statusCode,
      process.env.NODE_ENV === "development"
        ? {
            name: err.name,
            stack: err.stack,
          }
        : undefined
    );

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const zodError = err as any;
    const validationErrors = zodError.errors?.map((e: any) => ({
      field: e.path.join("."),
      message: e.message,
    }));

    const errorResponse = createErrorResponse(
      "Validation failed",
      400,
      process.env.NODE_ENV === "development"
        ? {
            errors: validationErrors,
            stack: err.stack,
          }
        : { errors: validationErrors }
    );

    res.status(400).json(errorResponse);
    return;
  }

  // Handle unexpected errors (bugs, unhandled cases, etc.)
  const statusCode = 500;
  const message =
    process.env.NODE_ENV === "development"
      ? err.message
      : "An unexpected error occurred";

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
 * Middleware to handle 404 errors for undefined routes.
 * 
 * This middleware should be registered after all route definitions
 * but before the main error handler. It catches any requests to
 * routes that haven't been defined and returns a consistent 404 response.
 * 
 * @function notFoundHandler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Register after all routes
 * app.use('/api/users', usersRouter);
 * app.use(notFoundHandler);  // Catches undefined routes
 * app.use(errorHandler);      // Catches other errors
 * 
 * // Request to undefined route
 * GET /api/undefined-route
 * 
 * // Response (404)
 * {
 *   "status": "error",
 *   "message": "Route not found: GET /api/undefined-route",
 *   "statusCode": 404
 * }
 * ```
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse = createErrorResponse(
    `Route not found: ${req.method} ${req.path}`,
    404
  );

  res.status(404).json(errorResponse);
}

/**
 * Async wrapper for route handlers to catch promise rejections.
 * 
 * This utility function wraps async route handlers to automatically
 * catch any promise rejections and pass them to the error handling
 * middleware. This prevents unhandled promise rejections.
 * 
 * **Note**: With Express 5, this is less necessary as Express 5
 * automatically handles promise rejections in async handlers.
 * 
 * @function asyncHandler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 * 
 * @example
 * ```typescript
 * import { asyncHandler } from './middlewares/error.middleware';
 * 
 * // Without asyncHandler (errors might not be caught)
 * router.get('/:id', async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   res.json(user);
 * });
 * 
 * // With asyncHandler (errors automatically caught)
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
 * Request logging middleware.
 * 
 * Logs incoming requests with relevant information for debugging
 * and monitoring purposes.
 * 
 * @function requestLogger
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Register early in middleware chain
 * app.use(requestLogger);
 * app.use('/api/users', usersRouter);
 * ```
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== "GET" ? req.body : undefined,
    ip: req.ip,
  });

  // Log response when it's sent
  const originalSend = res.json;
  res.json = function (data: any) {
    console.log(`[${timestamp}] Response ${res.statusCode} for ${req.method} ${req.path}`);
    return originalSend.call(this, data);
  };

  next();
}