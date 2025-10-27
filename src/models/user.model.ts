/**
 * @fileoverview User model definition with Zod schema validation.
 * 
 * This module defines the User entity structure for the Money Wise application.
 * It includes comprehensive validation rules using Zod schemas and TypeScript
 * type definitions for compile-time type safety.
 * 
 * The User model represents a registered user in the Money Wise platform and
 * contains all necessary fields for authentication, profile information, and
 * account management.
 * 
 * @module models/user.model
 * @category Models
 * 
 * @example
 * ```typescript
 * import { UserSchema, User, CreateUserInput } from './models/user.model';
 * 
 * // Validate user data
 * const userData: CreateUserInput = {
 *   email: 'user@example.com',
 *   password: 'SecurePass123!',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * };
 * 
 * const validatedData = UserSchema.parse(userData);
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { z } from "zod";

/**
 * Zod schema for validating user data.
 * 
 * This schema defines the validation rules for all user fields:
 * - **id**: Unique identifier (UUID v4 format)
 * - **email**: Must be a valid email address
 * - **password**: Minimum 8 characters, at least one uppercase, one lowercase, and one number
 * - **firstName**: 2-50 characters, only letters and spaces
 * - **lastName**: 2-50 characters, only letters and spaces
 * - **isActive**: Boolean flag for account status
 * - **createdAt**: ISO 8601 date string
 * - **updatedAt**: ISO 8601 date string
 * 
 * @constant
 * @type {z.ZodObject}
 * 
 * @example
 * ```typescript
 * // Valid user object
 * const user = UserSchema.parse({
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   email: 'john.doe@example.com',
 *   password: 'SecurePass123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true,
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-01T00:00:00.000Z'
 * });
 * 
 * // Will throw ZodError if validation fails
 * try {
 *   UserSchema.parse({ email: 'invalid-email' });
 * } catch (error) {
 *   console.error(error.errors);
 * }
 * ```
 */
export const UserSchema = z.object({
  /**
   * Unique identifier for the user.
   * Must be a valid UUID v4 string.
   * 
   * @example '550e8400-e29b-41d4-a716-446655440000'
   */
  id: z.string().uuid({
    message: "User ID must be a valid UUID",
  }),

  /**
   * User's email address.
   * Must be a valid email format and will be stored in lowercase.
   * 
   * @example 'user@example.com'
   */
  email: z
    .string({
      message: "Email is required",
    })
    .email({
      message: "Invalid email format",
    })
    .toLowerCase()
    .trim(),

  /**
   * User's password.
   * Must be at least 8 characters long and contain:
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * 
   * @example 'SecurePass123'
   */
  password: z
    .string({
      message: "Password is required",
    })
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must contain at least one number",
    }),

  /**
   * User's first name.
   * Must be between 2 and 50 characters and contain only letters and spaces.
   * Leading and trailing whitespace will be removed.
   * 
   * @example 'John'
   */
  firstName: z
    .string({
      message: "First name is required",
    })
    .min(2, {
      message: "First name must be at least 2 characters long",
    })
    .max(50, {
      message: "First name must not exceed 50 characters",
    })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "First name must contain only letters and spaces",
    })
    .trim(),

  /**
   * User's last name.
   * Must be between 2 and 50 characters and contain only letters and spaces.
   * Leading and trailing whitespace will be removed.
   * 
   * @example 'Doe'
   */
  lastName: z
    .string({
      message: "Last name is required",
    })
    .min(2, {
      message: "Last name must be at least 2 characters long",
    })
    .max(50, {
      message: "Last name must not exceed 50 characters",
    })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "Last name must contain only letters and spaces",
    })
    .trim(),

  /**
   * Flag indicating whether the user account is active.
   * Inactive accounts cannot log in or perform operations.
   * 
   * @default true
   */
  isActive: z.boolean().default(true),

  /**
   * Timestamp when the user account was created.
   * Stored as ISO 8601 date string.
   * 
   * @example '2024-01-01T00:00:00.000Z'
   */
  createdAt: z.string().datetime({
    message: "Invalid datetime format for createdAt",
  }),

  /**
   * Timestamp when the user account was last updated.
   * Stored as ISO 8601 date string.
   * 
   * @example '2024-01-01T12:30:00.000Z'
   */
  updatedAt: z.string().datetime({
    message: "Invalid datetime format for updatedAt",
  }),
});

