// src/controllers/inversiones.controller.ts
import { Request, Response } from "express";
import { inversionesService } from "../services/inversiones.service";
import { InversionDTO } from "../dtos/inversiones.dto";
import {
  InversionListQuerySchema,
  InversionCreateSchema,
  InversionUpdateSchema,
} from "../dtos/inversiones.dto";

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

type AuthContext = { userId: string; scopes: string[] };

const inversionesControllerV2 = {
  async getAll(req: Request, res: Response) {
    try {
      const auth = obtenerAuth(res);
      const filtros = normalizarListadoQuery(req.query);
      const parse =
        InversionListQuerySchema.safeParse(filtros);
      if (!parse.success) {
        return res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "Parámetros de consulta inválidos",
            detalles: parse.error.issues,
          },
        });
      }

      const resultado = await (inversionesService as any).getAll(
        parse.data,
        auth
      );

      return res.status(200).json({
        ok: true,
        data: resultado.inversiones,
        meta: {
          paginacion: {
            pagina: resultado.pagina,
            tamanoPagina: resultado.tamanoPagina,
            total: resultado.total,
          },
        },
      });
    } catch (error) {
      return responderConError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const auth = obtenerAuth(res);
      const inversionId = Number(req.params.id);
      if (Number.isNaN(inversionId) || inversionId <= 0) {
        return res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "El id de la inversión debe ser un entero positivo",
          },
        });
      }

      const inversion = await (inversionesService as any).getById(
        inversionId,
        auth
      );

      return res.status(200).json({
        ok: true,
        data: inversion,
      });
    } catch (error) {
      return responderConError(res, error);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const auth = obtenerAuth(res);
      const parse = InversionCreateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "Datos de inversión inválidos",
            detalles: parse.error.issues,
          },
        });
      }

      const resultado = await (inversionesService as any).create(
        parse.data,
        auth
      );

      return res.status(201).json({
        ok: true,
        data: {
          inversionId: resultado.inversionId,
        },
      });
    } catch (error) {
      return responderConError(res, error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const auth = obtenerAuth(res);
      const inversionId = Number(req.params.id);
      if (Number.isNaN(inversionId) || inversionId <= 0) {
        return res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "El id de la inversión debe ser un entero positivo",
          },
        });
      }

      const parse = InversionUpdateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "Datos de actualización inválidos",
            detalles: parse.error.issues,
          },
        });
      }

      const actualizado = await (inversionesService as any).update(
        inversionId,
        parse.data,
        auth
      );

      return res.status(200).json({
        ok: true,
        data: { actualizado: Boolean(actualizado) },
      });
    } catch (error) {
      return responderConError(res, error);
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const auth = obtenerAuth(res);
      const inversionId = Number(req.params.id);
      if (Number.isNaN(inversionId) || inversionId <= 0) {
        return res.status(422).json({
          ok: false,
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: "El id de la inversión debe ser un entero positivo",
          },
        });
      }

      const eliminado = await (inversionesService as any).remove(
        inversionId,
        auth
      );

      return res.status(200).json({
        ok: true,
        data: { eliminado: Boolean(eliminado) },
      });
    } catch (error) {
      return responderConError(res, error);
    }
  },
};

function obtenerAuth(res: Response): AuthContext {
  const auth = res.locals.auth as AuthContext | undefined;
  if (!auth) {
    throw new Error("PERMISO_DENEGADO: autenticación requerida");
  }
  return auth;
}

function normalizarListadoQuery(query: Request["query"]) {
  const normalizado: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      normalizado[key] = value[0];
      continue;
    }

    if (value === "") {
      normalizado[key] = undefined;
      continue;
    }

    normalizado[key] = value;
  }

  return normalizado;
}

function responderConError(res: Response, error: unknown) {
  const mensaje =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "ERROR_DESCONOCIDO";

  if (mensaje.startsWith("DATOS_INVALIDOS")) {
    return res.status(422).json({
      ok: false,
      error: {
        codigo: "DATOS_INVALIDOS",
        mensaje: mensaje,
      },
    });
  }

  if (mensaje.startsWith("FK_INEXISTENTE")) {
    return res.status(422).json({
      ok: false,
      error: {
        codigo: "FK_INEXISTENTE",
        mensaje: mensaje,
      },
    });
  }

  if (mensaje.startsWith("NO_ENCONTRADO")) {
    return res.status(404).json({
      ok: false,
      error: {
        codigo: "NO_ENCONTRADO",
        mensaje: mensaje,
      },
    });
  }

  if (mensaje.startsWith("PERMISO_DENEGADO")) {
    return res.status(403).json({
      ok: false,
      error: {
        codigo: "PERMISO_DENEGADO",
        mensaje: mensaje,
      },
    });
  }

  return res.status(500).json({
    ok: false,
    error: {
      codigo: "ERROR_INTERNO",
      mensaje: "Ocurrió un error inesperado",
    },
  });
}

Object.assign(inversionesController, inversionesControllerV2);
