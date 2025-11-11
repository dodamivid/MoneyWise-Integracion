import * as repo from "../repositories/catalogos.repository";
import { validarFrecuenciaDTO } from "../dtos/catalogos.dto";

export const listarFrecuencias = async (buscar: string, pagina: number, tam: number, orden: string) => {
  return repo.listarFrecuencias(buscar, pagina, tam, orden);
};

export const crearFrecuencia = async (nombre: string) => {
  validarFrecuenciaDTO(nombre);
  return repo.crearFrecuencia(nombre);
};

export const actualizarFrecuencia = async (id: number, nombre: string) => {
  validarFrecuenciaDTO(nombre);
  return repo.actualizarFrecuencia(id, nombre);
};

export const eliminarFrecuencia = async (id: number) => {
  return repo.eliminarFrecuencia(id);
};
