"use strict";
/**
 * @fileoverview Definición de rutas de metas para la API de Money Wise.
 *
 * Este módulo define todas las rutas HTTP relacionadas con operaciones de metas de ahorro.
 * Usa Express Router para organizar endpoints y mapearlos a los
 * métodos apropiados del controlador.
 *
 * Todas las rutas se montan bajo la ruta base `/api/v1/metas` como se define
 * en el archivo principal de la aplicación (app.ts).
 *
 * **Endpoints Disponibles**:
 * - `GET /api/v1/metas/:id` - Obtener una única meta por ID
 * - `GET /api/v1/metas` - Obtener metas con filtros, paginación y ordenamiento
 * - `POST /api/v1/metas` - Crear una nueva meta
 * - `PATCH /api/v1/metas/:id` - Actualizar una meta
 * - `DELETE /api/v1/metas/:id` - Eliminar una meta (soft delete)
 *
 * @module routes/metas.routes
 * @category Routes
 *
 * @example
 * ```typescript
 * // En app.ts
 * import metasRouter from './routes/metas.routes';
 *
 * app.use('/api/v1/metas', metasRouter);
 * ```
 *
 * @author Equipo de Integración Money Wise
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metas_controller_1 = require("../controllers/metas.controller");
/**
 * Instancia del enrutador Express para rutas relacionadas con metas.
 *
 * Este enrutador maneja todas las operaciones CRUD de metas y se monta
 * bajo la ruta `/api/v1/metas` en la aplicación principal.
 *
 * @constant
 * @type {Router}
 */
const router = (0, express_1.Router)();
/**
 * @route GET /api/v1/metas/:id
 * @group Metas - Operaciones relacionadas con metas de ahorro
 * @summary Obtener una meta por ID
 * @description Recupera la información de una única meta por su ID numérico único.
 *
 * @param {number} id.path.required - ID de la meta - ej: 7
 *
 * @returns {MetaResponseDTO} 200 - Meta encontrada exitosamente
 * @returns {MetaErrorResponseDTO} 400 - Formato de ID de meta inválido
 * @returns {MetaErrorResponseDTO} 404 - Meta no encontrada
 * @returns {MetaErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición
 * GET /api/v1/metas/7
 *
 * // Respuesta Exitosa (200)
 * {
 *   "ok": true,
 *   "data": {
 *     "metaId": 7,
 *     "usuarioId": 23,
 *     "nombre": "Vacaciones 2026",
 *     "montoObjetivo": 150000.00,
 *     "ahorroReal": 35000.00,
 *     "porcentajeAvance": 23.33,
 *     "activa": true,
 *     "fechaInicio": "2025-01-01T00:00:00Z",
 *     "fechaFin": "2026-12-31T23:59:59Z",
 *     "creadoEn": "2025-01-05T10:45:00Z",
 *     "actualizadoEn": "2025-04-01T08:10:00Z"
 *   }
 * }
 *
 * // Respuesta de Error (404)
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "NO_ENCONTRADO",
 *     "mensaje": "Meta no encontrada",
 *     "statusCode": 404
 *   }
 * }
 */
router.get("/:id", metas_controller_1.metasController.getById);
/**
 * @route GET /api/v1/metas
 * @group Metas - Operaciones relacionadas con metas de ahorro
 * @summary Obtener metas con filtros y paginación
 * @description Recupera una lista de metas filtrada, paginada y ordenada según los parámetros de consulta.
 *
 * **Query Parameters**:
 * - `usuarioId` (number, opcional): Filtrar por ID de usuario (solo admin puede usar este filtro)
 * - `desde` (string ISO, opcional): Fecha de inicio del rango de búsqueda
 * - `hasta` (string ISO, opcional): Fecha de fin del rango de búsqueda
 * - `activa` (boolean, opcional): Filtrar por estado activo (`true` o `false`)
 * - `pagina` (number, default 1): Número de página (base 1)
 * - `tamanoPagina` (number, default 20, max 100): Cantidad de elementos por página
 * - `orden` (string, opcional): Campo y dirección de ordenamiento
 *   - Campos válidos: `fechaInicio`, `fechaFin`, `creadoEn`, `montoObjetivo`, `porcentajeAvance`
 *   - Formato: `campo` o `campo:asc` o `campo:desc`
 *   - Ejemplo: `fechaInicio:desc`
 *
 * @returns {MetasResponseDTO} 200 - Metas recuperadas exitosamente
 * @returns {MetaErrorResponseDTO} 422 - Parámetros de consulta inválidos
 * @returns {MetaErrorResponseDTO} 403 - Permiso denegado (usuarioId sin permisos admin)
 * @returns {MetaErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición - Listar todas las metas activas de un usuario
 * GET /api/v1/metas?usuarioId=23&activa=true&pagina=1&tamanoPagina=20
 *
 * // Petición - Listar metas con ordenamiento
 * GET /api/v1/metas?orden=fechaInicio:desc&pagina=1&tamanoPagina=10
 *
 * // Petición - Filtrar por rango de fechas
 * GET /api/v1/metas?desde=2025-01-01T00:00:00Z&hasta=2025-12-31T23:59:59Z
 *
 * // Respuesta Exitosa (200)
 * {
 *   "ok": true,
 *   "data": [
 *     {
 *       "metaId": 7,
 *       "usuarioId": 23,
 *       "nombre": "Vacaciones 2026",
 *       "montoObjetivo": 150000.00,
 *       "ahorroReal": 35000.00,
 *       "porcentajeAvance": 23.33,
 *       "activa": true,
 *       "fechaInicio": "2025-01-01T00:00:00Z",
 *       "fechaFin": "2026-12-31T23:59:59Z",
 *       "creadoEn": "2025-01-05T10:45:00Z",
 *       "actualizadoEn": "2025-04-01T08:10:00Z"
 *     }
 *   ],
 *   "meta": {
 *     "paginacion": {
 *       "pagina": 1,
 *       "tamanoPagina": 20,
 *       "total": 1
 *     }
 *   }
 * }
 *
 * // Respuesta de Error (422) - Filtros inválidos
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "DATOS_INVALIDOS",
 *     "mensaje": "Orden inválido. Use: fechaInicio|fechaFin|creadoEn|montoObjetivo|porcentajeAvance[:asc|:desc]",
 *     "statusCode": 422
 *   }
 * }
 */
