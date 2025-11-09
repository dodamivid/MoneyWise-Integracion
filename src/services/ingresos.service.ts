import { Request } from "express";
import * as ingresosRepository from "../repositories/ingresos.repository";
import { validarIngresoDTO } from "../dtos/ingresos.dto";

/**
 * Listar ingresos con filtros
 */
export const listar = async (req: Request) => {
  const filtros: any = req.query || {};
  return await ingresosRepository.listar(filtros);
};

/**
 * Crear un nuevo ingreso
 */
export const crear = async (req: Request) => {
  const ingreso = validarIngresoDTO(req.body);
  return await ingresosRepository.crear(ingreso);
};

/**
 * Obtener un ingreso por ID
 */
export const obtener = async (req: Request) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw { status: 400, codigo: "DATOS_INVALIDOS", mensaje: "El ID del ingreso no es válido" };
  }
  return await ingresosRepository.obtener(id);
};

/**
 * Actualizar un ingreso existente
 */
export const actualizar = async (req: Request) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw { status: 400, codigo: "DATOS_INVALIDOS", mensaje: "El ID del ingreso no es válido" };
  }

  const ingreso = validarIngresoDTO(req.body, true);
  return await ingresosRepository.actualizar(id, ingreso);
};

/**
 * Eliminar un ingreso (lógico)
 */
export const eliminar = async (req: Request) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw { status: 400, codigo: "DATOS_INVALIDOS", mensaje: "El ID del ingreso no es válido" };
  }

  // En algunos middlewares, el usuario se adjunta a req como req.user
  const usuarioId = (req as any).user?.id || null;
  return await ingresosRepository.eliminar(id, usuarioId);
};
