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
 * router.get('/:id', userController.obtenerPerfil);
 * router.put('/:id', userController.actualizarPerfil);
 * router.patch('/:id/contrasena', userController.cambiarContrasena);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 2.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const user_dto_1 = require("../dtos/user.dto");
/**
 * Clase controladora para los endpoints HTTP relacionados con usuarios.
 *
 * Esta clase contiene métodos manejadores para todas las rutas relacionadas con usuarios
 * según la especificación API v1.
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
 * app.get('/api/v1/usuarios/:id', controller.obtenerPerfil);
 * app.put('/api/v1/usuarios/:id', controller.actualizarPerfil);
 * app.patch('/api/v1/usuarios/:id/contrasena', controller.cambiarContrasena);
 * ```
 */
class UserController {
    /**
     * Recupera el perfil de un usuario por su ID.
     *
     * **Ruta**: GET /api/v1/usuarios/:id
     *
     * Este endpoint:
     * 1. Extrae el ID del usuario de los parámetros de ruta
     * 2. Convierte el ID de string a number
     * 3. Llama al servicio para encontrar el usuario
     * 4. Retorna una respuesta 200 con los datos del usuario si se encuentra
     * 5. Pasa los errores al middleware de manejo de errores
     *
     * **Respuesta Exitosa (200)**:
     * ```json
     * {
     *   "ok": true,
     *   "data": {
     *     "usuarioId": 1,
     *     "nombre": "Juan",
     *     "apellidoP": "Pérez",
     *     "apellidoM": "López",
     *     "correo": "juan@example.com",
     *     "fechaN": "1995-05-20",
     *     "creadoEn": "2025-01-01T00:00:00Z",
     *     "actualizadoEn": "2025-04-01T12:00:00Z",
     *     "activo": true
     *   }
     * }
     * ```
     *
     * **Posibles Errores**:
     * - 400: ID inválido (formato incorrecto)
     * - 404: Usuario no encontrado
     * - 403: Permiso denegado (si se implementa autenticación)
     *
     * @async
     * @param {Request} req - Objeto de petición de Express con params.id
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función next de Express para propagación de errores
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Ejemplo de uso en ruta
     * router.get('/:id', userController.obtenerPerfil);
     * ```
     */
    async obtenerPerfil(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            // Validar que el ID es un número válido
            if (isNaN(id)) {
                return next(new Error(`ID de usuario inválido: ${req.params.id} no es un número`));
            }
            const user = await user_service_1.userService.findById(id);
            const response = (0, user_dto_1.createPerfilUsuarioResponse)(user);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Actualiza el perfil de un usuario.
     *
     * **Ruta**: PUT /api/v1/usuarios/:id
     *
     * Este endpoint:
     * 1. Extrae el ID del usuario de los parámetros de ruta
     * 2. Extrae los datos de actualización del body
     * 3. Valida que al menos un campo esté presente
     * 4. Llama al servicio para actualizar el usuario
     * 5. Retorna una respuesta 200 con confirmación de actualización
     *
     * **Body de Petición**:
     * ```json
     * {
     *   "nombre": "Juan",
     *   "apellidoP": "Pérez",
     *   "apellidoM": "López",
     *   "fechaN": "1995-05-20"
     * }
     * ```
     * Nota: Todos los campos son opcionales, pero debe venir al menos uno.
     *
     * **Respuesta Exitosa (200)**:
     * ```json
     * {
     *   "ok": true,
     *   "data": {
     *     "actualizado": true,
     *     "actualizadoEn": "2025-04-01T12:30:00Z"
     *   }
     * }
     * ```
     *
     * **Posibles Errores**:
     * - 400: ID inválido
     * - 404: Usuario no encontrado
     * - 422: Datos inválidos (validación fallida)
     * - 403: Permiso denegado (si se implementa autenticación)
     *
     * @async
     * @param {Request} req - Objeto de petición de Express con params.id y body
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función next de Express para propagación de errores
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Ejemplo de uso en ruta
     * router.put('/:id', userController.actualizarPerfil);
     * ```
     */
    async actualizarPerfil(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            // Validar que el ID es un número válido
            if (isNaN(id)) {
                return next(new Error(`ID de usuario inválido: ${req.params.id} no es un número`));
            }
            const { nombre, apellidoP, apellidoM, fechaN } = req.body;
            const updatedUser = await user_service_1.userService.actualizarPerfil(id, {
                nombre,
                apellidoP,
                apellidoM,
                fechaN,
            });
            const response = (0, user_dto_1.createActualizarPerfilResponse)(updatedUser.actualizadoEn);
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cambia la contraseña de un usuario.
     *
     * **Ruta**: PATCH /api/v1/usuarios/:id/contrasena
     *
     * Este endpoint:
     * 1. Extrae el ID del usuario de los parámetros de ruta
     * 2. Extrae contrasenaActual y contrasenaNueva del body
     * 3. Valida la contraseña actual
     * 4. Hashea y actualiza con la nueva contraseña
     * 5. Retorna una respuesta 200 con confirmación de cambio
     *
     * **Body de Petición**:
     * ```json
     * {
     *   "contrasenaActual": "Pa$$w0rd!",
     *   "contrasenaNueva": "Nuev0P@ss!"
     * }
     * ```
     * Nota: Ambos campos son obligatorios.
     *
     * **Respuesta Exitosa (200)**:
     * ```json
     * {
     *   "ok": true,
     *   "data": {
     *     "cambiado": true
     *   }
     * }
     * ```
     *
     * **Posibles Errores**:
     * - 400: ID inválido
     * - 401: Contraseña actual incorrecta
     * - 404: Usuario no encontrado
     * - 422: Datos inválidos (nueva contraseña no cumple política)
     * - 403: Permiso denegado (si se implementa autenticación)
     *
     * @async
     * @param {Request} req - Objeto de petición de Express con params.id y body
     * @param {Response} res - Objeto de respuesta de Express
     * @param {NextFunction} next - Función next de Express para propagación de errores
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * // Ejemplo de uso en ruta
     * router.patch('/:id/contrasena', userController.cambiarContrasena);
     * ```
     */
    async cambiarContrasena(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            // Validar que el ID es un número válido
            if (isNaN(id)) {
                return next(new Error(`ID de usuario inválido: ${req.params.id} no es un número`));
            }
            const { contrasenaActual, contrasenaNueva } = req.body;
            await user_service_1.userService.cambiarContrasena(id, {
                contrasenaActual,
                contrasenaNueva,
            });
            const response = (0, user_dto_1.createCambiarContrasenaResponse)();
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
/**
 * Instancia singleton de UserController.
 *
 * Esto asegura un uso de controlador consistente en toda la aplicación.
 *
 * @constant
 * @type {UserController}
 *
 * @example
 * ```typescript
 * import { userController } from './controllers/user.controller';
 *
 * router.get('/:id', userController.obtenerPerfil);
 * ```
 */
exports.userController = new UserController();
