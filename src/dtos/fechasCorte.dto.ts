import { FechaCorte } from "../models/fechasCorte.model";

export interface FechaCorteDataDTO {
  fechaCorteId: number;
  usuarioId: number;
  fechaCorte: string;
  creadoEn: string;
}

export interface ListarFechasCorteResponseDTO {
  ok: true;
  data: FechaCorteDataDTO[];
  meta: {
    paginacion: {
      pagina: number;
      tamanoPagina: number;
      total: number;
    };
  };
}

export interface CrearFechaCorteResponseDTO {
  ok: true;
  data: { fechaCorteId: number };
}

export interface EliminarFechaCorteResponseDTO {
  ok: true;
  data: { eliminado: boolean };
}

export function toFechaCorteDTO(row: FechaCorte): FechaCorteDataDTO {
  return {
    fechaCorteId: row.fechaCorteId,
    usuarioId: row.usuarioId,
    fechaCorte: row.fechaCorte,
    creadoEn: row.creadoEn,
  };
}

export function crearListarResponse(
  rows: FechaCorte[],
  pagina: number,
  tamanoPagina: number,
  total: number
): ListarFechasCorteResponseDTO {
  return {
    ok: true,
    data: rows.map(toFechaCorteDTO),
    meta: {
      paginacion: { pagina, tamanoPagina, total },
    },
  };
}
