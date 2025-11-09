import { db } from "../config/db";

export const listar = async (filtros: any) => {
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
  const [result] = await db.call("sp_ingresos_obtener", [id]);
  return result[0];
};

export const actualizar = async (id: number, ingreso: any) => {
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
  const [result] = await db.call("sp_ingresos_eliminar", [id, usuarioId]);
  return result[0];
};
