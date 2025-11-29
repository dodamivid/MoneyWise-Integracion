"use strict";
/**
 * @fileoverview Definición de rutas de usuario para la API de Money Wise v1.
 *
 * Este módulo define todas las rutas HTTP relacionadas con operaciones de usuario
 * según la especificación API v1. Usa Express Router para organizar endpoints y
 * mapearlos a los métodos apropiados del controlador.
 *
 * Todas las rutas se montan bajo la ruta base `/api/v1/usuarios` como se define
 * en el archivo principal de la aplicación (index.ts).
 *
 * **Endpoints Disponibles**:
 * - `GET /api/v1/usuarios/:id` - Obtener perfil de usuario por ID
 * - `PUT /api/v1/usuarios/:id` - Actualizar perfil de usuario
 * - `PATCH /api/v1/usuarios/:id/contrasena` - Cambiar contraseña de usuario
 *
 * @module routes/users.routes
 * @category Routes
 *
 * @example
 * ```typescript
 * // En index.ts
 * import usersRouter from './routes/users.routes';
 *
 * app.use('/api/v1/usuarios', usersRouter);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 2.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
/**
 * Instancia del enrutador Express para rutas relacionadas con usuarios.
 *
 * Este enrutador maneja todas las operaciones de usuario según especificación API v1
 * y se monta bajo la ruta `/api/v1/usuarios` en la aplicación principal.
 *
 * @constant
 * @type {Router}
 */
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/usuarios/:id
 * @group Usuarios - Operaciones relacionadas con usuarios
 * @summary Obtener perfil de usuario por ID
 * @description Recupera la información completa del perfil de un usuario por su ID numérico.
 *
 * **Autenticación**: JWT obligatorio (mock con x-mw-user)
 * **Scopes requeridos**: `usuarios:leer`
 * **Reglas**: Si :id no coincide con `sub` del JWT y el usuario no tiene `admin:usuarios`,
 * responder con PERMISO_DENEGADO (403).
 *
 * @param {number} id.path.required - ID numérico del usuario - ej: 1
 *
 * @returns {PerfilUsuarioResponseDTO} 200 - Perfil de usuario recuperado exitosamente
 * @returns {ErrorResponseDTO} 400 - Formato de ID de usuario inválido
 * @returns {ErrorResponseDTO} 403 - Permiso denegado
 * @returns {ErrorResponseDTO} 404 - Usuario no encontrado
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición
 * GET /api/v1/usuarios/1
 * x-mw-user: 1
 * x-mw-scopes: usuarios:leer
 *
 * // Respuesta Exitosa (200)
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
 *
 * // Respuesta de Error (404)
 * {
 *   "ok": false,
 *   "mensaje": "Usuario no encontrado",
 *   "codigo": 404
 * }
 */
router.get("/:id", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("usuarios:leer"), auth_middleware_1.requireUserOwnership, user_controller_1.userController.obtenerPerfil);
/**
 * @route PUT /api/v1/usuarios/:id
 * @group Usuarios - Operaciones relacionadas con usuarios
 * @summary Actualizar perfil de usuario
 * @description Actualiza los campos de perfil de un usuario existente.
 * Solo se pueden actualizar: nombre, apellidoP, apellidoM, fechaN.
 *
 * **Autenticación**: JWT obligatorio (mock con x-mw-user)
 * **Scopes requeridos**: `usuarios:escribir`
 * **Reglas**: Si :id no coincide con `sub` del JWT y el usuario no tiene `admin:usuarios`,
 * responder con PERMISO_DENEGADO (403).
 *
 * @param {number} id.path.required - ID numérico del usuario - ej: 1
 * @param {UpdateUserInput} body.body.required - Datos de actualización del perfil
 *
 * @returns {ActualizarPerfilResponseDTO} 200 - Perfil actualizado exitosamente
 * @returns {ErrorResponseDTO} 400 - Formato de ID inválido
 * @returns {ErrorResponseDTO} 403 - Permiso denegado
 * @returns {ErrorResponseDTO} 404 - Usuario no encontrado
 * @returns {ErrorResponseDTO} 422 - Datos inválidos (validación fallida)
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición
 * PUT /api/v1/usuarios/1
 * x-mw-user: 1
 * x-mw-scopes: usuarios:escribir
 * Content-Type: application/json
 * {
 *   "nombre": "Juan Carlos",
 *   "apellidoP": "Pérez",
 *   "apellidoM": "López",
 *   "fechaN": "1995-05-20"
 * }
 *
 * // Respuesta Exitosa (200)
 * {
 *   "ok": true,
 *   "data": {
 *     "actualizado": true,
 *     "actualizadoEn": "2025-04-01T12:30:00Z"
 *   }
 * }
 *
 * // Respuesta de Error (422) - Validación fallida
 * {
 *   "ok": false,
 *   "mensaje": "El usuario debe tener al menos 16 años",
 *   "codigo": 422
 * }
 */
