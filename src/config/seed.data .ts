/**
 * @fileoverview Seed data for testing the Money Wise API.
 * 
 * This file provides sample users that can be used to populate
 * the in-memory database for testing purposes.
 * 
 * @module config/seed.data
 * @category Config
 * 
 * @author Money Wise Integration Team
 * @version 1.0.0
 */

import { CreateUserInput } from "../models/user.model";

/**
 * Sample users for testing and development.
 * 
 * These users can be inserted into the database to test
 * various scenarios and endpoints.
 * 
 * @constant
 * @type {CreateUserInput[]}
 */
export const sampleUsers: CreateUserInput[] = [
  {
    email: "john.doe@example.com",
    password: "Password123",
    firstName: "John",
    lastName: "Doe",
    isActive: true,
  },
  {
    email: "jane.smith@example.com",
    password: "SecurePass456",
    firstName: "Jane",
    lastName: "Smith",
    isActive: true,
  },
  {
    email: "bob.johnson@example.com",
    password: "BobPass789",
    firstName: "Bob",
    lastName: "Johnson",
    isActive: false,
  },
  {
    email: "alice.williams@example.com",
    password: "AlicePass012",
    firstName: "Alice",
    lastName: "Williams",
    isActive: true,
  },
  {
    email: "charlie.brown@example.com",
    password: "CharliePass345",
    firstName: "Charlie",
    lastName: "Brown",
    isActive: true,
  },
];

/**
 * Function to seed the database with sample users.
 * 
 * This function can be called to populate the repository
 * with test data for development and testing.
 * 
 * @async
 * @param {UserRepository} repository - The user repository to seed
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 * import { seedDatabase } from './config/seed.data';
 * 
 * // Seed the database
 * await seedDatabase(userRepository);
 * console.log('Database seeded with sample users');
 * ```
 */
export async function seedDatabase(repository: any): Promise<void> {
  console.log("Seeding database with sample users...");

  for (const userData of sampleUsers) {
    try {
      await repository.create(userData);
      console.log(`✓ Created user: ${userData.email}`);
    } catch (error: any) {
      console.log(`✗ User already exists: ${userData.email}`);
    }
  }

  console.log("Database seeding completed!");
}

/**
 * Test user credentials for manual testing.
 * 
 * Use these credentials to test login functionality
 * or other authentication-related features.
 */
export const testCredentials = {
  admin: {
    email: "john.doe@example.com",
    password: "Password123",
  },
  regularUser: {
    email: "jane.smith@example.com",
    password: "SecurePass456",
  },
  inactiveUser: {
    email: "bob.johnson@example.com",
    password: "BobPass789",
  },
};