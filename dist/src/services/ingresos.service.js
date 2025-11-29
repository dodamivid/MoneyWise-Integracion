"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ingresosService = void 0;
const ingresos_repository_1 = require("../repositories/ingresos.repository");
const ingresos_dto_1 = require("../dtos/ingresos.dto");
const ADMIN_SCOPE = "admin:ingresos";
const sanitizeQueryParams = (query) => {
    const sanitized = {};
    Object.entries(query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            const first = value[0];
            if (typeof first === "string") {
                const trimmed = first.trim();
                if (trimmed.length > 0) {
                    sanitized[key] = trimmed;
                }
            }
            return;
        }
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
                sanitized[key] = trimmed;
            }
            return;
        }
        if (value !== undefined && value !== null) {
            sanitized[key] = value;
        }
    });
    return sanitized;
};
class IngresosService {
    async listar(query, auth) {
        const sanitized = sanitizeQueryParams(query);
        const validated = ingresos_dto_1.ListarIngresosQuerySchema.parse(sanitized);
        const usuarioIdResuelto = this.resolverUsuarioId(validated.usuarioId, auth, "consultar ingresos de otro usuario");
        const result = await ingresos_repository_1.ingresosRepository.listar(validated, usuarioIdResuelto);
        return {
            ...result,
            pagina: validated.pagina,
            tamanoPagina: validated.tamanoPagina,
        };
    }
    async crear(body, auth) {
        const validated = ingresos_dto_1.CrearIngresoBodySchema.parse(body);
        const usuarioIdResuelto = this.resolverUsuarioId(validated.usuarioId, auth, "crear ingresos para otro usuario");
        return await ingresos_repository_1.ingresosRepository.crear(validated, usuarioIdResuelto);
    }
    async obtener(ingresoId, auth) {
        const ingreso = await ingresos_repository_1.ingresosRepository.obtener(ingresoId);
        if (!ingreso) {
            throw new Error(`NO_ENCONTRADO: ingreso con id ${ingresoId} no encontrado`);
        }
        this.verificarPropietario(ingreso.usuarioId, auth);
        return ingreso;
    }
    async actualizar(ingresoId, body, auth) {
        const validated = ingresos_dto_1.ActualizarIngresoBodySchema.parse(body);
        const ingreso = await ingresos_repository_1.ingresosRepository.obtener(ingresoId);
        if (!ingreso) {
            throw new Error(`NO_ENCONTRADO: ingreso con id ${ingresoId} no encontrado`);
        }
        this.verificarPropietario(ingreso.usuarioId, auth);
        return await ingresos_repository_1.ingresosRepository.actualizar(ingresoId, validated, ingreso.usuarioId);
    }
    async eliminar(ingresoId, auth) {
        const ingreso = await ingresos_repository_1.ingresosRepository.obtener(ingresoId);
        if (!ingreso) {
            throw new Error(`NO_ENCONTRADO: ingreso con id ${ingresoId} no encontrado`);
        }
        this.verificarPropietario(ingreso.usuarioId, auth);
        return await ingresos_repository_1.ingresosRepository.eliminar(ingresoId, ingreso.usuarioId);
    }
    resolverUsuarioId(usuarioIdSolicitado, auth, accion) {
        if (usuarioIdSolicitado) {
            if (!auth.scopes.includes(ADMIN_SCOPE)) {
                throw new Error(`PERMISO_DENEGADO: requiere scope '${ADMIN_SCOPE}' para ${accion}`);
            }
            const parsed = parseInt(usuarioIdSolicitado, 10);
            if (isNaN(parsed)) {
                throw new Error("DATOS_INVALIDOS: usuarioId debe ser numerico");
            }
            return parsed;
        }
        const parsedUserId = parseInt(auth.userId, 10);
        if (isNaN(parsedUserId)) {
            throw new Error("DATOS_INVALIDOS: userId del token debe ser numerico");
        }
        return parsedUserId;
    }
    verificarPropietario(usuarioId, auth) {
        const usuarioToken = parseInt(auth.userId, 10);
        if (isNaN(usuarioToken)) {
            throw new Error("DATOS_INVALIDOS: userId del token debe ser numerico");
        }
        if (usuarioId !== usuarioToken &&
            !auth.scopes.includes(ADMIN_SCOPE)) {
            throw new Error("PERMISO_DENEGADO: no tiene permiso para operar sobre este ingreso");
        }
    }
}
exports.ingresosService = new IngresosService();
