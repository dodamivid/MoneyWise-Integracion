// src/services/inversiones.service.ts
import { inversionesRepository } from "../repositories/inversiones.repository";
import { Inversion } from "../dtos/inversiones.dto";

export const inversionesService = {
  getAll: () => inversionesRepository.findAll(),

  getById: (id: number) => inversionesRepository.findById(id),

  create: (data: Inversion) => inversionesRepository.create(data),

  update: (id: number, data: Partial<Inversion>) =>
    inversionesRepository.update(id, data),

  remove: (id: number) => inversionesRepository.remove(id),
};
