/**
 * @fileoverview User routes definition for the Money Wise API.
 * 
 * This module defines all HTTP routes related to user operations.
 * It uses Express Router to organize endpoints and maps them to
 * the appropriate controller methods.
 * 
 * All routes are mounted under the `/api/users` base path as defined
 * in the main application file (index.ts).
 * 
 * **Available Endpoints**:
 * - `GET /api/users/:id` - Get a single user by ID
 * - `GET /api/users` - Get all users
 * - `POST /api/users` - Create a new user
 * - `PATCH /api/users/:id` - Update a user
 * - `DELETE /api/users/:id` - Delete a user
 * 
 * @module routes/users.routes
 * @category Routes
 * 
 * @example
 * ```typescript
 * // In index.ts
 * import usersRouter from './routes/users.routes';
 * 
 * app.use('/api/users', usersRouter);
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { Router } from "express";
import { userController } from "../controllers/user.controller";

/**
 * Express router instance for user-related routes.
 * 
 * This router handles all user CRUD operations and is mounted
 * under the `/api/users` path in the main application.
 * 
 * @constant
 * @type {Router}
 */
const router = Router();

/**
 * @route GET /api/users/:id
 * @group Users - Operations related to users
 * @summary Get a user by ID
 * @description Retrieves a single user's information by their unique UUID.
 * 
 * @param {string} id.path.required - User UUID - eg: 550e8400-e29b-41d4-a716-446655440000
 * 
 * @returns {UserResponseDTO} 200 - User found successfully
 * @returns {ErrorResponseDTO} 400 - Invalid user ID format
 * @returns {ErrorResponseDTO} 404 - User not found
 * @returns {ErrorResponseDTO} 500 - Internal server error
 * 
 * @example
 * // Request
 * GET /api/users/550e8400-e29b-41d4-a716-446655440000
 * 
 * // Success Response (200)
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
 * 
 * // Error Response (404)
 * {
 *   "status": "error",
 *   "message": "User with id 550e8400-e29b-41d4-a716-446655440000 not found",
 *   "statusCode": 404
 * }
 */
router.get("/:id", userController.getById);

/**
 * @route GET /api/users
 * @group Users - Operations related to users
 * @summary Get all users
 * @description Retrieves a list of all registered users in the system.
 * 
 * **Note**: In a production system, this endpoint would typically include
 * query parameters for pagination, filtering, and sorting.
 * 
 * @returns {UsersResponseDTO} 200 - Users retrieved successfully
 * @returns {ErrorResponseDTO} 500 - Internal server error
 * 
 * @example
 * // Request
 * GET /api/users
 * 
 * // Success Response (200)
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
 */
router.get("/", userController.getAll);

/**
 * @route POST /api/users
 * @group Users - Operations related to users
 * @summary Create a new user
 * @description Creates a new user account in the system.
 * 
 * All fields except `isActive` are required. The password will be stored
 * as provided (in production, it should be hashed).
 * 
 * @param {CreateUserInput} body.body.required - User creation data
 * 
 * @returns {UserResponseDTO} 201 - User created successfully
 * @returns {ErrorResponseDTO} 400 - Invalid input data or email already exists
 * @returns {ErrorResponseDTO} 500 - Internal server error
 * 
 * @example
 * // Request
 * POST /api/users
 * Content-Type: application/json
 * {
 *   "email": "john.doe@example.com",
 *   "password": "SecurePass123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "isActive": true
 * }
 * 
 * // Success Response (201)
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
 * 
 * // Error Response (400) - Email already exists
 * {
 *   "status": "error",
 *   "message": "User with email john.doe@example.com already exists",
 *   "statusCode": 400
 * }
 * 
 * // Error Response (400) - Validation error
 * {
 *   "status": "error",
 *   "message": "Password must be at least 8 characters long, Password must contain at least one uppercase letter",
 *   "statusCode": 400
 * }
 */
router.post("/", userController.create);

/**
 * @route PATCH /api/users/:id
 * @group Users - Operations related to users
 * @summary Update a user
 * @description Updates an existing user's information. All fields are optional.
 * 
 * You can update any combination of fields. If the email is being changed,
 * the system will verify that it's not already in use by another user.
 * 
 * @param {string} id.path.required - User UUID
 * @param {UpdateUserInput} body.body.required - User update data (all fields optional)
 * 
 * @returns {UserResponseDTO} 200 - User updated successfully
 * @returns {ErrorResponseDTO} 400 - Invalid input data or email already in use
 * @returns {ErrorResponseDTO} 404 - User not found
 * @returns {ErrorResponseDTO} 500 - Internal server error
 * 
 * @example
 * // Request - Update single field
 * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
 * Content-Type: application/json
 * {
 *   "firstName": "Jane"
 * }
 * 
 * // Request - Update multiple fields
 * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
 * Content-Type: application/json
 * {
 *   "firstName": "Jane",
 *   "lastName": "Smith",
 *   "email": "jane.smith@example.com"
 * }
 * 
 * // Success Response (200)
 * {
 *   "status": "success",
 *   "data": {
 *     "id": "550e8400-e29b-41d4-a716-446655440000",
 *     "email": "jane.smith@example.com",
 *     "firstName": "Jane",
 *     "lastName": "Smith",
 *     "isActive": true,
 *     "createdAt": "2024-01-01T00:00:00.000Z",
 *     "updatedAt": "2024-01-02T10:30:00.000Z"
 *   },
 *   "message": "User updated successfully"
 * }
 */
router.patch("/:id", userController.update);

/**
 * @route DELETE /api/users/:id
 * @group Users - Operations related to users
 * @summary Delete a user
 * @description Permanently deletes a user from the system.
 * 
 * **Warning**: This is a hard delete operation and cannot be undone.
 * In a production system, you might want to implement soft deletes
 * (setting isActive = false) instead.
 * 
 * @param {string} id.path.required - User UUID
 * 
 * @returns {Object} 200 - User deleted successfully
 * @returns {ErrorResponseDTO} 400 - Invalid user ID format
 * @returns {ErrorResponseDTO} 404 - User not found
 * @returns {ErrorResponseDTO} 500 - Internal server error
 * 
 * @example
 * // Request
 * DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
 * 
 * // Success Response (200)
 * {
 *   "status": "success",
 *   "message": "User deleted successfully"
 * }
 * 
 * // Error Response (404)
 * {
 *   "status": "error",
 *   "message": "User with id 550e8400-e29b-41d4-a716-446655440000 not found",
 *   "statusCode": 404
 * }
 */
router.delete("/:id", userController.delete);

/**
 * Export the configured router.
 * 
 * This router should be mounted in the main application file using:
 * `app.use('/api/users', usersRouter);`
 */
export default router;