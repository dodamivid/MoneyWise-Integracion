/**
 * @fileoverview Data Transfer Objects (DTOs) for API responses.
 * 
 * This module defines the structure of API responses for user-related operations.
 * DTOs ensure consistent response formats across all endpoints and separate
 * the internal data model from the API contract.
 * 
 * Key features:
 * - Consistent response structure across all endpoints
 * - Sensitive data exclusion (passwords are never included)
 * - Type-safe response creation
 * - Standardized error responses
 * 
 * @module dtos/user.dto
 * @category DTOs
 * 
 * @example
 * ```typescript
 * import { UserResponseDTO, createUserResponse } from './dtos/user.dto';
 * 
 * const user = await userService.findById(id);
 * const response = createUserResponse(user);
 * res.json(response);
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { User } from "../models/user.model";

/**
 * User data structure for API responses.
 * 
 * This interface defines the user data that is safe to send to clients.
 * Note: The password field is intentionally excluded for security.
 * 
 * @interface UserData
 * 
 * @property {string} id - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {boolean} isActive - Whether the user account is active
 * @property {string} createdAt - When the account was created (ISO 8601)
 * @property {string} updatedAt - When the account was last updated (ISO 8601)
 * 
 * @example
 * ```typescript
 * const userData: UserData = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   email: 'john.doe@example.com',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true,
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-01T00:00:00.000Z'
 * };
 * ```
 */
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard structure for successful API responses containing user data.
 * 
 * This interface ensures all successful user-related responses follow
 * the same format, making it easier for clients to parse responses.
 * 
 * @interface UserResponseDTO
 * 
 * @property {"success"} status - Always "success" for successful operations
 * @property {UserData} data - The user data payload
 * @property {string} [message] - Optional message providing additional context
 * 
 * @example
 * ```typescript
 * const response: UserResponseDTO = {
 *   status: "success",
 *   data: {
 *     id: '550e8400-e29b-41d4-a716-446655440000',
 *     email: 'john.doe@example.com',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     isActive: true,
 *     createdAt: '2024-01-01T00:00:00.000Z',
 *     updatedAt: '2024-01-01T00:00:00.000Z'
 *   },
 *   message: 'User retrieved successfully'
 * };
 * ```
 */
export interface UserResponseDTO {
  status: "success";
  data: UserData;
  message?: string;
}

/**
 * Standard structure for successful API responses containing multiple users.
 * 
 * Used when returning lists of users (e.g., search results, paginated lists).
 * 
 * @interface UsersResponseDTO
 * 
 * @property {"success"} status - Always "success" for successful operations
 * @property {UserData[]} data - Array of user data objects
 * @property {Object} [meta] - Optional metadata about the response
 * @property {number} [meta.total] - Total number of users available
 * @property {number} [meta.page] - Current page number
 * @property {number} [meta.limit] - Number of items per page
 * @property {string} [message] - Optional message providing additional context
 * 
 * @example
 * ```typescript
 * const response: UsersResponseDTO = {
 *   status: "success",
 *   data: [
 *     {
 *       id: '550e8400-e29b-41d4-a716-446655440000',
 *       email: 'user1@example.com',
 *       firstName: 'John',
 *       lastName: 'Doe',
 *       isActive: true,
 *       createdAt: '2024-01-01T00:00:00.000Z',
 *       updatedAt: '2024-01-01T00:00:00.000Z'
 *     }
 *   ],
 *   meta: {
 *     total: 100,
 *     page: 1,
 *     limit: 10
 *   },
 *   message: 'Users retrieved successfully'
 * };
 * ```
 */
