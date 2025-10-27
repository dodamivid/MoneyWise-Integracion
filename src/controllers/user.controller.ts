/**
 * @fileoverview User controller for handling HTTP requests and responses.
 * 
 * This module implements the Controller pattern, handling HTTP-specific logic
 * such as request parsing, response formatting, and status code management.
 * Controllers act as the entry point for HTTP requests, delegating business
 * logic to service layers.
 * 
 * Key responsibilities:
 * - HTTP request/response handling
 * - Input extraction and basic validation
 * - Status code management
 * - Error propagation to error handling middleware
 * - Response formatting using DTOs
 * 
 * @module controllers/user.controller
 * @category Controllers
 * 
 * @example
 * ```typescript
 * import { Router } from 'express';
 * import { userController } from './controllers/user.controller';
 * 
 * const router = Router();
 * router.get('/:id', userController.getById);
 * router.get('/', userController.getAll);
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { createUserResponse, createUsersResponse } from "../dtos/user.dto";
import { isAppError } from "../utils/errors";

/**
 * Controller class for user-related HTTP endpoints.
 * 
 * This class contains handler methods for all user-related routes.
 * Each method follows the Express middleware signature (req, res, next).
 * 
 * All methods are designed to be used as Express route handlers and
 * follow async/await patterns with proper error propagation to the
 * error handling middleware.
 * 
 * @class UserController
 * 
 * @example
 * ```typescript
 * const controller = new UserController();
 * 
 * // Use in Express routes
 * app.get('/api/users/:id', controller.getById);
 * app.get('/api/users', controller.getAll);
 * ```
 */
export class UserController {
  /**
   * Retrieves a single user by their ID.
   * 
   * **Route**: GET /api/users/:id
   * 
   * This endpoint:
   * 1. Extracts the user ID from route parameters
   * 2. Calls the service to find the user
   * 3. Returns a 200 response with user data if found
   * 4. Passes errors to error handling middleware
   * 
   * **Success Response (200)**:
   * ```json
   * {
   *   "status": "success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john.doe@example.com",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "isActive": true,
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   },
   *   "message": "User retrieved successfully"
   * }
   * ```
   * 
   * **Error Response (404)**:
   * ```json
   * {
   *   "status": "error",
   *   "message": "User with id 550e8400-e29b-41d4-a716-446655440000 not found",
   *   "statusCode": 404
   * }
   * ```
   * 
   * **Error Response (400)**:
   * ```json
   * {
   *   "status": "error",
   *   "message": "Invalid user ID format: abc-123",
   *   "statusCode": 400
   * }
   * ```
   * 
   * @async
   * @param {Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - User UUID
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Route definition
   * router.get('/:id', userController.getById);
   * 
   * // Request
   * GET /api/users/550e8400-e29b-41d4-a716-446655440000
   * 
   * // Response (200 OK)
   * {
   *   "status": "success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john.doe@example.com",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "isActive": true,
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   },
   *   "message": "User retrieved successfully"
   * }
   * ```
   */
  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract user ID from route parameters
      const { id } = req.params;

      // Call service to find user
      const user = await userService.findById(id);

      // Format response using DTO
      const response = createUserResponse(user, "User retrieved successfully");

