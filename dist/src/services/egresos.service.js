"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.egresosService = void 0;
const egresos_repository_1 = require("../repositories/egresos.repository");
const egresos_dto_1 = require("../dtos/egresos.dto");
class EgresosService {
    /**
     * Lista egresos con filtros y paginación
     */
    async listar(query, auth) {
        // Validar query params con Zod
        const validated = egresos_dto_1.ListarEgresosQuerySchema.parse(query);
        // Resolver usuarioId
        let usuarioIdResuelto;
        if (validated.usuarioId) {
            // Si se pasa usuarioId, requiere scope admin:egresos
            if (!auth.scopes.includes("admin:egresos")) {
                throw new Error("PERMISO_DENEGADO: requiere scope 'admin:egresos' para consultar otro usuario");
            }
            usuarioIdResuelto = parseInt(validated.usuarioId, 10);
            if (isNaN(usuarioIdResuelto)) {
                throw new Error("DATOS_INVALIDOS: usuarioId debe ser numérico");
            }
        }
        else {
            // Usar el userId del token
            usuarioIdResuelto = parseInt(auth.userId, 10);
            if (isNaN(usuarioIdResuelto)) {
                throw new Error("DATOS_INVALIDOS: userId del token debe ser numérico");
            }
        }
        return await egresos_repository_1.egresosRepository.listar(validated, usuarioIdResuelto);
    }
    /**
     * Crea un nuevo egreso
     */
    async crear(body, auth) {
        // Validar body con Zod
        const validated = egresos_dto_1.CrearEgresoBodySchema.parse(body);
        // Resolver usuarioId
        let usuarioIdResuelto;
        if (validated.usuarioId) {
            // Si se pasa usuarioId en el body, requiere scope admin:egresos
            if (!auth.scopes.includes("admin:egresos")) {
                throw new Error("PERMISO_DENEGADO: requiere scope 'admin:egresos' para crear egreso de otro usuario");
            }
            usuarioIdResuelto = parseInt(validated.usuarioId, 10);
            if (isNaN(usuarioIdResuelto)) {
                throw new Error("DATOS_INVALIDOS: usuarioId debe ser numérico");
            }
        }
        else {
            // Usar el userId del token
            usuarioIdResuelto = parseInt(auth.userId, 10);
            if (isNaN(usuarioIdResuelto)) {
                throw new Error("DATOS_INVALIDOS: userId del token debe ser numérico");
            }
        }
        return await egresos_repository_1.egresosRepository.crear(validated, usuarioIdResuelto);
    }
    /**
     * Obtiene un egreso por ID
     */
    async obtener(egresoId, auth) {
        const egreso = await egresos_repository_1.egresosRepository.obtener(egresoId);
        if (!egreso) {
            throw new Error(`NO_ENCONTRADO: egreso con id ${egresoId} no encontrado`);
        }
        // Verificar permiso: solo el dueño o admin puede ver
        const usuarioIdToken = parseInt(auth.userId, 10);
        if (egreso.usuarioId !== usuarioIdToken &&
            !auth.scopes.includes("admin:egresos")) {
            throw new Error("PERMISO_DENEGADO: no tiene permiso para ver este egreso");
        }
        return egreso;
    }
    /**
     * Actualiza un egreso
     */
    async actualizar(egresoId, body, auth) {
        // Validar body con Zod
        const validated = egresos_dto_1.ActualizarEgresoBodySchema.parse(body);
        // Obtener el egreso para verificar permisos
        const egreso = await egresos_repository_1.egresosRepository.obtener(egresoId);
        if (!egreso) {
            throw new Error(`NO_ENCONTRADO: egreso con id ${egresoId} no encontrado`);
        }
        // Verificar permiso: solo el dueño o admin puede actualizar
        const usuarioIdToken = parseInt(auth.userId, 10);
        if (egreso.usuarioId !== usuarioIdToken &&
            !auth.scopes.includes("admin:egresos")) {
            throw new Error("PERMISO_DENEGADO: no tiene permiso para actualizar este egreso");
        }
        return await egresos_repository_1.egresosRepository.actualizar(egresoId, validated, egreso.usuarioId);
    }
    /**
     * Elimina un egreso
     */
    async eliminar(egresoId, auth) {
        // Obtener el egreso para verificar permisos
        const egreso = await egresos_repository_1.egresosRepository.obtener(egresoId);
        if (!egreso) {
            throw new Error(`NO_ENCONTRADO: egreso con id ${egresoId} no encontrado`);
        }
        // Verificar permiso: solo el dueño o admin puede eliminar
        const usuarioIdToken = parseInt(auth.userId, 10);
        if (egreso.usuarioId !== usuarioIdToken &&
            !auth.scopes.includes("admin:egresos")) {
            throw new Error("PERMISO_DENEGADO: no tiene permiso para eliminar este egreso");
        }
        return await egresos_repository_1.egresosRepository.eliminar(egresoId, egreso.usuarioId);
    }
}
exports.egresosService = new EgresosService();