router.put("/:id", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("usuarios:escribir"), auth_middleware_1.requireUserOwnership, user_controller_1.userController.actualizarPerfil);
/**
 * @route PATCH /api/v1/usuarios/:id/contrasena
 * @group Usuarios - Operaciones relacionadas con usuarios
 * @summary Cambiar contraseña de usuario
 * @description Cambia la contraseña de un usuario validando la contraseña actual.
 * La nueva contraseña debe cumplir la política de seguridad.
 *
 * **Autenticación**: JWT obligatorio (mock con x-mw-user)
 * **Scopes requeridos**: `usuarios:escribir`
 * **Reglas**: Si :id no coincide con `sub` del JWT, responder con PERMISO_DENEGADO (403).
 * Los administradores NO pueden cambiar contraseñas de otros usuarios sin la contraseña actual.
 *
 * @param {number} id.path.required - ID numérico del usuario - ej: 1
 * @param {ChangePasswordInput} body.body.required - Contraseña actual y nueva
 *
 * @returns {CambiarContrasenaResponseDTO} 200 - Contraseña cambiada exitosamente
 * @returns {ErrorResponseDTO} 400 - Formato de ID inválido
 * @returns {ErrorResponseDTO} 401 - Contraseña actual incorrecta
 * @returns {ErrorResponseDTO} 403 - Permiso denegado
 * @returns {ErrorResponseDTO} 404 - Usuario no encontrado
 * @returns {ErrorResponseDTO} 422 - Datos inválidos (nueva contraseña no cumple política)
 * @returns {ErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición
 * PATCH /api/v1/usuarios/1/contrasena
 * x-mw-user: 1
 * x-mw-scopes: usuarios:escribir
 * Content-Type: application/json
 * {
 *   "contrasenaActual": "OldPass123!",
 *   "contrasenaNueva": "NewSecurePass456!"
 * }
 *
 * // Respuesta Exitosa (200)
 * {
 *   "ok": true,
 *   "data": {
 *     "cambiado": true
 *   }
 * }
 *
 * // Respuesta de Error (401) - Contraseña actual incorrecta
 * {
 *   "ok": false,
 *   "mensaje": "La contraseña actual es incorrecta",
 *   "codigo": 401
 * }
 *
 * // Respuesta de Error (422) - Nueva contraseña inválida
 * {
 *   "ok": false,
 *   "mensaje": "La nueva contraseña debe contener al menos un símbolo",
 *   "codigo": 422
 * }
 */
router.patch("/:id/contrasena", auth_middleware_1.mockAuth, (0, auth_middleware_1.requireScope)("usuarios:escribir"), auth_middleware_1.requireUserOwnership, user_controller_1.userController.cambiarContrasena);
/**
 * Exportar el enrutador configurado.
 *
 * Este enrutador debe montarse en el archivo principal de la aplicación usando:
 * `app.use('/api/v1/usuarios', usersRouter);`
 */
exports.default = router;
