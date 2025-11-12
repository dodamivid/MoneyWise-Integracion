"use strict";
/**
 * @fileoverview Controlador de usuarios para manejar peticiones y respuestas HTTP.
 *
 * Este módulo implementa el patrón Controller, manejando la lógica específica de HTTP
 * como el análisis de peticiones, formateo de respuestas y gestión de códigos de estado.
 * Los controladores actúan como punto de entrada para las peticiones HTTP, delegando la
 * lógica de negocio a las capas de servicio.
 *
 * Responsabilidades clave:
 * - Manejo de peticiones/respuestas HTTP
 * - Extracción de entrada y validación básica
 * - Gestión de códigos de estado
 * - Propagación de errores al middleware de manejo de errores
 * - Formateo de respuestas usando DTOs
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
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const user_dto_1 = require("../dtos/user.dto");
/**
 * Clase controladora para los endpoints HTTP relacionados con usuarios.
 *
 * Esta clase contiene métodos manejadores para todas las rutas relacionadas con usuarios.
 * Cada método sigue la firma de middleware de Express (req, res, next).
 *
 * Todos los métodos están diseñados para ser usados como manejadores de rutas de Express y
 * siguen patrones async/await con propagación adecuada de errores al middleware de
 * manejo de errores.
 *
 * @class UserController
 *
 * @example
 * ```typescript
 * const controller = new UserController();
 *
 * // Usar en rutas de Express
 * app.get('/api/users/:id', controller.getById);
 * app.get('/api/users', controller.getAll);
 * ```
 */
