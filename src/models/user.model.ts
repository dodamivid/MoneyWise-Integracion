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
 * **NOTA**: Este modelo usa nomenclatura en español según especificación API v1.
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
 *   correo: 'user@example.com',
 *   contrasena: 'SecurePass123!',
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-05-20'
 * };
 *
 * const validatedData = UserSchema.parse(userData);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 2.0.0
 */

import { z } from "zod";

/**
 * Esquema Zod para validar datos de usuario.
 *
 * Este esquema define las reglas de validación para todos los campos de usuario:
 * - **usuarioId**: Identificador único (número entero)
 * - **correo**: Debe ser una dirección de correo electrónico válida
 * - **contrasena**: Mínimo 8 caracteres, mayúscula, minúscula, número y símbolo
 * - **nombre**: 2-80 caracteres, solo letras y espacios
 * - **apellidoP**: 2-80 caracteres, solo letras y espacios (apellido paterno)
 * - **apellidoM**: 2-80 caracteres, solo letras y espacios (apellido materno)
 * - **fechaN**: Fecha de nacimiento (formato YYYY-MM-DD), usuario debe tener mínimo 16 años
 * - **activo**: Bandera booleana para el estado de la cuenta
 * - **creadoEn**: Cadena de fecha ISO 8601
 * - **actualizadoEn**: Cadena de fecha ISO 8601
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Objeto de usuario válido
 * const user = UserSchema.parse({
 *   usuarioId: 1,
 *   correo: 'juan.perez@example.com',
 *   contrasena: 'SecurePass123!',
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-05-20',
 *   activo: true,
 *   creadoEn: '2024-01-01T00:00:00.000Z',
 *   actualizadoEn: '2024-01-01T00:00:00.000Z'
 * });
 * ```
 */
export const UserSchema = z.object({
  /**
   * Identificador único para el usuario.
   * Debe ser un número entero positivo.
   *
   * @example 1
   */
  usuarioId: z.number().int().positive({
    message: "El ID de usuario debe ser un número entero positivo",
  }),

  /**
   * Dirección de correo electrónico del usuario.
   * Debe ser un formato de correo válido y se almacenará en minúsculas.
   *
   * @example 'usuario@example.com'
   */
  correo: z
    .string({
      message: "El correo electrónico es requerido",
    })
    .email({
      message: "Formato de correo electrónico inválido",
    })
    .toLowerCase()
    .trim(),

  /**
   * Contraseña del usuario (almacenada como hash bcrypt).
   * Debe tener al menos 8 caracteres y contener:
   * - Al menos una letra mayúscula
   * - Al menos una letra minúscula
   * - Al menos un número
   * - Al menos un símbolo especial
   *
   * @example 'SecurePass123!'
   */
  contrasena: z
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
    })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
      message: "La contraseña debe contener al menos un símbolo especial",
    }),

  /**
   * Nombre del usuario.
   * Debe tener entre 2 y 80 caracteres y contener solo letras y espacios.
   * Se normalizará (trim y capitalización).
   *
   * @example 'Juan'
   */
  nombre: z
    .string({
      message: "El nombre es requerido",
    })
    .min(2, {
      message: "El nombre debe tener al menos 2 caracteres",
    })
    .max(80, {
      message: "El nombre no debe exceder 80 caracteres",
    })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "El nombre debe contener solo letras y espacios",
    })
    .trim(),

  /**
   * Apellido paterno del usuario.
   * Debe tener entre 2 y 80 caracteres y contener solo letras y espacios.
   * Se normalizará (trim y capitalización).
   *
   * @example 'Pérez'
   */
  apellidoP: z
    .string({
      message: "El apellido paterno es requerido",
    })
    .min(2, {
      message: "El apellido paterno debe tener al menos 2 caracteres",
    })
    .max(80, {
      message: "El apellido paterno no debe exceder 80 caracteres",
    })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "El apellido paterno debe contener solo letras y espacios",
    })
    .trim(),

  /**
   * Apellido materno del usuario.
   * Debe tener entre 2 y 80 caracteres y contener solo letras y espacios.
   * Se normalizará (trim y capitalización).
   *
   * @example 'López'
   */
  apellidoM: z
    .string({
      message: "El apellido materno es requerido",
    })
    .min(2, {
      message: "El apellido materno debe tener al menos 2 caracteres",
    })
    .max(80, {
      message: "El apellido materno no debe exceder 80 caracteres",
    })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
      message: "El apellido materno debe contener solo letras y espacios",
    })
    .trim(),

  /**
   * Fecha de nacimiento del usuario (formato YYYY-MM-DD).
   * No puede ser futura y el usuario debe tener al menos 16 años.
   *
   * @example '1995-05-20'
   */
  fechaN: z
    .string({
      message: "La fecha de nacimiento es requerida",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "La fecha de nacimiento debe tener formato YYYY-MM-DD",
    })
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        return birthDate < today;
      },
      {
        message: "La fecha de nacimiento no puede ser futura",
      }
    )
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();

        // Ajustar edad si aún no ha cumplido años este año
        const actualAge =
          monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

        return actualAge >= 16;
      },
      {
        message: "El usuario debe tener al menos 16 años",
      }
    ),

  /**
   * Bandera que indica si la cuenta de usuario está activa.
   * Las cuentas inactivas no pueden iniciar sesión ni realizar operaciones.
   *
   * @default true
   */
  activo: z.boolean().default(true),

  /**
   * Marca de tiempo cuando se creó la cuenta de usuario.
   * Se almacena como cadena de fecha ISO 8601.
   *
   * @example '2024-01-01T00:00:00.000Z'
   */
  creadoEn: z.string().datetime({
    message: "Formato de fecha y hora inválido para creadoEn",
  }),

  /**
   * Marca de tiempo cuando se actualizó la cuenta de usuario por última vez.
   * Se almacena como cadena de fecha ISO 8601.
   *
   * @example '2024-01-01T12:30:00.000Z'
   */
  actualizadoEn: z.string().datetime({
    message: "Formato de fecha y hora inválido para actualizadoEn",
  }),
});