router.get("/", metas_controller_1.metasController.getAll);
/**
 * @route POST /api/v1/metas
 * @group Metas - Operaciones relacionadas con metas de ahorro
 * @summary Crear una nueva meta
 * @description Crea una nueva meta de ahorro en el sistema.
 *
 * **Campos Requeridos**:
 * - `usuarioId`: ID del usuario propietario de la meta
 * - `nombre`: Nombre descriptivo de la meta (máx. 120 caracteres)
 * - `montoObjetivo`: Cantidad objetivo a ahorrar (debe ser > 0)
 * - `fechaInicio`: Fecha de inicio de la meta (formato ISO 8601)
 *
 * **Campos Opcionales**:
 * - `fechaFin`: Fecha objetivo de cumplimiento (debe ser >= fechaInicio)
 * - `activa`: Estado de la meta (default: true)
 *
 * **Campos Autogenerados**:
 * - `metaId`: ID único autoincremental
 * - `ahorroReal`: Inicializado en 0.00
 * - `porcentajeAvance`: Inicializado en 0.00
 * - `creadoEn`, `actualizadoEn`: Timestamps automáticos
 *
 * @param {CreateMetaInput} body.body.required - Datos de creación de meta
 *
 * @returns {CreateMetaResponseDTO} 201 - Meta creada exitosamente
 * @returns {MetaErrorResponseDTO} 422 - Datos de entrada inválidos
 * @returns {MetaErrorResponseDTO} 403 - Permiso denegado
 * @returns {MetaErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición - Crear meta con fecha de fin
 * POST /api/v1/metas
 * Content-Type: application/json
 * {
 *   "usuarioId": 23,
 *   "nombre": "Vacaciones 2026",
 *   "montoObjetivo": 150000.00,
 *   "fechaInicio": "2025-01-01T00:00:00Z",
 *   "fechaFin": "2026-12-31T23:59:59Z",
 *   "activa": true
 * }
 *
 * // Petición - Crear meta sin fecha de fin
 * POST /api/v1/metas
 * Content-Type: application/json
 * {
 *   "usuarioId": 23,
 *   "nombre": "Fondo de emergencia",
 *   "montoObjetivo": 50000.00,
 *   "fechaInicio": "2025-01-01T00:00:00Z"
 * }
 *
 * // Respuesta Exitosa (201)
 * {
 *   "ok": true,
 *   "data": {
 *     "metaId": 7
 *   }
 * }
 *
 * // Respuesta de Error (422) - Validación fallida
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "DATOS_INVALIDOS",
 *     "mensaje": "El monto objetivo debe ser mayor a 0",
 *     "statusCode": 422
 *   }
 * }
 *
 * // Respuesta de Error (422) - Fechas inválidas
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "DATOS_INVALIDOS",
 *     "mensaje": "La fecha de fin debe ser mayor o igual a la fecha de inicio",
 *     "statusCode": 422
 *   }
 * }
 */
