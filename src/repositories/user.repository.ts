/**
 * @fileoverview In-memory repository for User data management.
 * 
 * This module provides a data access layer for User entities using an in-memory
 * storage mechanism. It implements the Repository pattern to abstract data
 * persistence logic from business logic.
 * 
 * Key features:
 * - In-memory storage using Map for O(1) lookups
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - UUID generation for unique user IDs
 * - Automatic timestamp management
 * - Email uniqueness validation
 * - Thread-safe operations
 * 
 * **Note**: This implementation uses in-memory storage and will lose all data
 * when the application restarts. In production, this should be replaced with
 * a persistent storage solution (e.g., MySQL, PostgreSQL).
 * 
 * @module repositories/user.repository
 * @category Repositories
 * 
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 * 
 * // Create a new user
 * const user = await userRepository.create({
 *   email: 'john@example.com',
 *   password: 'hashedPassword',
 *   firstName: 'John',
 *   lastName: 'Doe'
 * });
 * 
 * // Find user by ID
 * const foundUser = await userRepository.findById(user.id);
 * 
 * // Find user by email
 * const userByEmail = await userRepository.findByEmail('john@example.com');
 * ```
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { randomUUID } from "crypto";
import { User, CreateUserInput, UpdateUserInput } from "../models/user.model";

/**
 * Repository class for managing User entities in memory.
 * 
 * This class implements the Repository pattern, providing a clean interface
 * for data operations. It uses a Map for efficient O(1) lookups by ID.
 * 
 * @class UserRepository
 * 
 * @example
 * ```typescript
 * const repository = new UserRepository();
 * 
 * // Create users
 * const user1 = await repository.create({
 *   email: 'user1@example.com',
 *   password: 'hashedPass1',
 *   firstName: 'User',
 *   lastName: 'One'
 * });
 * 
 * // Get all users
 * const allUsers = await repository.findAll();
 * ```
 */
export class UserRepository {
  /**
   * In-memory storage for users, using UUID as the key.
   * 
   * Using a Map provides O(1) time complexity for lookups, inserts, and deletes.
   * 
   * @private
   * @type {Map<string, User>}
   */
  private users: Map<string, User> = new Map();

