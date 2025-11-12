import { db } from "../config/db";

export const listar = async (filtros: any) => {
  if (!db.enabled) {
    console.warn("⚠️ DB deshabilitada — devolviendo datos simulados (listar ingresos).");
    return { data: [], meta: { total: 0, pagina: 1, tamanoPagina: 20 } };
  }

  const [rows] = await db.call("sp_ingresos_listar", [
    filtros.usuarioId || null,
    filtros.desde || null,
    filtros.hasta || null,
    filtros.tipoId || null,
    filtros.procedenciaId || null,
    filtros.min || null,
    filtros.max || null,
    filtros.pagina || 1,
    filtros.tamanoPagina || 20,
    filtros.orden || "creadoEn:desc",
  ]);

  return { data: rows[0], meta: rows[1] };
};

export const crear = async (ingreso: any) => {
  if (!db.enabled) {
    console.warn("⚠️ DB deshabilitada — simulando creación de ingreso.");
    return { id: 1, ...ingreso };
  }

  const [result] = await db.call("sp_ingresos_crear", [
    ingreso.usuarioId,
    ingreso.tipoId,
    ingreso.procedenciaId,
    ingreso.monto,
    ingreso.fechaInicio,
    ingreso.fechaFin,
    ingreso.descripcion,
  ]);

  return result[0];
};

export const obtener = async (id: number) => {
  if (!db.enabled) {
    console.warn("⚠️ DB deshabilitada — devolviendo stub de ingreso.");
    return { id, descripcion: "Ingreso simulado" };
  }

  const [result] = await db.call("sp_ingresos_obtener", [id]);
  return result[0];
};

export const actualizar = async (id: number, ingreso: any) => {
  if (!db.enabled) {
    console.warn("⚠️ DB deshabilitada — simulando actualización.");
    return { id, ...ingreso };
  }

  const [result] = await db.call("sp_ingresos_actualizar", [
    id,
    ingreso.usuarioId,
    ingreso.tipoId,
    ingreso.procedenciaId,
    ingreso.monto,
    ingreso.fechaInicio,
    ingreso.fechaFin,
    ingreso.descripcion,
  ]);

  return result[0];
};

export const eliminar = async (id: number, usuarioId: number) => {
  if (!db.enabled) {
    console.warn("⚠️ DB deshabilitada — simulando eliminación de ingreso.");
    return { id, eliminado: true };
  }

  const [result] = await db.call("sp_ingresos_eliminar", [id, usuarioId]);
  return result[0];
};