export interface UsersResponseDTO {
  status: "success";
  data: UserData[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

/**
 * Standard structure for error responses.
 * 
 * This interface ensures all error responses follow the same format,
 * making error handling consistent and predictable for API clients.
 * 
 * @interface ErrorResponseDTO
 * 
 * @property {"error"} status - Always "error" for error responses
 * @property {string} message - Human-readable error message
 * @property {number} [statusCode] - HTTP status code (e.g., 404, 400, 500)
 * @property {Object} [details] - Optional additional error details
 * @property {string} [details.field] - Field that caused the error
 * @property {string} [details.reason] - Detailed reason for the error
 * 
 * @example
 * ```typescript
 * // Simple error response
 * const errorResponse: ErrorResponseDTO = {
 *   status: "error",
 *   message: "User not found",
 *   statusCode: 404
 * };
 * 
 * // Error response with details
 * const validationError: ErrorResponseDTO = {
 *   status: "error",
 *   message: "Validation failed",
 *   statusCode: 400,
 *   details: {
 *     field: "email",
 *     reason: "Invalid email format"
 *   }
 * };
 * ```
 */
export interface ErrorResponseDTO {
  status: "error";
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
}

/**
 * Converts a User model to UserData DTO.
 * 
 * This function removes sensitive information (password) from the user object
 * before sending it to the client. It creates a clean separation between
 * the internal data model and the API response.
 * 
 * @function toUserData
 * @param {User} user - The user model object
 * @returns {UserData} User data safe for API responses
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   email: 'john.doe@example.com',
 *   password: 'hashedPassword123',  // Will be removed
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true,
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-01T00:00:00.000Z'
 * };
 * 
 * const userData = toUserData(user);
 * // userData will NOT contain the password field
 * ```
 */
export function toUserData(user: User): UserData {
  // Destructure to exclude password from the response
  const { password, ...userData } = user;
  return userData;
}

/**
 * Creates a standardized success response for a single user.
 * 
 * This function wraps user data in the standard API response format,
 * ensuring consistency across all endpoints that return user data.
 * 
 * @function createUserResponse
 * @param {User} user - The user model object
 * @param {string} [message] - Optional success message
 * @returns {UserResponseDTO} Formatted API response
 * 
 * @example
 * ```typescript
 * const user = await userService.findById(userId);
 * const response = createUserResponse(user, 'User retrieved successfully');
 * res.status(200).json(response);
 * // Response:
 * // {
 * //   status: "success",
 * //   data: { id, email, firstName, lastName, isActive, createdAt, updatedAt },
 * //   message: "User retrieved successfully"
 * // }
 * ```
 */
export function createUserResponse(
  user: User,
  message?: string
): UserResponseDTO {
  return {
    status: "success",
    data: toUserData(user),
    ...(message && { message }),
  };
}

/**
 * Creates a standardized success response for multiple users.
 * 
 * This function wraps an array of user data in the standard API response format,
 * with optional metadata for pagination.
 * 
 * @function createUsersResponse
 * @param {User[]} users - Array of user model objects
 * @param {Object} [meta] - Optional metadata for pagination
 * @param {number} [meta.total] - Total number of users
 * @param {number} [meta.page] - Current page number
 * @param {number} [meta.limit] - Items per page
 * @param {string} [message] - Optional success message
 * @returns {UsersResponseDTO} Formatted API response with user list
 * 
 * @example
 * ```typescript
 * const users = await userService.findAll();
 * const response = createUsersResponse(users, {
 *   total: 100,
 *   page: 1,
 *   limit: 10
 * }, 'Users retrieved successfully');
 * 
 * res.status(200).json(response);
 * ```
 */
export function createUsersResponse(
  users: User[],
  meta?: { total: number; page: number; limit: number },
  message?: string
): UsersResponseDTO {
  return {
    status: "success",
    data: users.map(toUserData),
    ...(meta && { meta }),
    ...(message && { message }),
  };
}

/**
 * Creates a standardized error response.
 * 
 * This function creates consistent error responses that can be sent to clients.
 * It ensures all errors follow the same format.
 * 
 * @function createErrorResponse
 * @param {string} message - Error message
 * @param {number} [statusCode] - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {ErrorResponseDTO} Formatted error response
 * 
 * @example
 * ```typescript
 * // Simple error
 * const error = createErrorResponse('User not found', 404);
 * res.status(404).json(error);
 * 
 * // Error with details
 * const validationError = createErrorResponse(
 *   'Validation failed',
 *   400,
 *   { field: 'email', reason: 'Invalid format' }
 * );
 * res.status(400).json(validationError);
 * ```
 */
export function createErrorResponse(
  message: string,
  statusCode?: number,
  details?: Record<string, any>
): ErrorResponseDTO {
  return {
    status: "error",
    message,
    ...(statusCode && { statusCode }),
    ...(details && { details }),
  };
}