/**
 * @fileoverview Definición de rutas de usuario para la API de Money Wise.
 * 
 * Este módulo define todas las rutas HTTP relacionadas con operaciones de usuario.
 * Usa Express Router para organizar endpoints y mapearlos a los
 * métodos apropiados del controlador.
 * 
 * Todas las rutas se montan bajo la ruta base `/api/users` como se define
 * en el archivo principal de la aplicación (index.ts).
 * 
 * **Endpoints Disponibles**:
 * - `GET /api/users/:id` - Obtener un único usuario por ID
 * - `GET /api/users` - Obtener todos los usuarios
 * - `POST /api/users` - Crear un nuevo usuario
 * - `PATCH /api/users/:id` - Actualizar un usuario
 * - `DELETE /api/users/:id` - Eliminar un usuario
 * 
 * @module routes/users.routes
 * @category Routes
 * 
 * @example
 * ```typescript
 * // En index.ts
 * import usersRouter from './routes/users.routes';
 * 
 * app.use('/api/users', usersRouter);
 * ```
 * 
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */

import { Router } from "express";
import { userController } from "../controllers/user.controller";

/**
 * Instancia del enrutador Express para rutas relacionadas con usuarios.
 * 
 * Este enrutador maneja todas las operaciones CRUD de usuario y se monta
 * bajo la ruta `/api/users` en la aplicación principal.
 * 
 * @constant
 * @type {Router}
 */
const router = Router();

/**
 * @route GET /api/users/:id
 * @group Users - Operaciones relacionadas con usuarios
 * @summary Obtener un usuario por ID
 * @description Recupera la información de un único usuario por su UUID único.
 * 
 * @param {string} id.path.required - UUID del usuario - ej: 550e8400-e29b-41d4-a716-446655440000
 * 
 * @returns {UserResponseDTO} 200 - Usuario encontrado exitosamente
 * @returns {ErrorResponseDTO} 400 - Formato de ID de usuario inválido
 * @returns {ErrorResponseDTO} 404 - Usuario no encontrado
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 * 
 * @example
 * // Petición
 * GET /api/users/550e8400-e29b-41d4-a716-446655440000
 * 
 * // Respuesta Exitosa (200)
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
 * 
 * // Respuesta de Error (404)
 * {
 *   "status": "error",
 *   "message": "Usuario con id 550e8400-e29b-41d4-a716-446655440000 no encontrado",
 *   "statusCode": 404
 * }
 */
router.get("/:id", userController.getById);

/**
 * @route GET /api/users
 * @group Users - Operaciones relacionadas con usuarios
 * @summary Obtener todos los usuarios
 * @description Recupera una lista de todos los usuarios registrados en el sistema.
 * 
 * **Nota**: En un sistema de producción, este endpoint típicamente incluiría
 * parámetros de consulta para paginación, filtrado y ordenamiento.
 * 
 * @returns {UsersResponseDTO} 200 - Usuarios recuperados exitosamente
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 * 
 * @example
 * // Petición
 * GET /api/users
 * 
 * // Respuesta Exitosa (200)
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
 */
router.get("/", userController.getAll);

/**
 * @route POST /api/users
 * @group Users - Operaciones relacionadas con usuarios
 * @summary Crear un nuevo usuario
 * @description Crea una nueva cuenta de usuario en el sistema.
 * 
 * Todos los campos excepto `isActive` son requeridos. La contraseña se almacenará
 * tal como se proporciona (en producción, debería ser hasheada).
 * 
 * @param {CreateUserInput} body.body.required - Datos de creación de usuario
 * 
 * @returns {UserResponseDTO} 201 - Usuario creado exitosamente
 * @returns {ErrorResponseDTO} 400 - Datos de entrada inválidos o correo ya existe
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 * 
 * @example
 * // Petición
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
 * // Respuesta Exitosa (201)
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
 * 
 * // Respuesta de Error (400) - Correo ya existe
 * {
 *   "status": "error",
 *   "message": "Usuario con correo john.doe@example.com ya existe",
 *   "statusCode": 400
 * }
 * 
 * // Respuesta de Error (400) - Error de validación
 * {
 *   "status": "error",
 *   "message": "La contraseña debe tener al menos 8 caracteres, La contraseña debe contener al menos una letra mayúscula",
 *   "statusCode": 400
 * }
 */
router.post("/", userController.create);

/**
 * @route PATCH /api/users/:id
 * @group Users - Operaciones relacionadas con usuarios
 * @summary Actualizar un usuario
 * @description Actualiza la información de un usuario existente. Todos los campos son opcionales.
 * 
 * Puedes actualizar cualquier combinación de campos. Si el correo está siendo cambiado,
 * el sistema verificará que no esté ya en uso por otro usuario.
 * 
 * @param {string} id.path.required - UUID del usuario
 * @param {UpdateUserInput} body.body.required - Datos de actualización del usuario (todos los campos opcionales)
 * 
 * @returns {UserResponseDTO} 200 - Usuario actualizado exitosamente
 * @returns {ErrorResponseDTO} 400 - Datos de entrada inválidos o correo ya en uso
 * @returns {ErrorResponseDTO} 404 - Usuario no encontrado
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 * 
 * @example
 * // Petición - Actualizar un único campo
 * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
 * Content-Type: application/json
 * {
 *   "firstName": "Jane"
 * }
 * 
 * // Petición - Actualizar múltiples campos
 * PATCH /api/users/550e8400-e29b-41d4-a716-446655440000
 * Content-Type: application/json
 * {
 *   "firstName": "Jane",
 *   "lastName": "Smith",
 *   "email": "jane.smith@example.com"
 * }
 * 
 * // Respuesta Exitosa (200)
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
 *   "message": "Usuario actualizado exitosamente"
 * }
 */
router.patch("/:id", userController.update);

/**
 * @route DELETE /api/users/:id
 * @group Users - Operaciones relacionadas con usuarios
 * @summary Eliminar un usuario
 * @description Elimina permanentemente un usuario del sistema.
 * 
 * **Advertencia**: Esta es una operación de eliminación permanente y no puede deshacerse.
 * En un sistema de producción, podrías querer implementar eliminaciones suaves
 * (estableciendo isActive = false) en su lugar.
 * 
 * @param {string} id.path.required - UUID del usuario
 * 
 * @returns {Object} 200 - Usuario eliminado exitosamente
 * @returns {ErrorResponseDTO} 400 - Formato de ID de usuario inválido
 * @returns {ErrorResponseDTO} 404 - Usuario no encontrado
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 * 
 * @example
 * // Petición
 * DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
 * 
 * // Respuesta Exitosa (200)
 * {
 *   "status": "success",
 *   "message": "Usuario eliminado exitosamente"
 * }
 * 
 * // Respuesta de Error (404)
 * {
 *   "status": "error",
 *   "message": "Usuario con id 550e8400-e29b-41d4-a716-446655440000 no encontrado",
 *   "statusCode": 404
 * }
 */
router.delete("/:id", userController.delete);

/**
 * Exportar el enrutador configurado.
 * 
 * Este enrutador debe montarse en el archivo principal de la aplicación usando:
 * `app.use('/api/users', usersRouter);`
 */
export default router;