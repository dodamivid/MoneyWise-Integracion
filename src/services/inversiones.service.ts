// src/services/inversiones.service.ts
import { inversionesRepository } from "../repositories/inversiones.repository";
import { Inversion } from "../dtos/inversiones.dto";
import {
  InversionListQuery,
  InversionCreateInput,
  InversionUpdateInput,
  InversionRecord,
} from "../dtos/inversiones.dto";

export const inversionesService = {
  getAll: () => inversionesRepository.findAll(),

  getById: (id: number) => inversionesRepository.findById(id),

  create: (data: Inversion) => inversionesRepository.create(data),

  update: (id: number, data: Partial<Inversion>) =>
    inversionesRepository.update(id, data),

  remove: (id: number) => inversionesRepository.remove(id),
};

type AuthContext = {
  userId: string;
  scopes: string[];
};

const ADMIN_SCOPE_INVERSIONES = "admin:inversiones";

function parseUsuarioIdDesdeToken(auth: AuthContext): number {
  const usuarioId = parseInt(auth.userId, 10);
  if (Number.isNaN(usuarioId)) {
    throw new Error("DATOS_INVALIDOS: sub inválido en el token");
  }
  return usuarioId;
}

function resolverUsuarioIdOperativo(
  usuarioIdSolicitado: number | undefined,
  auth: AuthContext
): number {
  if (usuarioIdSolicitado !== undefined) {
    if (!auth.scopes.includes(ADMIN_SCOPE_INVERSIONES)) {
      throw new Error(
        "PERMISO_DENEGADO: requiere scope admin:inversiones para operar sobre otros usuarios"
      );
    }
    return usuarioIdSolicitado;
  }

  return parseUsuarioIdDesdeToken(auth);
}

function asegurarPropietarioOAdmin(
  inversion: InversionRecord,
  auth: AuthContext
) {
  const usuarioIdToken = parseUsuarioIdDesdeToken(auth);
  if (
    inversion.usuarioId !== usuarioIdToken &&
    !auth.scopes.includes(ADMIN_SCOPE_INVERSIONES)
  ) {
    throw new Error(
      "PERMISO_DENEGADO: no puede operar sobre inversiones de terceros"
    );
  }
}

const repo = inversionesRepository as any;

(inversionesService as any).getAll = async function (
  query: InversionListQuery & { pagina: number; tamanoPagina: number },
  auth: AuthContext
) {
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

(inversionesService as any).getById = async function (
  inversionId: number,
  auth: AuthContext
) {
  const inversion = await repo.findById(inversionId);
  if (!inversion) {
    throw new Error("NO_ENCONTRADO: inversión no encontrada");
  }

  asegurarPropietarioOAdmin(inversion, auth);
  return inversion;
};

(inversionesService as any).create = async function (
  body: InversionCreateInput,
  auth: AuthContext
) {
  const usuarioId = resolverUsuarioIdOperativo(body.usuarioId, auth);
  const payload: InversionCreateInput & { usuarioId: number } = {
    ...body,
    usuarioId,
    destinoId: body.destinoId ?? null,
    fechaFin: body.fechaFin ?? null,
  };

  const resultado = await repo.create(payload);
  return resultado;
};

(inversionesService as any).update = async function (
  inversionId: number,
  body: InversionUpdateInput,
  auth: AuthContext
) {
  const actual = await repo.findById(inversionId);
  if (!actual) {
    throw new Error("NO_ENCONTRADO: inversión no encontrada");
  }

  asegurarPropietarioOAdmin(actual, auth);

  const payload: InversionUpdateInput = {
    destinoId:
      body.destinoId !== undefined ? body.destinoId : actual.destinoId,
    monto: body.monto ?? actual.monto,
    objetivo: body.objetivo ?? actual.objetivo,
    fechaInicio: body.fechaInicio ?? actual.fechaInicio,
    fechaFin:
      body.fechaFin !== undefined ? body.fechaFin : actual.fechaFin,
    tasaInteresPorc: body.tasaInteresPorc ?? actual.tasaInteresPorc,
  };

  if (
    payload.fechaFin &&
    payload.fechaInicio &&
    payload.fechaFin !== null &&
    payload.fechaInicio !== undefined &&
    new Date(payload.fechaFin) < new Date(payload.fechaInicio)
  ) {
    throw new Error(
      "DATOS_INVALIDOS: la fechaFin debe ser mayor o igual a fechaInicio"
    );
  }

  const actualizado = await repo.update(inversionId, payload, actual.usuarioId);
  return actualizado;
};

(inversionesService as any).remove = async function (
  inversionId: number,
  auth: AuthContext
) {
  const actual = await repo.findById(inversionId);
  if (!actual) {
    throw new Error("NO_ENCONTRADO: inversión no encontrada");
  }

  asegurarPropietarioOAdmin(actual, auth);
  return repo.remove(inversionId, actual.usuarioId);
};
