"use strict";
/**
 * @fileoverview Datos semilla para pruebas de la API de Money Wise.
 *
 * Este archivo proporciona usuarios de ejemplo que pueden usarse para poblar
 * la base de datos en memoria con fines de prueba.
 *
 * @module config/seed.data
 * @category Config
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCredentials = exports.sampleUsers = void 0;
exports.seedDatabase = seedDatabase;
/**
 * Usuarios de ejemplo para pruebas y desarrollo.
 *
 * Estos usuarios pueden insertarse en la base de datos para probar
 * diversos escenarios y endpoints.
 *
 * @constant
 * @type {CreateUserInput[]}
 */
exports.sampleUsers = [
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
 * Función para sembrar la base de datos con usuarios de ejemplo.
 *
 * Esta función puede llamarse para poblar el repositorio
 * con datos de prueba para desarrollo y testing.
 *
 * @async
 * @param {UserRepository} repository - El repositorio de usuarios a sembrar
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * import { userRepository } from './repositories/user.repository';
 * import { seedDatabase } from './config/seed.data';
 *
 * // Sembrar la base de datos
 * await seedDatabase(userRepository);
 * console.log('Base de datos sembrada con usuarios de ejemplo');
 * ```
 */
async function seedDatabase(repository) {
    console.log("Sembrando base de datos con usuarios de ejemplo...");
    for (const userData of exports.sampleUsers) {
        try {
            await repository.create(userData);
            console.log(`✓ Usuario creado: ${userData.email}`);
        }
        catch (error) {
            console.log(`✗ El usuario ya existe: ${userData.email}`);
        }
    }
    console.log("¡Sembrado de base de datos completado!");
}
/**
 * Credenciales de usuarios de prueba para testing manual.
 *
 * Usa estas credenciales para probar la funcionalidad de inicio de sesión
 * u otras características relacionadas con la autenticación.
 */
exports.testCredentials = {
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
