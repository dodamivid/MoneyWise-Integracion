/**
 * @fileoverview User service layer containing business logic.
 * 
 * This module implements the Service pattern, providing a layer of business
 * logic between the controllers and the data access layer (repository).
 * It handles validation, error handling, and coordinates operations across
 * multiple repositories if needed.
 * 
 * Key responsibilities:
 * - Business logic enforcement
 * - Input validation using Zod schemas
 * - Error handling and custom error throwing
 * - Coordination between multiple data sources
 * - Transaction-like operations
 * 
 * @module services/user.service
 * @category Services
 * 
 * @example
 * ```typescript
 * import { userService } from './services/user.service';
 * 
 * // Find a user by ID
 * const user = await userService.findById('550e8400-e29b-41d4-a716-446655440000');
 * 
 * // Create a new user
 * const newUser = await userService.create({
 *   email: 'john@example.com',
 *   password: 'SecurePass123',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { userRepository } from "../repositories/User.repository";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserIdSchema,
  CreateUserSchema,
  UpdateUserSchema,
} from "../models/user.model";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
} from "../utils/errors";

/**
 * Service class for user-related business operations.
 * 
 * This class encapsulates all business logic related to users,
 * including validation, error handling, and data manipulation.
 * It acts as an intermediary between controllers and the repository.
 * 
 * @class UserService
 * 
 * @example
 * ```typescript
 * const service = new UserService();
 * 
 * try {
 *   const user = await service.findById(userId);
 *   console.log(user);
 * } catch (error) {
 *   if (error instanceof NotFoundError) {
 *     console.log('User not found');
 *   }
 * }
 * ```
 */
