/**
 * @fileoverview Custom error classes for consistent error handling across the Money Wise API.
 * 
 * This module provides specialized error types that extend the base Error class,
 * allowing for consistent error handling and HTTP status code mapping throughout
 * the application. Each error type corresponds to a specific HTTP status code.
 * 
 * @module utils/errors
 * @category Utils
 * 
 * @example
 * ```typescript
 * import { NotFoundError, ValidationError } from './utils/errors';
 * 
 * // Throw a 404 error
 * throw new NotFoundError('User', '123');
 * 
 * // Throw a 400 error
 * throw new ValidationError('Invalid email format');
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

/**
 * Base class for all application errors.
 * 
 * This abstract class provides a common structure for all custom errors
 * in the application. It ensures that all errors have a status code and
 * can be properly serialized to JSON for API responses.
 * 
 * @abstract
 * @extends Error
 * 
 * @property {string} name - The name of the error class
 * @property {string} message - The error message
 * @property {number} statusCode - The HTTP status code associated with this error
 */
export abstract class AppError extends Error {
  /**
   * The HTTP status code that should be returned when this error is thrown.
   * 
   * @type {number}
   * @readonly
   */
  public readonly statusCode: number;

  /**
   * Creates a new AppError instance.
   * 
   * @param {string} message - The error message describing what went wrong
   * @param {number} statusCode - The HTTP status code for this error (e.g., 404, 400, 500)
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error to a JSON-serializable object.
   * 
   * This method is useful for sending error responses to clients
   * in a consistent format.
   * 
   * @returns {Object} A plain object representation of the error
   * @returns {string} Object.status - Always "error" for error responses
   * @returns {string} Object.message - The error message
   * @returns {number} Object.statusCode - The HTTP status code
   * 
   * @example
   * ```typescript
   * const error = new NotFoundError('User', '123');
   * console.log(error.toJSON());
   * // Output: { status: "error", message: "User with id 123 not found", statusCode: 404 }
   * ```
   */
  toJSON() {
    return {
      status: "error",
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Error thrown when a requested resource is not found.
 * 
 * This error corresponds to HTTP 404 status code and should be used
 * when a client requests a resource (like a user, transaction, etc.)
 * that doesn't exist in the system.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // When a user is not found
 * throw new NotFoundError('User', userId);
 * 
 * // When a transaction is not found
 * throw new NotFoundError('Transaction', transactionId);
 * 
 * // Custom message
 * throw new NotFoundError('The requested resource does not exist');
 * ```
 */
export class NotFoundError extends AppError {
  /**
   * Creates a new NotFoundError instance.
   * 
   * @param {string} resource - The type of resource that was not found (e.g., "User", "Transaction")
   * @param {string} [id] - Optional ID of the resource that was not found
   * 
   * @example
   * ```typescript
   * // With resource type and ID
   * throw new NotFoundError('User', '123');
   * // Message: "User with id 123 not found"
   * 
   * // With just resource type
   * throw new NotFoundError('User');
   * // Message: "User not found"
   * 
   * // Custom message (when only one parameter and no second parameter)
   * throw new NotFoundError('The requested resource does not exist');
   * ```
   */
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404);
  }
}

/**
 * Error thrown when input validation fails.
 * 
 * This error corresponds to HTTP 400 status code and should be used
 * when client input doesn't meet the required format or validation rules.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Simple validation error
 * throw new ValidationError('Email is required');
 * 
 * // Multiple validation errors
 * throw new ValidationError('Invalid input: name is required, email must be valid');
 * 
 * // Using with Zod validation
 * try {
 *   userSchema.parse(data);
 * } catch (error) {
 *   throw new ValidationError(error.message);
 * }
 * ```
 */
export class ValidationError extends AppError {
  /**
   * Creates a new ValidationError instance.
   * 
   * @param {string} message - Description of what validation failed
   * 
   * @example
   * ```typescript
   * throw new ValidationError('User ID must be a valid UUID');
   * throw new ValidationError('Email format is invalid');
   * throw new ValidationError('Password must be at least 8 characters long');
   * ```
   */
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Error thrown when a request is malformed or invalid.
 * 
 * This error corresponds to HTTP 400 status code and should be used
 * for general bad request scenarios that don't fit into validation errors.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Missing required header
 * throw new BadRequestError('Content-Type header is required');
 * 
 * // Invalid request format
 * throw new BadRequestError('Request body must be valid JSON');
 * 
 * // Invalid operation
 * throw new BadRequestError('Cannot delete a user with active transactions');
 * ```
 */
export class BadRequestError extends AppError {
  /**
   * Creates a new BadRequestError instance.
   * 
   * @param {string} message - Description of why the request is invalid
   * 
   * @example
   * ```typescript
   * throw new BadRequestError('Invalid request format');
   * throw new BadRequestError('Missing required fields');
   * ```
   */
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Error thrown when an internal server error occurs.
 * 
 * This error corresponds to HTTP 500 status code and should be used
 * for unexpected errors that occur on the server side, such as database
 * connection failures, unexpected exceptions, etc.
 * 
 * @extends AppError
 * 
 * @example
 * ```typescript
 * // Database connection error
 * throw new InternalServerError('Database connection failed');
 * 
 * // Unexpected error
 * try {
 *   // Some operation
 * } catch (error) {
 *   throw new InternalServerError('An unexpected error occurred');
 * }
 * ```
 */
export class InternalServerError extends AppError {
  /**
   * Creates a new InternalServerError instance.
   * 
   * @param {string} [message='Internal server error'] - Description of the internal error
   * 
   * @example
   * ```typescript
   * throw new InternalServerError();
   * throw new InternalServerError('Failed to process transaction');
   * ```
   */
  constructor(message: string = "Internal server error") {
    super(message, 500);
  }
}

/**
 * Type guard to check if an error is an instance of AppError.
 * 
 * This function helps TypeScript narrow down the error type and can be used
 * to differentiate between custom application errors and native JavaScript errors.
 * 
 * @param {unknown} error - The error to check
 * @returns {boolean} True if the error is an AppError, false otherwise
 * 
 * @example
 * ```typescript
 * try {
 *   // Some operation
 * } catch (error) {
 *   if (isAppError(error)) {
 *     // TypeScript knows error is AppError here
 *     console.log(`Status code: ${error.statusCode}`);
 *     res.status(error.statusCode).json(error.toJSON());
 *   } else {
 *     // Handle native errors
 *     console.error('Unexpected error:', error);
 *   }
 * }
 * ```
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}