/**
 * Tipo TypeScript inferido del UserSchema.
 *
 * Este tipo representa un objeto de usuario completo con todos los campos.
 * Usa este tipo cuando trabajes con datos completos de usuario.
 *
 * @typedef {Object} User
 * @property {number} usuarioId - Identificador único del usuario
 * @property {string} correo - Dirección de correo electrónico del usuario
 * @property {string} contrasena - Contraseña hasheada del usuario (bcrypt)
 * @property {string} nombre - Nombre del usuario
 * @property {string} apellidoP - Apellido paterno del usuario
 * @property {string} apellidoM - Apellido materno del usuario
 * @property {string} fechaN - Fecha de nacimiento (YYYY-MM-DD)
 * @property {boolean} activo - Estado activo de la cuenta
 * @property {string} creadoEn - Marca de tiempo de creación de cuenta
 * @property {string} actualizadoEn - Marca de tiempo de última actualización
 *
 * @example
 * ```typescript
 * const user: User = {
 *   usuarioId: 1,
 *   correo: 'juan.perez@example.com',
 *   contrasena: '$2b$10$hashedPassword...',
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-05-20',
 *   activo: true,
 *   creadoEn: '2024-01-01T00:00:00.000Z',
 *   actualizadoEn: '2024-01-01T00:00:00.000Z'
 * };
 * ```
 */
export type User = z.infer<typeof UserSchema>;

/**
 * Esquema para crear un nuevo usuario.
 *
 * Este esquema omite campos generados por el sistema (usuarioId, creadoEn, actualizadoEn)
 * que serán asignados automáticamente al crear un nuevo usuario.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * const newUser: CreateUserInput = {
 *   correo: 'nuevo.usuario@example.com',
 *   contrasena: 'SecurePass123!',
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-05-20'
 * };
 *
 * const validated = CreateUserSchema.parse(newUser);
 * ```
 */
export const CreateUserSchema = UserSchema.omit({
  usuarioId: true,
  creadoEn: true,
  actualizadoEn: true,
});