class UserController {
    /**
     * Recupera un único usuario por su ID.
     *
     * **Ruta**: GET /api/users/:id
     *
     * Este endpoint:
     * 1. Extrae el ID del usuario de los parámetros de ruta
     * 2. Llama al servicio para encontrar el usuario
     * 3. Retorna una respuesta 200 con los datos del usuario si se encuentra
     * 4. Pasa los errores al middleware de manejo de errores
     *
     * **Respuesta Exitosa (200)**:
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
     *   "message": "Usuario recuperado exitosamente"
     * }
     * ```
     *
     * **Respuesta de Error (404)**:
     * ```json
     * {
     *   "status": "error",
     *   "message": "Usuario con id 550e8400-e29b-41d4-a716-446655440000 no encontrado",
     *   "statusCode": 404
     * }
     * ```
     *
     * **Respuesta de Error (400)**:
     * ```json
     * {
     *   "status": "error",
     *   "message": "Formato de ID de usuario inválido: abc-123",
     *   "statusCode": 400
     * }
     * ```
     *
     * @async
     * @param {Request} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de ruta
     * @param {string} req.params.id - UUID del usuario
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función de siguiente middleware de Express
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Definición de ruta
     * router.get('/:id', userController.getById);
     *
     * // Petición
     * GET /api/users/550e8400-e29b-41d4-a716-446655440000
     *
     * // Respuesta (200 OK)
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
     *   "message": "Usuario recuperado exitosamente"
     * }
     * ```
     */
    async getById(req, res, next) {
        try {
            // Extraer ID del usuario de los parámetros de ruta
            const { id } = req.params;
            // Llamar al servicio para encontrar el usuario
            const user = await user_service_1.userService.findById(id);
            // Formatear respuesta usando DTO
            const response = (0, user_dto_1.createUserResponse)(user, "Usuario recuperado exitosamente");
            // Enviar respuesta exitosa
            res.status(200).json(response);
        }
        catch (error) {
            // Pasar error al middleware de manejo de errores
            next(error);
        }
    }
    /**
     * Recupera todos los usuarios del sistema.
     *
     * **Ruta**: GET /api/users
     *
     * Este endpoint:
     * 1. Llama al servicio para obtener todos los usuarios
     * 2. Retorna una respuesta 200 con un arreglo de usuarios
     * 3. Incluye metadatos sobre el conteo total
     *
     * **Nota**: En un sistema de producción, esto incluiría paginación,
     * filtrado y parámetros de consulta para ordenamiento.
     *
     * **Respuesta Exitosa (200)**:
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
     *   "message": "Usuarios recuperados exitosamente"
     * }
     * ```
     *
     * @async
     * @param {Request} req - Objeto de petición de Express
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función de siguiente middleware de Express
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Definición de ruta
     * router.get('/', userController.getAll);
     *
     * // Petición
     * GET /api/users
     *
     * // Respuesta (200 OK)
     * {
     *   "status": "success",
     *   "data": [...],
     *   "message": "Usuarios recuperados exitosamente"
     * }
     * ```
     */
    async getAll(req, res, next) {
        try {
            // Llamar al servicio para obtener todos los usuarios
            const users = await user_service_1.userService.findAll();
            // Formatear respuesta usando DTO
            const response = (0, user_dto_1.createUsersResponse)(users, undefined, "Usuarios recuperados exitosamente");
            // Enviar respuesta exitosa
            res.status(200).json(response);
        }
        catch (error) {
            // Pasar error al middleware de manejo de errores
            next(error);
        }
    }
    /**
     * Crea un nuevo usuario en el sistema.
     *
     * **Ruta**: POST /api/users
     *
     * Este endpoint:
     * 1. Extrae los datos del usuario del cuerpo de la petición
     * 2. Llama al servicio para crear el usuario (incluye validación)
     * 3. Retorna una respuesta 201 con el usuario creado
     *
     * **Cuerpo de la Petición**:
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
     * **Respuesta Exitosa (201)**:
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
     *   "message": "Usuario creado exitosamente"
     * }
     * ```
     *
     * **Respuesta de Error (400)**:
     * ```json
     * {
     *   "status": "error",
     *   "message": "Usuario con correo john.doe@example.com ya existe",
     *   "statusCode": 400
     * }
     * ```
     *
     * @async
     * @param {Request} req - Objeto de petición de Express
     * @param {Object} req.body - Datos de creación del usuario
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función de siguiente middleware de Express
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Definición de ruta
     * router.post('/', userController.create);
     *
     * // Petición
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
    async create(req, res, next) {
        try {
            // Extraer datos del usuario del cuerpo de la petición
            const userData = req.body;
            // Llamar al servicio para crear el usuario (incluye validación)
            const newUser = await user_service_1.userService.create(userData);
            // Formatear respuesta usando DTO
            const response = (0, user_dto_1.createUserResponse)(newUser, "Usuario creado exitosamente");
            // Enviar respuesta exitosa con estado 201
            res.status(201).json(response);
        }
        catch (error) {
            // Pasar error al middleware de manejo de errores
            next(error);
        }
    }
    /**
     * Actualiza la información de un usuario existente.
     *
     * **Ruta**: PATCH /api/users/:id
     *
     * Este endpoint:
     * 1. Extrae el ID del usuario de los parámetros de ruta
     * 2. Extrae los datos de actualización del cuerpo de la petición
     * 3. Llama al servicio para actualizar el usuario
     * 4. Retorna una respuesta 200 con el usuario actualizado
     *
     * **Cuerpo de la Petición** (todos los campos opcionales):
     * ```json
     * {
     *   "email": "newemail@example.com",
     *   "firstName": "Jane",
     *   "lastName": "Smith",
     *   "isActive": false
     * }
     * ```
     *
     * **Respuesta Exitosa (200)**:
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
     *   "message": "Usuario actualizado exitosamente"
     * }
     * ```
     *
     * @async
     * @param {Request} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de ruta
     * @param {string} req.params.id - UUID del usuario
     * @param {Object} req.body - Datos de actualización
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función de siguiente middleware de Express
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Definición de ruta
     * router.patch('/:id', userController.update);
     *
     * // Petición
     * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
     * Content-Type: application/json
     * {
     *   "firstName": "Jane",
     *   "lastName": "Smith"
     * }
     * ```
     */
    async update(req, res, next) {
        try {
            // Extraer ID del usuario y datos de actualización
            const { id } = req.params;
            const updateData = req.body;
            // Llamar al servicio para actualizar el usuario
            const updatedUser = await user_service_1.userService.update(id, updateData);
            // Formatear respuesta usando DTO
            const response = (0, user_dto_1.createUserResponse)(updatedUser, "Usuario actualizado exitosamente");
            // Enviar respuesta exitosa
            res.status(200).json(response);
        }
        catch (error) {
            // Pasar error al middleware de manejo de errores
            next(error);
        }
    }
    /**
     * Elimina un usuario del sistema.
     *
     * **Ruta**: DELETE /api/users/:id
     *
     * Este endpoint:
     * 1. Extrae el ID del usuario de los parámetros de ruta
     * 2. Llama al servicio para eliminar el usuario
     * 3. Retorna una respuesta 200 confirmando la eliminación
     *
     * **Respuesta Exitosa (200)**:
     * ```json
     * {
     *   "status": "success",
     *   "message": "Usuario eliminado exitosamente"
     * }
     * ```
     *
     * **Respuesta de Error (404)**:
     * ```json
     * {
     *   "status": "error",
     *   "message": "Usuario con id 550e8400-e29b-41d4-a716-446655440000 no encontrado",
     *   "statusCode": 404
     * }
     * ```
     *
     * @async
     * @param {Request} req - Objeto de petición de Express
     * @param {Object} req.params - Parámetros de ruta
     * @param {string} req.params.id - UUID del usuario
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función de siguiente middleware de Express
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Definición de ruta
     * router.delete('/:id', userController.delete);
     *
     * // Petición
     * DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
     *
     * // Respuesta (200 OK)
     * {
     *   "status": "success",
     *   "message": "Usuario eliminado exitosamente"
     * }
     * ```
     */
    async delete(req, res, next) {
        try {
            // Extraer ID del usuario
            const { id } = req.params;
            // Llamar al servicio para eliminar el usuario
            await user_service_1.userService.delete(id);
            // Enviar respuesta exitosa
            res.status(200).json({
                status: "success",
                message: "Usuario eliminado exitosamente",
            });
        }
        catch (error) {
            // Pasar error al middleware de manejo de errores
            next(error);
        }
    }
}
exports.UserController = UserController;
/**
 * Instancia singleton de UserController.
 *
 * Esta instancia se usa en toda la aplicación para manejar peticiones
 * HTTP relacionadas con usuarios. Usar un singleton asegura comportamiento
 * consistente y facilita la inyección de dependencias si se necesita en el futuro.
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
 * // Definir rutas
 * router.get('/:id', userController.getById);
 * router.get('/', userController.getAll);
 * router.post('/', userController.create);
 * router.patch('/:id', userController.update);
 * router.delete('/:id', userController.delete);
 *
 * export default router;
 * ```
 */
exports.userController = new UserController();
