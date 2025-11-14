"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inversionesController = void 0;
const inversiones_service_1 = require("../services/inversiones.service");
const inversiones_dto_1 = require("../dtos/inversiones.dto");
exports.inversionesController = {
    async getAll(req, res) {
        const data = await inversiones_service_1.inversionesService.getAll();
        res.json({ ok: true, data });
    },
    async getById(req, res) {
        const id = Number(req.params.id);
        const data = await inversiones_service_1.inversionesService.getById(id);
        if (!data)
            return res.status(404).json({ ok: false, error: { codigo: "NOT_FOUND", mensaje: "Inversión no encontrada" } });
        res.json({ ok: true, data });
    },
    async create(req, res) {
        const parse = inversiones_dto_1.InversionDTO.safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({
                ok: false,
                error: { codigo: "VALIDATION_ERROR", mensaje: parse.error.issues.map(i => i.message) },
            });
        }
        const nueva = await inversiones_service_1.inversionesService.create(parse.data);
        res.status(201).json({ ok: true, data: nueva });
    },
    async update(req, res) {
        const id = Number(req.params.id);
        const parse = inversiones_dto_1.InversionDTO.partial().safeParse(req.body);
        if (!parse.success) {
            return res.status(400).json({ ok: false, error: { codigo: "VALIDATION_ERROR", mensaje: parse.error.issues.map(i => i.message) } });
        }
        const actualizada = await inversiones_service_1.inversionesService.update(id, parse.data);
        res.json({ ok: true, data: actualizada });
    },
    async remove(req, res) {
        const id = Number(req.params.id);
        await inversiones_service_1.inversionesService.remove(id);
        res.json({ ok: true, mensaje: "Inversión eliminada correctamente" });
    },
};