/**
 * TypeScript type inferred from UserSchema.
 * 
 * This type represents a complete user object with all fields.
 * Use this type when working with full user data.
 * 
 * @typedef {Object} User
 * @property {string} id - Unique identifier (UUID)
 * @property {string} email - User's email address
 * @property {string} password - User's hashed password
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {boolean} isActive - Account active status
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * 
 * @example
 * ```typescript
 * const user: User = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   email: 'john.doe@example.com',
 *   password: 'hashedPassword123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true,
 *   createdAt: '2024-01-01T00:00:00.000Z',
 *   updatedAt: '2024-01-01T00:00:00.000Z'
 * };
 * ```
 */
export type User = z.infer<typeof UserSchema>;

/**
 * Schema for creating a new user.
 * 
 * This schema omits system-generated fields (id, createdAt, updatedAt)
 * that will be automatically assigned when creating a new user.
 * 
 * @constant
 * @type {z.ZodObject}
 * 
 * @example
 * ```typescript
 * const newUser: CreateUserInput = {
 *   email: 'new.user@example.com',
 *   password: 'SecurePass123',
 *   firstName: 'Jane',
 *   lastName: 'Smith'
 * };
 * 
 * const validated = CreateUserSchema.parse(newUser);
 * ```
 */
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * TypeScript type for user creation input.
 * 
 * This type represents the data needed to create a new user,
 * excluding system-generated fields.
 * 
 * @typedef {Object} CreateUserInput
 * @property {string} email - User's email address
 * @property {string} password - User's password (plain text, will be hashed)
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {boolean} [isActive] - Account active status (optional, defaults to true)
 * 
 * @example
 * ```typescript
 * const createUserData: CreateUserInput = {
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   isActive: true
 * };
 * ```
 */
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Schema for updating an existing user.
 * 
 * All fields are optional to allow partial updates.
 * System fields (id, createdAt) cannot be updated.
 * 
 * @constant
 * @type {z.ZodObject}
 * 
 * @example
 * ```typescript
 * // Update only email
 * const updateData: UpdateUserInput = {
 *   email: 'newemail@example.com'
 * };
 * 
 * // Update multiple fields
 * const updateData: UpdateUserInput = {
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 *   isActive: false
 * };
 * ```
 */
export const UpdateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
}).partial();

/**
 * TypeScript type for user update input.
 * 
 * All fields are optional, allowing for partial updates
 * of user information.
 * 
 * @typedef {Object} UpdateUserInput
 * @property {string} [email] - New email address
 * @property {string} [password] - New password
 * @property {string} [firstName] - New first name
 * @property {string} [lastName] - New last name
 * @property {boolean} [isActive] - New active status
 * @property {string} [updatedAt] - Update timestamp (set automatically)
 * 
 * @example
 * ```typescript
 * const updateData: UpdateUserInput = {
 *   firstName: 'John',
 *   email: 'john.new@example.com'
 * };
 * ```
 */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Schema for user ID validation.
 * 
 * Used for validating user IDs in route parameters.
 * 
 * @constant
 * @type {z.ZodString}
 * 
 * @example
 * ```typescript
 * const userId = UserIdSchema.parse(req.params.id);
 * ```
 */
export const UserIdSchema = z.string().uuid({
  message: "Invalid user ID format. Must be a valid UUID.",
});

/**
 * Type for validated user IDs.
 * 
 * @typedef {string} UserId
 * 
 * @example
 * ```typescript
 * const userId: UserId = '550e8400-e29b-41d4-a716-446655440000';
 * ```
 */
export type UserId = z.infer<typeof UserIdSchema>;