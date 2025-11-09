// src/controllers/inversiones.controller.ts
import { Request, Response } from "express";
import { inversionesService } from "../services/inversiones.service";
import { InversionDTO } from "../dtos/inversiones.dto";

export const inversionesController = {
  async getAll(req: Request, res: Response) {
    const data = await inversionesService.getAll();
    res.json({ ok: true, data });
  },

  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const data = await inversionesService.getById(id);
    if (!data) return res.status(404).json({ ok: false, error: { codigo: "NOT_FOUND", mensaje: "Inversión no encontrada" } });
    res.json({ ok: true, data });
  },

  async create(req: Request, res: Response) {
    const parse = InversionDTO.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        ok: false,
        error: { codigo: "VALIDATION_ERROR", mensaje: parse.error.issues.map(i => i.message) },
      });
    }
    const nueva = await inversionesService.create(parse.data);
    res.status(201).json({ ok: true, data: nueva });
  },

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);
    const parse = InversionDTO.partial().safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ ok: false, error: { codigo: "VALIDATION_ERROR", mensaje: parse.error.issues.map(i => i.message) } });
    }
    const actualizada = await inversionesService.update(id, parse.data);
    res.json({ ok: true, data: actualizada });
  },

  async remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    await inversionesService.remove(id);
    res.json({ ok: true, mensaje: "Inversión eliminada correctamente" });
  },
};