router.post("/", metas_controller_1.metasController.create);
/**
 * @route PATCH /api/v1/metas/:id
 * @group Metas - Operaciones relacionadas con metas de ahorro
 * @summary Actualizar una meta
 * @description Actualiza la información de una meta existente. Todos los campos son opcionales.
 *
 * **Campos Actualizables**:
 * - `nombre`: Nuevo nombre de la meta
 * - `montoObjetivo`: Nuevo monto objetivo (debe ser > 0)
 * - `ahorroReal`: Nuevo ahorro acumulado (no puede superar montoObjetivo sin permisos admin)
 * - `fechaInicio`: Nueva fecha de inicio
 * - `fechaFin`: Nueva fecha objetivo (debe ser >= fechaInicio)
 * - `activa`: Nuevo estado de la meta
 *
 * **Reglas de Negocio**:
 * - El `ahorroReal` no puede superar el `montoObjetivo` sin permisos de administrador
 * - El `porcentajeAvance` se recalcula automáticamente al actualizar montoObjetivo o ahorroReal
 * - Si se actualiza fechaFin, debe ser >= fechaInicio
 *
 * @param {number} id.path.required - ID de la meta
 * @param {UpdateMetaInput} body.body.required - Datos de actualización (todos los campos opcionales)
 *
 * @returns {UpdateMetaResponseDTO} 200 - Meta actualizada exitosamente
 * @returns {MetaErrorResponseDTO} 422 - Datos de entrada inválidos
 * @returns {MetaErrorResponseDTO} 404 - Meta no encontrada
 * @returns {MetaErrorResponseDTO} 403 - Permiso denegado
 * @returns {MetaErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición - Actualizar ahorro real
 * PATCH /api/v1/metas/7
 * Content-Type: application/json
 * {
 *   "ahorroReal": 50000.00
 * }
 *
 * // Petición - Actualizar múltiples campos
 * PATCH /api/v1/metas/7
 * Content-Type: application/json
 * {
 *   "nombre": "Vacaciones Europa 2026",
 *   "montoObjetivo": 200000.00,
 *   "ahorroReal": 75000.00
 * }
 *
 * // Petición - Cerrar meta (marcar como inactiva)
 * PATCH /api/v1/metas/7
 * Content-Type: application/json
 * {
 *   "activa": false
 * }
 *
 * // Respuesta Exitosa (200)
 * {
 *   "ok": true,
 *   "data": {
 *     "actualizado": true
 *   }
 * }
 *
 * // Respuesta de Error (422) - Ahorro supera objetivo
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "DATOS_INVALIDOS",
 *     "mensaje": "El ahorro real no puede superar el monto objetivo sin permisos de administrador",
 *     "statusCode": 422
 *   }
 * }
 */
router.patch("/:id", metas_controller_1.metasController.update);
/**
 * @route DELETE /api/v1/metas/:id
 * @group Metas - Operaciones relacionadas con metas de ahorro
 * @summary Eliminar una meta (soft delete)
 * @description Elimina una meta del sistema mediante soft delete.
 *
 * **Importante**: Esta operación realiza un soft delete (marca `activa = false`)
 * en lugar de eliminar físicamente el registro. Esto preserva la integridad
 * del dashboard histórico y permite auditoría.
 *
 * **Reglas de Negocio**:
 * - Solo el usuario propietario de la meta puede eliminarla
 * - Los administradores pueden eliminar cualquier meta
 * - La meta no se elimina físicamente de la base de datos
 *
 * @param {number} id.path.required - ID de la meta
 *
 * @returns {DeleteMetaResponseDTO} 200 - Meta eliminada exitosamente
 * @returns {MetaErrorResponseDTO} 400 - Formato de ID de meta inválido
 * @returns {MetaErrorResponseDTO} 404 - Meta no encontrada
 * @returns {MetaErrorResponseDTO} 403 - Permiso denegado (no es propietario)
 * @returns {MetaErrorResponseDTO} 500 - Error interno del servidor
 *
 * @example
 * // Petición
 * DELETE /api/v1/metas/7
 *
 * // Respuesta Exitosa (200)
 * {
 *   "ok": true,
 *   "data": {
 *     "eliminado": true
 *   }
 * }
 *
 * // Respuesta de Error (404)
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "NO_ENCONTRADO",
 *     "mensaje": "Meta no encontrada",
 *     "statusCode": 404
 *   }
 * }
 *
 * // Respuesta de Error (403)
 * {
 *   "ok": false,
 *   "error": {
 *     "codigo": "PERMISO_DENEGADO",
 *     "mensaje": "No tiene permisos para eliminar esta meta",
 *     "statusCode": 403
 *   }
 * }
 */
router.delete("/:id", metas_controller_1.metasController.delete);
/**
 * Exportar el enrutador configurado.
 *
 * Este enrutador debe montarse en el archivo principal de la aplicación usando:
 * `app.use('/api/v1/metas', metasRouter);`
 */
exports.default = router;
