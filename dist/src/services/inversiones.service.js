"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inversionesService = void 0;
// src/services/inversiones.service.ts
const inversiones_repository_1 = require("../repositories/inversiones.repository");
exports.inversionesService = {
    getAll: () => inversiones_repository_1.inversionesRepository.findAll(),
    getById: (id) => inversiones_repository_1.inversionesRepository.findById(id),
    create: (data) => inversiones_repository_1.inversionesRepository.create(data),
    update: (id, data) => inversiones_repository_1.inversionesRepository.update(id, data),
    remove: (id) => inversiones_repository_1.inversionesRepository.remove(id),
};
