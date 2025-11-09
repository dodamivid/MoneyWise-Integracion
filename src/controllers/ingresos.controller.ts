import { Request, Response } from "express";
import * as ingresosService from "../services/ingresos.service";
import { handleError } from "../middlewares/error.middleware";

export const listar = async (req: Request, res: Response) => {
  try {
    const data = await ingresosService.listar(req);
    res.json({ ok: true, ...data });
  } catch (error) {
    handleError(res, error);
  }
};

export const crear = async (req: Request, res: Response) => {
  try {
    const data = await ingresosService.crear(req);
    res.status(201).json({ ok: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

export const obtener = async (req: Request, res: Response) => {
  try {
    const data = await ingresosService.obtener(req);
    res.json({ ok: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

export const actualizar = async (req: Request, res: Response) => {
  try {
    const data = await ingresosService.actualizar(req);
    res.json({ ok: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

export const eliminar = async (req: Request, res: Response) => {
  try {
    const data = await ingresosService.eliminar(req);
    res.json({ ok: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