      // Send successful response
      res.status(200).json(response);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }

  /**
   * Retrieves all users from the system.
   * 
   * **Route**: GET /api/users
   * 
   * This endpoint:
   * 1. Calls the service to fetch all users
   * 2. Returns a 200 response with an array of users
   * 3. Includes metadata about the total count
   * 
   * **Note**: In a production system, this would include pagination,
   * filtering, and sorting query parameters.
   * 
   * **Success Response (200)**:
   * ```json
   * {
   *   "status": "success",
   *   "data": [
   *     {
   *       "id": "550e8400-e29b-41d4-a716-446655440000",
   *       "email": "john.doe@example.com",
   *       "firstName": "John",
   *       "lastName": "Doe",
   *       "isActive": true,
   *       "createdAt": "2024-01-01T00:00:00.000Z",
   *       "updatedAt": "2024-01-01T00:00:00.000Z"
   *     },
   *     {
   *       "id": "660e8400-e29b-41d4-a716-446655440001",
   *       "email": "jane.smith@example.com",
   *       "firstName": "Jane",
   *       "lastName": "Smith",
   *       "isActive": true,
   *       "createdAt": "2024-01-02T00:00:00.000Z",
   *       "updatedAt": "2024-01-02T00:00:00.000Z"
   *     }
   *   ],
   *   "message": "Users retrieved successfully"
   * }
   * ```
   * 
   * @async
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Route definition
   * router.get('/', userController.getAll);
   * 
   * // Request
   * GET /api/users
   * 
   * // Response (200 OK)
   * {
   *   "status": "success",
   *   "data": [...],
   *   "message": "Users retrieved successfully"
   * }
   * ```
   */
  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Call service to fetch all users
      const users = await userService.findAll();

      // Format response using DTO
      const response = createUsersResponse(
        users,
        undefined,
        "Users retrieved successfully"
      );

      // Send successful response
      res.status(200).json(response);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }

  /**
   * Creates a new user in the system.
   * 
   * **Route**: POST /api/users
   * 
   * This endpoint:
   * 1. Extracts user data from request body
   * 2. Calls service to create the user (includes validation)
   * 3. Returns a 201 response with the created user
   * 
   * **Request Body**:
   * ```json
   * {
   *   "email": "john.doe@example.com",
   *   "password": "SecurePass123",
   *   "firstName": "John",
   *   "lastName": "Doe",
   *   "isActive": true
   * }
   * ```
   * 
   * **Success Response (201)**:
   * ```json
   * {
   *   "status": "success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "john.doe@example.com",
   *     "firstName": "John",
   *     "lastName": "Doe",
   *     "isActive": true,
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   },
   *   "message": "User created successfully"
   * }
   * ```
   * 
   * **Error Response (400)**:
   * ```json
   * {
   *   "status": "error",
   *   "message": "User with email john.doe@example.com already exists",
   *   "statusCode": 400
   * }
   * ```
   * 
   * @async
   * @param {Request} req - Express request object
   * @param {Object} req.body - User creation data
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Route definition
   * router.post('/', userController.create);
   * 
   * // Request
   * POST /api/users
   * Content-Type: application/json
   * {
   *   "email": "john.doe@example.com",
   *   "password": "SecurePass123",
   *   "firstName": "John",
   *   "lastName": "Doe"
   * }
   * ```
   */
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract user data from request body
      const userData = req.body;

      // Call service to create user (includes validation)
      const newUser = await userService.create(userData);

      // Format response using DTO
      const response = createUserResponse(newUser, "User created successfully");

      // Send successful response with 201 status
      res.status(201).json(response);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }

  /**
   * Updates an existing user's information.
   * 
   * **Route**: PATCH /api/users/:id
   * 
   * This endpoint:
   * 1. Extracts user ID from route parameters
   * 2. Extracts update data from request body
   * 3. Calls service to update the user
   * 4. Returns a 200 response with the updated user
   * 
   * **Request Body** (all fields optional):
   * ```json
   * {
   *   "email": "newemail@example.com",
   *   "firstName": "Jane",
   *   "lastName": "Smith",
   *   "isActive": false
   * }
   * ```
   * 
   * **Success Response (200)**:
   * ```json
   * {
   *   "status": "success",
   *   "data": {
   *     "id": "550e8400-e29b-41d4-a716-446655440000",
   *     "email": "newemail@example.com",
   *     "firstName": "Jane",
   *     "lastName": "Smith",
   *     "isActive": false,
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-02T10:30:00.000Z"
   *   },
   *   "message": "User updated successfully"
   * }
   * ```
   * 
   * @async
   * @param {Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - User UUID
   * @param {Object} req.body - Update data
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Route definition
   * router.patch('/:id', userController.update);
   * 
   * // Request
   * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
   * Content-Type: application/json
   * {
   *   "firstName": "Jane",
   *   "lastName": "Smith"
   * }
   * ```
   */
  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract user ID and update data
      const { id } = req.params;
      const updateData = req.body;

      // Call service to update user
      const updatedUser = await userService.update(id, updateData);

      // Format response using DTO
      const response = createUserResponse(
        updatedUser,
        "User updated successfully"
      );

      // Send successful response
      res.status(200).json(response);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }

  /**
   * Deletes a user from the system.
   * 
   * **Route**: DELETE /api/users/:id
   * 
   * This endpoint:
   * 1. Extracts user ID from route parameters
   * 2. Calls service to delete the user
   * 3. Returns a 200 response confirming deletion
   * 
   * **Success Response (200)**:
   * ```json
   * {
   *   "status": "success",
   *   "message": "User deleted successfully"
   * }
   * ```
   * 
   * **Error Response (404)**:
   * ```json
   * {
   *   "status": "error",
   *   "message": "User with id 550e8400-e29b-41d4-a716-446655440000 not found",
   *   "statusCode": 404
   * }
   * ```
   * 
   * @async
   * @param {Request} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.id - User UUID
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Express next middleware function
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Route definition
   * router.delete('/:id', userController.delete);
   * 
   * // Request
   * DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
   * 
   * // Response (200 OK)
   * {
   *   "status": "success",
   *   "message": "User deleted successfully"
   * }
   * ```
   */
  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Extract user ID
      const { id } = req.params;

      // Call service to delete user
      await userService.delete(id);

      // Send successful response
      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
}

/**
 * Singleton instance of UserController.
 * 
 * This instance is used throughout the application to handle user-related
 * HTTP requests. Using a singleton ensures consistent behavior and makes
 * it easy to inject dependencies if needed in the future.
 * 
 * @constant
 * @type {UserController}
 * 
 * @example
 * ```typescript
 * import { Router } from 'express';
 * import { userController } from './controllers/user.controller';
 * 
 * const router = Router();
 * 
 * // Define routes
 * router.get('/:id', userController.getById);
 * router.get('/', userController.getAll);
 * router.post('/', userController.create);
 * router.patch('/:id', userController.update);
 * router.delete('/:id', userController.delete);
 * 
 * export default router;
 * ```
 */
export const userController = new UserController();