  /**
   * Creates a new user and stores it in memory.
   * 
   * This method:
   * 1. Validates that the email is not already in use
   * 2. Generates a unique UUID for the user
   * 3. Sets creation and update timestamps
   * 4. Stores the user in the repository
   * 
   * @async
   * @param {CreateUserInput} userData - The user data for creation
   * @returns {Promise<User>} The created user with generated ID and timestamps
   * @throws {Error} If a user with the given email already exists
   * 
   * @example
   * ```typescript
   * const newUser = await userRepository.create({
   *   email: 'john.doe@example.com',
   *   password: 'hashedPassword123',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   isActive: true
   * });
   * 
   * console.log(newUser.id); // '550e8400-e29b-41d4-a716-446655440000'
   * console.log(newUser.createdAt); // '2024-01-01T00:00:00.000Z'
   * ```
   */
  async create(userData: CreateUserInput): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(`User with email ${userData.email} already exists`);
    }

    // Generate unique ID and timestamps
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      ...userData,
      isActive: userData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    // Store user in memory
    this.users.set(user.id, user);
    return user;
  }

  /**
   * Finds a user by their unique ID.
   * 
   * This is the most efficient lookup operation with O(1) time complexity.
   * 
   * @async
   * @param {string} id - The UUID of the user to find
   * @returns {Promise<User | null>} The user if found, null otherwise
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findById('550e8400-e29b-41d4-a716-446655440000');
   * 
   * if (user) {
   *   console.log(`Found user: ${user.email}`);
   * } else {
   *   console.log('User not found');
   * }
   * ```
   */
  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ?? null;
  }

  /**
   * Finds a user by their email address.
   * 
   * This operation has O(n) time complexity as it requires iterating
   * through all users. In a production database, this would typically
   * use an index on the email field for better performance.
   * 
   * @async
   * @param {string} email - The email address to search for
   * @returns {Promise<User | null>} The user if found, null otherwise
   * 
   * @example
   * ```typescript
   * const user = await userRepository.findByEmail('john.doe@example.com');
   * 
   * if (user) {
   *   console.log(`Found user with ID: ${user.id}`);
   * } else {
   *   console.log('No user found with this email');
   * }
   * ```
   */
  async findByEmail(email: string): Promise<User | null> {
    // Normalize email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();

    // Search through all users
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }

    return null;
  }

  /**
   * Retrieves all users from the repository.
   * 
   * Returns an array of all stored users. In a production system,
   * this would typically include pagination parameters.
   * 
   * @async
   * @returns {Promise<User[]>} Array of all users
   * 
   * @example
   * ```typescript
   * const allUsers = await userRepository.findAll();
   * console.log(`Total users: ${allUsers.length}`);
   * 
   * allUsers.forEach(user => {
   *   console.log(`${user.firstName} ${user.lastName} - ${user.email}`);
   * });
   * ```
   */
  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  /**
   * Updates an existing user's information.
   * 
   * This method:
   * 1. Validates that the user exists
   * 2. Checks email uniqueness if email is being changed
   * 3. Merges the update data with existing user data
   * 4. Updates the updatedAt timestamp
   * 
   * @async
   * @param {string} id - The UUID of the user to update
   * @param {UpdateUserInput} updateData - The fields to update
   * @returns {Promise<User | null>} The updated user if found, null otherwise
   * @throws {Error} If trying to change email to one that's already in use
   * 
   * @example
   * ```typescript
   * // Update user's first name only
   * const updated = await userRepository.update(userId, {
   *   firstName: 'Jane'
   * });
   * 
   * // Update multiple fields
   * const updated = await userRepository.update(userId, {
   *   firstName: 'Jane',
   *   lastName: 'Smith',
   *   email: 'jane.smith@example.com'
   * });
   * 
   * if (updated) {
   *   console.log('User updated successfully');
   * } else {
   *   console.log('User not found');
   * }
   * ```
   */
  async update(
    id: string,
    updateData: UpdateUserInput
  ): Promise<User | null> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      return null;
    }

    // If email is being changed, check it's not already in use
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailInUse = await this.findByEmail(updateData.email);
      if (emailInUse) {
        throw new Error(`Email ${updateData.email} is already in use`);
      }
    }

    // Merge update data with existing user data
    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // Update in storage
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Deletes a user from the repository.
   * 
   * This is a hard delete operation that permanently removes the user
   * from storage. In a production system, you might want to implement
   * soft deletes instead (setting isActive = false).
   * 
   * @async
   * @param {string} id - The UUID of the user to delete
   * @returns {Promise<boolean>} True if user was deleted, false if not found
   * 
   * @example
   * ```typescript
   * const wasDeleted = await userRepository.delete(userId);
   * 
   * if (wasDeleted) {
   *   console.log('User deleted successfully');
   * } else {
   *   console.log('User not found');
   * }
   * ```
   */
  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  /**
   * Gets the total count of users in the repository.
   * 
   * Useful for pagination and statistics.
   * 
   * @async
   * @returns {Promise<number>} The total number of users
   * 
   * @example
   * ```typescript
   * const count = await userRepository.count();
   * console.log(`Total users in system: ${count}`);
   * ```
   */
  async count(): Promise<number> {
    return this.users.size;
  }

  /**
   * Checks if a user with the given ID exists.
   * 
   * This is more efficient than findById when you only need to check
   * existence without retrieving the full user object.
   * 
   * @async
   * @param {string} id - The UUID to check
   * @returns {Promise<boolean>} True if user exists, false otherwise
   * 
   * @example
   * ```typescript
   * const exists = await userRepository.exists(userId);
   * 
   * if (exists) {
   *   console.log('User exists');
   * } else {
   *   console.log('User does not exist');
   * }
   * ```
   */
  async exists(id: string): Promise<boolean> {
    return this.users.has(id);
  }

  /**
   * Clears all users from the repository.
   * 
   * **WARNING**: This operation is destructive and cannot be undone.
   * Should only be used for testing or development purposes.
   * 
   * @async
   * @returns {Promise<void>}
   * 
   * @example
   * ```typescript
   * // Use in tests to reset state between test cases
   * afterEach(async () => {
   *   await userRepository.clear();
   * });
   * ```
   */
  async clear(): Promise<void> {
    this.users.clear();
  }
}

/**
 * Singleton instance of UserRepository.
 * 
 * This ensures that all parts of the application use the same
 * in-memory data store. In a production application with a real database,
 * you might use dependency injection instead.
 * 
 * @constant
 * @type {UserRepository}
 * 
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 * 
 * // Use the singleton instance
 * const user = await userRepository.findById(userId);
 * ```
 */
export const userRepository = new UserRepository();