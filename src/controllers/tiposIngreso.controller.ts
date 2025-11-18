import { Request, Response } from "express";
import { TiposIngresoService } from "../services/tiposIngreso.service";
import {
  CrearTipoIngresoSchema,
  ActualizarTipoIngresoSchema,
  ListarTiposIngresoSchema,
} from "../dtos/tiposIngreso.dto";

export class TiposIngresoController {
  private service: TiposIngresoService;

  constructor() {
    this.service = new TiposIngresoService();
  }

  listar = async (req: Request, res: Response): Promise<void> => {
    const parsed = ListarTiposIngresoSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: "Datos de entrada invalidos",
          detalles: parsed.error.issues.map((i) => i.message),
        },
      });
      return;
    }

    try {
      const { pagina, tamanoPagina, orden, activo } = parsed.data;
      const resultado = await this.service.listar(pagina, tamanoPagina, orden, activo);

      res.status(200).json({
        ok: true,
        ...resultado,
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    const tipoIngresoId = Number(req.params.id);
    if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: "ID invalido",
        },
      });
      return;
    }

    try {
      const tipoIngreso = await this.service.obtenerPorId(tipoIngresoId);

      res.status(200).json({
        ok: true,
        data: tipoIngreso,
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  crear = async (req: Request, res: Response): Promise<void> => {
    const parsed = CrearTipoIngresoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: "Datos de entrada invalidos",
          detalles: parsed.error.issues.map((i) => i.message),
        },
      });
      return;
    }

    try {
      const { nombre, descripcion, activo } = parsed.data;
      const resultado = await this.service.crear(nombre, descripcion, activo);
      res.status(201).json({ ok: true, data: resultado });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  actualizar = async (req: Request, res: Response): Promise<void> => {
    const tipoIngresoId = Number(req.params.id);
    if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: "ID invalido",
        },
      });
      return;
    }

    const parsed = ActualizarTipoIngresoSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: "Datos de entrada invalidos",
          detalles: parsed.error.issues.map((i) => i.message),
        },
      });
      return;
    }

    try {
      const { nombre, descripcion, activo } = parsed.data;
      const resultado = await this.service.actualizar(
        tipoIngresoId,
        nombre,
        descripcion,
        activo
      );

      res.status(200).json({ ok: true, data: resultado });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  eliminar = async (req: Request, res: Response): Promise<void> => {
    const tipoIngresoId = Number(req.params.id);
    if (!Number.isInteger(tipoIngresoId) || tipoIngresoId <= 0) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: "ID invalido",
        },
      });
      return;
    }

    try {
      const resultado = await this.service.eliminar(tipoIngresoId);
      res.status(200).json({ ok: true, data: resultado });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  private manejarError(error: any, res: Response) {
    if (error instanceof Error && error.message === "NO_ENCONTRADO") {
      res.status(404).json({
        ok: false,
        error: {
          codigo: "NO_ENCONTRADO",
          mensaje: "Recurso no encontrado",
        },
      });
      return;
    }

    if (error instanceof Error && error.message.startsWith("DATOS_INVALIDOS")) {
      res.status(400).json({
        ok: false,
        error: {
          codigo: "DATOS_INVALIDOS",
          mensaje: error.message,
        },
      });
      return;
    }

    res.status(500).json({
      ok: false,
      error: {
        codigo: "ERROR_INTERNO",
        mensaje: "Ocurrio un error inesperado",
      },
    });
  }
}

export const tiposIngresoController = new TiposIngresoController();
