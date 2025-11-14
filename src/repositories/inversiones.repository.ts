import { db } from "../config/db";
import { Inversion } from "../dtos/inversiones.dto";
import {
  InversionListQuery,
  InversionCreateInput,
  InversionUpdateInput,
  InversionRecord,
} from "../dtos/inversiones.dto";

export const inversionesRepository = {
  async findAll() {
    const [rows]: any = await db.query("SELECT * FROM inversiones");
    return rows;
  },

  async findById(id: number) {
    const [rows]: any = await db.query("SELECT * FROM inversiones WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  },

  async create(data: Inversion) {
    const [result]: any = await db.query("INSERT INTO inversiones SET ?", [data]);
    return { id: result.insertId, ...data };
  },

  async update(id: number, data: Partial<Inversion>) {
    await db.query("UPDATE inversiones SET ? WHERE id = ?", [data, id]);
    return this.findById(id);
  },

  async remove(id: number) {
    await db.query("DELETE FROM inversiones WHERE id = ?", [id]);
  },
};

type InversionListFilters = InversionListQuery & { usuarioId: number };

type InversionListResult = { data: InversionRecord[]; total: number };

const fallbackInversiones: InversionRecord[] = [
  {
    inversionId: 11,
    usuarioId: 23,
    destinoId: 9,
    monto: 5000,
    objetivo: "Fondo de emergencia",
    fechaInicio: "2025-02-01T00:00:00Z",
    fechaFin: "2026-02-01T00:00:00Z",
    tasaInteresPorc: 7.5,
    creadoEn: "2025-02-01T10:00:00Z",
    actualizadoEn: "2025-02-10T08:12:00Z",
  },
  {
    inversionId: 12,
    usuarioId: 23,
    destinoId: null,
    monto: 2500,
    objetivo: "Vacaciones familiares",
    fechaInicio: "2025-03-10T00:00:00Z",
    fechaFin: null,
    tasaInteresPorc: 5.25,
    creadoEn: "2025-03-10T11:00:00Z",
    actualizadoEn: "2025-03-10T11:00:00Z",
  },
];

let fallbackSequence = fallbackInversiones.reduce(
  (max, inv) => Math.max(max, inv.inversionId),
  0
);

function mapInversionRow(row: any): InversionRecord {
  return {
    inversionId: Number(row.inversionId),
    usuarioId: Number(row.usuarioId),
    destinoId:
      row.destinoId === undefined || row.destinoId === null
        ? null
        : Number(row.destinoId),
    monto: Number(row.monto),
    objetivo: row.objetivo,
    fechaInicio: row.fechaInicio,
    fechaFin: row.fechaFin ?? null,
    tasaInteresPorc: Number(row.tasaInteresPorc),
    creadoEn: row.creadoEn,
    actualizadoEn: row.actualizadoEn,
  };
}

function ordenarInversiones(
  data: InversionRecord[],
  orden: string
): InversionRecord[] {
  const [campo, direccion = "desc"] = orden.split(":");
  const factor = direccion.toLowerCase() === "asc" ? 1 : -1;

  return [...data].sort((a, b) => {
    const valorA = (a as any)[campo];
    const valorB = (b as any)[campo];
    if (valorA === valorB) return 0;
    if (valorA === null) return 1 * factor;
    if (valorB === null) return -1 * factor;
    if (typeof valorA === "number" && typeof valorB === "number") {
      return valorA > valorB ? factor : -factor;
    }
    return String(valorA).localeCompare(String(valorB)) * factor;
  });
}

function aplicarFiltrosFallback(
  filters: InversionListFilters
): InversionListResult {
  const { usuarioId, desde, hasta, pagina, tamanoPagina, orden } = filters;
  let data = fallbackInversiones.filter(
    (inv) => inv.usuarioId === usuarioId
  );

  if (desde) {
    const desdeDate = new Date(desde);
    data = data.filter(
      (inv) => new Date(inv.fechaInicio).getTime() >= desdeDate.getTime()
    );
  }

  if (hasta) {
    const hastaDate = new Date(hasta);
    data = data.filter(
      (inv) => new Date(inv.fechaInicio).getTime() <= hastaDate.getTime()
    );
  }

  data = ordenarInversiones(data, orden);

  const total = data.length;
  const start = (pagina - 1) * tamanoPagina;
  const end = start + tamanoPagina;

  return {
    data: data.slice(start, end),
    total,
  };
}

async function listarInversionesConDb(
  filters: InversionListFilters
): Promise<InversionListResult> {
  try {
    const resultSets = await db.call("sp_inversiones_listar", [
      filters.usuarioId,
      filters.desde ?? null,
      filters.hasta ?? null,
      filters.pagina,
      filters.tamanoPagina,
      filters.orden,
    ]);

    const rows = (resultSets?.[0] as any[]) || [];
    let total = 0;
    const data: InversionRecord[] = [];

    for (const row of rows) {
      if (
        (row.inversionId === undefined || row.inversionId === null) &&
        row.totalRegistros !== undefined
      ) {
        total = Number(row.totalRegistros);
        continue;
      }

      const mapped = mapInversionRow(row);
      data.push(mapped);
      if (row.totalRegistros !== undefined) {
        total = Number(row.totalRegistros);
      }
    }

    return {
      data,
      total: total || data.length,
    };
  } catch (error) {
    console.error("Error en sp_inversiones_listar:", error);
    throw error;
  }
}

async function listarInversiones(
  filters: InversionListFilters
): Promise<InversionListResult> {
  if (db.enabled && db.pool) {
    try {
      return await listarInversionesConDb(filters);
    } catch {
      // fallback en caso de error en BD
    }
  }

  return aplicarFiltrosFallback(filters);
}

async function obtenerInversionDb(
  inversionId: number
): Promise<InversionRecord | null> {
  try {
    const resultSets = await db.call("sp_inversiones_obtener", [inversionId]);
    const rows = (resultSets?.[0] as any[]) || [];
    if (!rows.length) return null;
    return mapInversionRow(rows[0]);
  } catch (error: any) {
    if (
      typeof error?.message === "string" &&
      error.message.includes("NO_ENCONTRADO")
    ) {
      return null;
    }
    throw error;
  }
}

async function obtenerInversionFallback(
  inversionId: number
): Promise<InversionRecord | null> {
  const found = fallbackInversiones.find(
    (inv) => inv.inversionId === inversionId
  );
  return found ? { ...found } : null;
}

async function crearInversionDb(
  payload: InversionCreateInput & { usuarioId: number }
) {
  try {
    const resultSets = await db.call("sp_inversiones_crear", [
      payload.usuarioId,
      payload.destinoId ?? null,
      payload.monto,
      payload.objetivo,
      payload.fechaInicio,
      payload.fechaFin ?? null,
      payload.tasaInteresPorc,
    ]);

    const rows = (resultSets?.[0] as any[]) || [];
    if (rows.length) {
      const row = rows[0];
      const inversionId =
        row.inversionId ??
        row.id ??
        row.insertId ??
        row.nuevaInversionId ??
        row.newId;
      if (inversionId !== undefined) {
        return { inversionId: Number(inversionId) };
      }
    }

    throw new Error("DATOS_INVALIDOS: la base no devolvió inversionId");
  } catch (error: any) {
    if (
      typeof error?.message === "string" &&
      error.message.includes("FK_INEXISTENTE")
    ) {
      throw new Error("FK_INEXISTENTE: destinoId no existe");
    }
    if (
      typeof error?.message === "string" &&
      error.message.includes("DATOS_INVALIDOS")
    ) {
      throw error;
    }
    throw error;
  }
}

function crearInversionFallback(
  payload: InversionCreateInput & { usuarioId: number }
) {
  fallbackSequence += 1;
  const timestamp = new Date().toISOString();
  const nueva: InversionRecord = {
    inversionId: fallbackSequence,
    usuarioId: payload.usuarioId,
    destinoId: payload.destinoId ?? null,
    monto: payload.monto,
    objetivo: payload.objetivo,
    fechaInicio: payload.fechaInicio,
    fechaFin: payload.fechaFin ?? null,
    tasaInteresPorc: payload.tasaInteresPorc,
    creadoEn: timestamp,
    actualizadoEn: timestamp,
  };

  fallbackInversiones.push(nueva);
  return { inversionId: nueva.inversionId };
}

async function actualizarInversionDb(
  inversionId: number,
  payload: InversionUpdateInput,
  usuarioId: number
): Promise<boolean> {
  try {
    const resultSets = await db.call("sp_inversiones_actualizar", [
      inversionId,
      usuarioId,
      payload.destinoId ?? null,
      payload.monto,
      payload.objetivo,
      payload.fechaInicio,
      payload.fechaFin ?? null,
      payload.tasaInteresPorc,
    ]);

    const rows = (resultSets?.[0] as any[]) || [];
    if (rows.length && rows[0].actualizado !== undefined) {
      return Boolean(rows[0].actualizado);
    }

    return false;
  } catch (error: any) {
    if (
      typeof error?.message === "string" &&
      error.message.includes("FK_INEXISTENTE")
    ) {
      throw new Error("FK_INEXISTENTE: destinoId no existe");
    }
    throw error;
  }
}

function actualizarInversionFallback(
  inversionId: number,
  payload: InversionUpdateInput
): boolean {
  const index = fallbackInversiones.findIndex(
    (inv) => inv.inversionId === inversionId
  );
  if (index === -1) return false;

  const actual = fallbackInversiones[index];
  const actualizado: InversionRecord = {
    ...actual,
    destinoId:
      payload.destinoId !== undefined ? payload.destinoId ?? null : actual.destinoId,
    monto: payload.monto ?? actual.monto,
    objetivo: payload.objetivo ?? actual.objetivo,
    fechaInicio: payload.fechaInicio ?? actual.fechaInicio,
    fechaFin:
      payload.fechaFin !== undefined ? payload.fechaFin : actual.fechaFin,
    tasaInteresPorc: payload.tasaInteresPorc ?? actual.tasaInteresPorc,
    actualizadoEn: new Date().toISOString(),
  };

  fallbackInversiones[index] = actualizado;
  return true;
}

async function eliminarInversionDb(
  inversionId: number,
  usuarioId: number
): Promise<boolean> {
  try {
    const resultSets = await db.call("sp_inversiones_eliminar", [
      inversionId,
      usuarioId,
    ]);

    const rows = (resultSets?.[0] as any[]) || [];
    if (rows.length && rows[0].eliminado !== undefined) {
      return Boolean(rows[0].eliminado);
    }

    return false;
  } catch (error: any) {
    if (
      typeof error?.message === "string" &&
      error.message.includes("NO_ENCONTRADO")
    ) {
      return false;
    }
    throw error;
  }
}

function eliminarInversionFallback(inversionId: number): boolean {
  const index = fallbackInversiones.findIndex(
    (inv) => inv.inversionId === inversionId
  );
  if (index === -1) return false;

  fallbackInversiones.splice(index, 1);
  return true;
}

(inversionesRepository as any).findAll = async function (
  filters: InversionListFilters
): Promise<InversionListResult> {
  return listarInversiones(filters);
};

(inversionesRepository as any).findById = async function (
  inversionId: number
): Promise<InversionRecord | null> {
  if (db.enabled && db.pool) {
    try {
      const data = await obtenerInversionDb(inversionId);
      if (data) return data;
    } catch {
      // fallback a datos simulados
    }
  }

  return obtenerInversionFallback(inversionId);
};

(inversionesRepository as any).create = async function (
  payload: InversionCreateInput & { usuarioId: number }
) {
  if (db.enabled && db.pool) {
    try {
      return await crearInversionDb(payload);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("FK_INEXISTENTE")) {
        throw error;
      }
      if (
        error instanceof Error &&
        error.message.startsWith("DATOS_INVALIDOS")
      ) {
        throw error;
      }
    }
  }

  return crearInversionFallback(payload);
};

(inversionesRepository as any).update = async function (
  inversionId: number,
  payload: InversionUpdateInput,
  usuarioId: number
): Promise<boolean> {
  if (db.enabled && db.pool) {
    try {
      return await actualizarInversionDb(inversionId, payload, usuarioId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("FK_INEXISTENTE")
      ) {
        throw error;
      }
      if (
        error instanceof Error &&
        error.message.startsWith("DATOS_INVALIDOS")
      ) {
        throw error;
      }
    }
  }

  return actualizarInversionFallback(inversionId, payload);
};

(inversionesRepository as any).remove = async function (
  inversionId: number,
  usuarioId: number
): Promise<boolean> {
  if (db.enabled && db.pool) {
    const eliminado = await eliminarInversionDb(inversionId, usuarioId);
    if (eliminado) return true;
  }

  return eliminarInversionFallback(inversionId);
};
