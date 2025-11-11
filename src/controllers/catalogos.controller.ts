import { Request, Response } from "express";
import * as service from "../services/catalogos.service";

export const listarFrecuencias = async (req: Request, res: Response) => {
  try {
    const { buscar = "", pagina = 1, tamanoPagina = 20, orden = "nombre:asc" } = req.query;
    const data = await service.listarFrecuencias(String(buscar), Number(pagina), Number(tamanoPagina), String(orden));
    res.json({ ok: true, data: data.data, meta: data.meta });
  } catch (err: any) {
    res.status(422).json({ ok: false, message: err.message });
  }
};

export const crearFrecuencia = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    const result = await service.crearFrecuencia(nombre);
    res.status(201).json({ ok: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

export const actualizarFrecuencia = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body;
    const result = await service.actualizarFrecuencia(id, nombre);
    res.json({ ok: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

export const eliminarFrecuencia = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await service.eliminarFrecuencia(id);
    res.json({ ok: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};
