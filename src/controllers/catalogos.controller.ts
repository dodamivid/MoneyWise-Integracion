import { Request, Response } from "express";
import * as service from "../services/catalogos.service";

export const listarFrecuencias = async (req: Request, res: Response) => {
  try {
    const buscar = String(req.query.buscar ?? "");
    const paginaRaw = req.query.pagina ?? 1;
    const tamanoPaginaRaw = req.query.tamanoPagina ?? 20;
    const orden = String(req.query.orden ?? "nombre:asc");

    const pagina = Number(paginaRaw);
    const tamanoPagina = Number(tamanoPaginaRaw);

    if (!Number.isInteger(pagina) || pagina < 1) {
      return res.status(400).json({ ok: false, message: "pagina must be a positive integer" });
    }
    if (!Number.isInteger(tamanoPagina) || tamanoPagina < 1) {
      return res.status(400).json({ ok: false, message: "tamanoPagina must be a positive integer" });
    }

    const data = await service.listarFrecuencias(buscar, pagina, tamanoPagina, orden);
    return res.json({ ok: true, data: data.data, meta: data.meta });
  } catch (err: any) {
    return res.status(422).json({ ok: false, message: err.message });
  }
};

export const crearFrecuencia = async (req: Request, res: Response) => {
  try {
    const nombre = req.body?.nombre;
    if (typeof nombre !== "string" || nombre.trim() === "") {
      return res.status(400).json({ ok: false, message: "nombre is required and must be a non-empty string" });
    }
    const result = await service.crearFrecuencia(nombre.trim());
    return res.status(201).json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

export const actualizarFrecuencia = async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, message: "id must be a positive integer" });
    }

    const nombre = req.body?.nombre;
    if (typeof nombre !== "string" || nombre.trim() === "") {
      return res.status(400).json({ ok: false, message: "nombre is required and must be a non-empty string" });
    }

    const result = await service.actualizarFrecuencia(id, nombre.trim());
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

export const eliminarFrecuencia = async (req: Request, res: Response) => {
  try {
    const idRaw = req.params.id;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, message: "id must be a positive integer" });
    }

    const result = await service.eliminarFrecuencia(id);
    return res.json({ ok: true, data: result });
  } catch (err: any) {
    return res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};
