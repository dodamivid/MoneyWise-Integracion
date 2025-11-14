"use strict";
/**
 * @fileoverview Definición del modelo de Usuario con validación de esquema Zod.
 *
 * Este módulo define la estructura de la entidad Usuario para la aplicación Money Wise.
 * Incluye reglas de validación completas usando esquemas Zod y definiciones de
 * tipos TypeScript para seguridad de tipos en tiempo de compilación.
 *
 * El modelo Usuario representa un usuario registrado en la plataforma Money Wise y
 * contiene todos los campos necesarios para autenticación, información de perfil y
 * gestión de cuenta.
 *
 * @module models/user.model
 * @category Models
 *
 * @example
 * ```typescript
 * import { UserSchema, User, CreateUserInput } from './models/user.model';
 *
 * // Validar datos de usuario
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
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserIdSchema = exports.UpdateUserSchema = exports.CreateUserSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
/**
 * Esquema Zod para validar datos de usuario.
 *
 * Este esquema define las reglas de validación para todos los campos de usuario:
 * - **id**: Identificador único (formato UUID v4)
 * - **email**: Debe ser una dirección de correo electrónico válida
 * - **password**: Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
 * - **firstName**: 2-50 caracteres, solo letras y espacios
 * - **lastName**: 2-50 caracteres, solo letras y espacios
 * - **isActive**: Bandera booleana para el estado de la cuenta
 * - **createdAt**: Cadena de fecha ISO 8601
 * - **updatedAt**: Cadena de fecha ISO 8601
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Objeto de usuario válido
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
 * // Lanzará ZodError si la validación falla
 * try {
 *   UserSchema.parse({ email: 'invalid-email' });
 * } catch (error) {
 *   console.error(error.errors);
 * }
 * ```
 */
exports.UserSchema = zod_1.z.object({
    /**
     * Identificador único para el usuario.
     * Debe ser una cadena UUID v4 válida.
     *
     * @example '550e8400-e29b-41d4-a716-446655440000'
     */
    id: zod_1.z.string().uuid({
        message: "El ID de usuario debe ser un UUID válido",
    }),
    /**
     * Dirección de correo electrónico del usuario.
     * Debe ser un formato de correo válido y se almacenará en minúsculas.
     *
     * @example 'user@example.com'
     */
    email: zod_1.z
        .string({
        message: "El correo electrónico es requerido",
    })
        .email({
        message: "Formato de correo electrónico inválido",
    })
        .toLowerCase()
        .trim(),
    /**
     * Contraseña del usuario.
     * Debe tener al menos 8 caracteres y contener:
     * - Al menos una letra mayúscula
     * - Al menos una letra minúscula
     * - Al menos un número
     *
     * @example 'SecurePass123'
     */
    password: zod_1.z
        .string({
        message: "La contraseña es requerida",
    })
        .min(8, {
        message: "La contraseña debe tener al menos 8 caracteres",
    })
        .regex(/[A-Z]/, {
        message: "La contraseña debe contener al menos una letra mayúscula",
    })
        .regex(/[a-z]/, {
        message: "La contraseña debe contener al menos una letra minúscula",
    })
        .regex(/[0-9]/, {
        message: "La contraseña debe contener al menos un número",
    }),
    /**
     * Nombre del usuario.
     * Debe tener entre 2 y 50 caracteres y contener solo letras y espacios.
     * Los espacios al inicio y al final serán eliminados.
     *
     * @example 'John'
     */
    firstName: zod_1.z
        .string({
        message: "El nombre es requerido",
    })
        .min(2, {
        message: "El nombre debe tener al menos 2 caracteres",
    })
        .max(50, {
        message: "El nombre no debe exceder 50 caracteres",
    })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
        message: "El nombre debe contener solo letras y espacios",
    })
        .trim(),
    /**
     * Apellido del usuario.
     * Debe tener entre 2 y 50 caracteres y contener solo letras y espacios.
     * Los espacios al inicio y al final serán eliminados.
     *
     * @example 'Doe'
     */
    lastName: zod_1.z
        .string({
        message: "El apellido es requerido",
    })
        .min(2, {
        message: "El apellido debe tener al menos 2 caracteres",
    })
        .max(50, {
        message: "El apellido no debe exceder 50 caracteres",
    })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
        message: "El apellido debe contener solo letras y espacios",
    })
        .trim(),
    /**
     * Bandera que indica si la cuenta de usuario está activa.
     * Las cuentas inactivas no pueden iniciar sesión ni realizar operaciones.
     *
     * @default true
     */
    isActive: zod_1.z.boolean().default(true),
    /**
     * Marca de tiempo cuando se creó la cuenta de usuario.
     * Se almacena como cadena de fecha ISO 8601.
     *
     * @example '2024-01-01T00:00:00.000Z'
     */
    createdAt: zod_1.z.string().datetime({
        message: "Formato de fecha y hora inválido para createdAt",
    }),
    /**
     * Marca de tiempo cuando se actualizó la cuenta de usuario por última vez.
     * Se almacena como cadena de fecha ISO 8601.
     *
     * @example '2024-01-01T12:30:00.000Z'
     */
    updatedAt: zod_1.z.string().datetime({
        message: "Formato de fecha y hora inválido para updatedAt",
    }),
});
/**
 * Esquema para crear un nuevo usuario.
 *
 * Este esquema omite campos generados por el sistema (id, createdAt, updatedAt)
 * que serán asignados automáticamente al crear un nuevo usuario.
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
exports.CreateUserSchema = exports.UserSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
/**
 * Esquema para actualizar un usuario existente.
 *
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 * Los campos del sistema (id, createdAt) no pueden ser actualizados.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Actualizar solo el correo
 * const updateData: UpdateUserInput = {
 *   email: 'newemail@example.com'
 * };
 *
 * // Actualizar múltiples campos
 * const updateData: UpdateUserInput = {
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 *   isActive: false
 * };
 * ```
 */
exports.UpdateUserSchema = exports.UserSchema.omit({
    id: true,
    createdAt: true,
}).partial();
/**
 * Esquema para validación de ID de usuario.
 *
 * Se usa para validar IDs de usuario en parámetros de ruta.
 *
 * @constant
 * @type {z.ZodString}
 *
 * @example
 * ```typescript
 * const userId = UserIdSchema.parse(req.params.id);
 * ```
 */
exports.UserIdSchema = zod_1.z.string().uuid({
    message: "Formato de ID de usuario inválido. Debe ser un UUID válido.",
});