export class UserService {
  /**
   * Finds a user by their unique ID.
   * 
   * This method:
   * 1. Validates the ID format using Zod schema
   * 2. Attempts to find the user in the repository
   * 3. Throws NotFoundError if user doesn't exist
   * 
   * @async
   * @param {string} id - The UUID of the user to find
   * @returns {Promise<User>} The found user
   * @throws {ValidationError} If the ID format is invalid
   * @throws {NotFoundError} If no user with the given ID exists
   * 
   * @example
   * ```typescript
   * try {
   *   const user = await userService.findById('550e8400-e29b-41d4-a716-446655440000');
   *   console.log(`Found user: ${user.email}`);
   * } catch (error) {
   *   if (error instanceof ValidationError) {
   *     console.error('Invalid ID format');
   *   } else if (error instanceof NotFoundError) {
   *     console.error('User does not exist');
   *   }
   * }
   * ```
   */
  async findById(id: string): Promise<User> {
    // Validate ID format
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Invalid user ID format: ${id}`);
    }

    // Attempt to find user
    const user = await userRepository.findById(id);

    // Throw error if not found
    if (!user) {
      throw new NotFoundError("User", id);
    }

    return user;
  }

  /**
   * Finds a user by their email address.
   * 
   * This method searches for a user with the specified email address.
   * Email comparison is case-insensitive.
   * 
   * @async
   * @param {string} email - The email address to search for
   * @returns {Promise<User>} The found user
   * @throws {ValidationError} If the email format is invalid
   * @throws {NotFoundError} If no user with the given email exists
   * 
   * @example
   * ```typescript
   * try {
   *   const user = await userService.findByEmail('john.doe@example.com');
   *   console.log(`Found user: ${user.firstName} ${user.lastName}`);
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.error('No user found with this email');
   *   }
   * }
   * ```
   */
  async findByEmail(email: string): Promise<User> {
    // Basic email validation
    if (!email || !email.includes("@")) {
      throw new ValidationError("Invalid email format");
    }

    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundError("User with email " + email);
    }

    return user;
  }

  /**
   * Retrieves all users from the system.
   * 
   * This method returns all registered users. In a production system,
   * this would typically include pagination, filtering, and sorting options.
   * 
   * @async
   * @returns {Promise<User[]>} Array of all users
   * 
   * @example
   * ```typescript
   * const allUsers = await userService.findAll();
   * console.log(`Total users: ${allUsers.length}`);
   * 
   * allUsers.forEach(user => {
   *   console.log(`${user.firstName} ${user.lastName} - ${user.email}`);
   * });
   * ```
   */
  async findAll(): Promise<User[]> {
    return userRepository.findAll();
  }

  /**
   * Creates a new user in the system.
   * 
   * This method:
   * 1. Validates input data using Zod schema
   * 2. Checks if email is already in use
   * 3. Creates the user in the repository
   * 4. Returns the created user
   * 
   * **Note**: In a production system, you would hash the password before storing.
   * 
   * @async
   * @param {CreateUserInput} userData - The user data for creation
   * @returns {Promise<User>} The created user
   * @throws {ValidationError} If input data is invalid
   * @throws {BadRequestError} If email is already in use
   * 
   * @example
   * ```typescript
   * try {
   *   const newUser = await userService.create({
   *     email: 'john.doe@example.com',
   *     password: 'SecurePass123',
   *     firstName: 'John',
   *     lastName: 'Doe',
   *     isActive: true
   *   });
   *   console.log(`User created with ID: ${newUser.id}`);
   * } catch (error) {
   *   if (error instanceof ValidationError) {
   *     console.error('Invalid user data:', error.message);
   *   } else if (error instanceof BadRequestError) {
   *     console.error('Email already in use');
   *   }
   * }
   * ```
   */
  async create(userData: CreateUserInput): Promise<User> {
    // Validate input data
    try {
      CreateUserSchema.parse(userData);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Invalid user data"
      );
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestError(
        `User with email ${userData.email} already exists`
      );
    }

    // Create user
    // Note: In production, hash the password before storing
    // const hashedPassword = await hashPassword(userData.password);
    // userData.password = hashedPassword;

    return userRepository.create(userData);
  }

  /**
   * Updates an existing user's information.
   * 
   * This method:
   * 1. Validates the user ID
   * 2. Validates the update data
   * 3. Checks if user exists
   * 4. If email is being changed, verifies it's not in use
   * 5. Updates the user
   * 
   * @async
   * @param {string} id - The UUID of the user to update
   * @param {UpdateUserInput} updateData - The fields to update
   * @returns {Promise<User>} The updated user
   * @throws {ValidationError} If ID or update data is invalid
   * @throws {NotFoundError} If user doesn't exist
   * @throws {BadRequestError} If email is already in use
   * 
   * @example
   * ```typescript
   * try {
   *   const updated = await userService.update(userId, {
   *     firstName: 'Jane',
   *     lastName: 'Smith'
   *   });
   *   console.log('User updated successfully');
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.error('User not found');
   *   } else if (error instanceof ValidationError) {
   *     console.error('Invalid update data');
   *   }
   * }
   * ```
   */
  async update(id: string, updateData: UpdateUserInput): Promise<User> {
    // Validate ID format
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Invalid user ID format: ${id}`);
    }

    // Validate update data
    try {
      UpdateUserSchema.parse(updateData);
    } catch (error: any) {
      throw new ValidationError(
        error.errors?.map((e: any) => e.message).join(", ") ||
          "Invalid update data"
      );
    }

    // Check if user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User", id);
    }

    // If email is being changed, check it's not already in use
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailInUse = await userRepository.findByEmail(updateData.email);
      if (emailInUse) {
        throw new BadRequestError(
          `Email ${updateData.email} is already in use`
        );
      }
    }

    // Update user
    const updatedUser = await userRepository.update(id, updateData);

    // This should never be null due to the existence check above,
    // but TypeScript requires handling the null case
    if (!updatedUser) {
      throw new NotFoundError("User", id);
    }

    return updatedUser;
  }

  /**
   * Deletes a user from the system.
   * 
   * This is a hard delete that permanently removes the user.
   * In a production system, you might want to implement soft deletes
   * (setting isActive = false) instead.
   * 
   * @async
   * @param {string} id - The UUID of the user to delete
   * @returns {Promise<void>}
   * @throws {ValidationError} If ID format is invalid
   * @throws {NotFoundError} If user doesn't exist
   * 
   * @example
   * ```typescript
   * try {
   *   await userService.delete(userId);
   *   console.log('User deleted successfully');
   * } catch (error) {
   *   if (error instanceof NotFoundError) {
   *     console.error('User not found');
   *   }
   * }
   * ```
   */
  async delete(id: string): Promise<void> {
    // Validate ID format
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Invalid user ID format: ${id}`);
    }

    // Attempt to delete
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError("User", id);
    }
  }

  /**
   * Checks if a user with the given ID exists.
   * 
   * This is useful for validation purposes without fetching the full user object.
   * 
   * @async
   * @param {string} id - The UUID to check
   * @returns {Promise<boolean>} True if user exists, false otherwise
   * @throws {ValidationError} If ID format is invalid
   * 
   * @example
   * ```typescript
   * const exists = await userService.exists(userId);
   * 
   * if (exists) {
   *   console.log('User exists');
   * } else {
   *   console.log('User does not exist');
   * }
   * ```
   */
  async exists(id: string): Promise<boolean> {
    // Validate ID format
    try {
      UserIdSchema.parse(id);
    } catch (error) {
      throw new ValidationError(`Invalid user ID format: ${id}`);
    }

    return userRepository.exists(id);
  }

  /**
   * Gets the total count of users in the system.
   * 
   * Useful for pagination, statistics, and administrative dashboards.
   * 
   * @async
   * @returns {Promise<number>} The total number of users
   * 
   * @example
   * ```typescript
   * const totalUsers = await userService.count();
   * console.log(`Total registered users: ${totalUsers}`);
   * ```
   */
  async count(): Promise<number> {
    return userRepository.count();
  }
}

/**
 * Singleton instance of UserService.
 * 
 * This ensures consistent service usage across the application.
 * In larger applications, you might use dependency injection instead.
 * 
 * @constant
 * @type {UserService}
 * 
 * @example
 * ```typescript
 * import { userService } from './services/user.service';
 * 
 * const user = await userService.findById(userId);
 * ```
 */
export const userService = new UserService();