/**
 * Tipo TypeScript para entrada de creación de usuario.
 *
 * Este tipo representa los datos necesarios para crear un nuevo usuario,
 * excluyendo campos generados por el sistema.
 *
 * @typedef {Object} CreateUserInput
 * @property {string} correo - Dirección de correo electrónico del usuario
 * @property {string} contrasena - Contraseña del usuario (texto plano, será hasheada con bcrypt)
 * @property {string} nombre - Nombre del usuario
 * @property {string} apellidoP - Apellido paterno del usuario
 * @property {string} apellidoM - Apellido materno del usuario
 * @property {string} fechaN - Fecha de nacimiento (YYYY-MM-DD)
 * @property {boolean} [activo] - Estado activo de la cuenta (opcional, por defecto true)
 *
 * @example
 * ```typescript
 * const createUserData: CreateUserInput = {
 *   correo: 'usuario@example.com',
 *   contrasena: 'SecurePass123!',
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-05-20',
 *   activo: true
 * };
 * ```
 */
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * Esquema para actualizar el perfil de un usuario existente.
 *
 * Según la especificación, solo se pueden actualizar: nombre, apellidoP, apellidoM, fechaN.
 * Los campos del sistema (usuarioId, creadoEn, actualizadoEn) no pueden ser actualizados.
 * La contraseña y correo tampoco se actualizan por este endpoint.
 * Al menos un campo debe venir en la actualización.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * // Actualizar solo el nombre
 * const updateData: UpdateUserInput = {
 *   nombre: 'Juan Carlos'
 * };
 *
 * // Actualizar múltiples campos
 * const updateData: UpdateUserInput = {
 *   nombre: 'Juan',
 *   apellidoP: 'Pérez',
 *   apellidoM: 'López',
 *   fechaN: '1995-06-15'
 * };
 * ```
 */
export const UpdateUserSchema = UserSchema.pick({
  nombre: true,
  apellidoP: true,
  apellidoM: true,
  fechaN: true,
}).partial();

/**
 * Tipo TypeScript para entrada de actualización de perfil de usuario.
 *
 * Todos los campos son opcionales, permitiendo actualizaciones parciales.
 * Solo se pueden actualizar los campos de perfil (nombre, apellidos, fechaN).
 *
 * @typedef {Object} UpdateUserInput
 * @property {string} [nombre] - Nuevo nombre
 * @property {string} [apellidoP] - Nuevo apellido paterno
 * @property {string} [apellidoM] - Nuevo apellido materno
 * @property {string} [fechaN] - Nueva fecha de nacimiento (YYYY-MM-DD)
 *
 * @example
 * ```typescript
 * const updateData: UpdateUserInput = {
 *   nombre: 'Juan Carlos',
 *   apellidoP: 'Pérez'
 * };
 * ```
 */
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * Esquema para validación de ID de usuario.
 *
 * Se usa para validar IDs de usuario en parámetros de ruta.
 * Los IDs ahora son números enteros.
 *
 * @constant
 * @type {z.ZodNumber}
 *
 * @example
 * ```typescript
 * const userId = UserIdSchema.parse(parseInt(req.params.id));
 * ```
 */
export const UserIdSchema = z.number().int().positive({
  message: "Formato de ID de usuario inválido. Debe ser un número entero positivo.",
});

/**
 * Tipo para IDs de usuario validados.
 *
 * @typedef {number} UserId
 *
 * @example
 * ```typescript
 * const userId: UserId = 1;
 * ```
 */
export type UserId = z.infer<typeof UserIdSchema>;

/**
 * Esquema para cambio de contraseña.
 *
 * Valida los datos necesarios para cambiar la contraseña de un usuario.
 * Ambos campos son obligatorios y la nueva contraseña debe ser diferente de la actual.
 *
 * @constant
 * @type {z.ZodObject}
 *
 * @example
 * ```typescript
 * const changePasswordData: ChangePasswordInput = {
 *   contrasenaActual: 'OldPass123!',
 *   contrasenaNueva: 'NewPass456!'
 * };
 *
 * const validated = ChangePasswordSchema.parse(changePasswordData);
 * ```
 */
export const ChangePasswordSchema = z
  .object({
    /**
     * Contraseña actual del usuario.
     * Debe ser validada contra el hash almacenado en la base de datos.
     */
    contrasenaActual: z.string({
      message: "La contraseña actual es requerida",
    }),

    /**
     * Nueva contraseña que reemplazará a la actual.
     * Debe cumplir con la política de contraseñas.
     */
    contrasenaNueva: z
      .string({
        message: "La contraseña nueva es requerida",
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
      })
      .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
        message: "La contraseña debe contener al menos un símbolo especial",
      }),
  })
  .refine((data) => data.contrasenaActual !== data.contrasenaNueva, {
    message: "La contraseña nueva debe ser diferente de la actual",
    path: ["contrasenaNueva"],
  });

/**
 * Tipo TypeScript para entrada de cambio de contraseña.
 *
 * @typedef {Object} ChangePasswordInput
 * @property {string} contrasenaActual - Contraseña actual del usuario
 * @property {string} contrasenaNueva - Nueva contraseña que cumple con política de seguridad
 *
 * @example
 * ```typescript
 * const changePasswordData: ChangePasswordInput = {
 *   contrasenaActual: 'OldPass123!',
 *   contrasenaNueva: 'NewSecurePass456!'
 * };
 * ```
 */
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;