"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inversionesService = void 0;
// src/services/inversiones.service.ts
const inversiones_repository_1 = require("../repositories/inversiones.repository");
exports.inversionesService = {
    getAll: () => inversiones_repository_1.inversionesRepository.findAll(),
    getById: (id) => inversiones_repository_1.inversionesRepository.findById(id),
    create: (data) => inversiones_repository_1.inversionesRepository.create(data),
    update: (id, data) => inversiones_repository_1.inversionesRepository.update(id, data),
    remove: (id) => inversiones_repository_1.inversionesRepository.remove(id),
};
const ADMIN_SCOPE_INVERSIONES = "admin:inversiones";
function parseUsuarioIdDesdeToken(auth) {
    const usuarioId = parseInt(auth.userId, 10);
    if (Number.isNaN(usuarioId)) {
        throw new Error("DATOS_INVALIDOS: sub inválido en el token");
    }
    return usuarioId;
}
function resolverUsuarioIdOperativo(usuarioIdSolicitado, auth) {
    if (usuarioIdSolicitado !== undefined) {
        if (!auth.scopes.includes(ADMIN_SCOPE_INVERSIONES)) {
            throw new Error("PERMISO_DENEGADO: requiere scope admin:inversiones para operar sobre otros usuarios");
        }
        return usuarioIdSolicitado;
    }
    return parseUsuarioIdDesdeToken(auth);
}
function asegurarPropietarioOAdmin(inversion, auth) {
    const usuarioIdToken = parseUsuarioIdDesdeToken(auth);
    if (inversion.usuarioId !== usuarioIdToken &&
        !auth.scopes.includes(ADMIN_SCOPE_INVERSIONES)) {
        throw new Error("PERMISO_DENEGADO: no puede operar sobre inversiones de terceros");
    }
}
const repo = inversiones_repository_1.inversionesRepository;
exports.inversionesService.getAll = async function (query, auth) {
    const usuarioId = resolverUsuarioIdOperativo(query.usuarioId, auth);
    const resultado = await repo.findAll({
        ...query,
        usuarioId,
    });
    return {
        inversiones: resultado.data,
        total: resultado.total,
        pagina: query.pagina,
        tamanoPagina: query.tamanoPagina,
    };
};
exports.inversionesService.getById = async function (inversionId, auth) {
    const inversion = await repo.findById(inversionId);
    if (!inversion) {
        throw new Error("NO_ENCONTRADO: inversión no encontrada");
    }
    asegurarPropietarioOAdmin(inversion, auth);
    return inversion;
};
exports.inversionesService.create = async function (body, auth) {
    const usuarioId = resolverUsuarioIdOperativo(body.usuarioId, auth);
    const payload = {
        ...body,
        usuarioId,
        destinoId: body.destinoId ?? null,
        fechaFin: body.fechaFin ?? null,
    };
    const resultado = await repo.create(payload);
    return resultado;
};
exports.inversionesService.update = async function (inversionId, body, auth) {
    const actual = await repo.findById(inversionId);
    if (!actual) {
        throw new Error("NO_ENCONTRADO: inversión no encontrada");
    }
    asegurarPropietarioOAdmin(actual, auth);
    const payload = {
        destinoId: body.destinoId !== undefined ? body.destinoId : actual.destinoId,
        monto: body.monto ?? actual.monto,
        objetivo: body.objetivo ?? actual.objetivo,
        fechaInicio: body.fechaInicio ?? actual.fechaInicio,
        fechaFin: body.fechaFin !== undefined ? body.fechaFin : actual.fechaFin,
        tasaInteresPorc: body.tasaInteresPorc ?? actual.tasaInteresPorc,
    };
    if (payload.fechaFin &&
        payload.fechaInicio &&
        payload.fechaFin !== null &&
        payload.fechaInicio !== undefined &&
        new Date(payload.fechaFin) < new Date(payload.fechaInicio)) {
        throw new Error("DATOS_INVALIDOS: la fechaFin debe ser mayor o igual a fechaInicio");
    }
    const actualizado = await repo.update(inversionId, payload, actual.usuarioId);
    return actualizado;
};
exports.inversionesService.remove = async function (inversionId, auth) {
    const actual = await repo.findById(inversionId);
    if (!actual) {
        throw new Error("NO_ENCONTRADO: inversión no encontrada");
    }
    asegurarPropietarioOAdmin(actual, auth);
    return repo.remove(inversionId, actual.usuarioId);
};
