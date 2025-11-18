import { Request, Response } from 'express';
import { TiposIngresoService } from '../services/tiposIngreso.service';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { 
  CrearTipoIngresoDto, 
  ActualizarTipoIngresoDto,
  ListarTiposIngresoDto 
} from '../dtos/tiposIngreso.dto';

export class TiposIngresoController {
  private service: TiposIngresoService;

  constructor() {
    this.service = new TiposIngresoService();
  }

  listar = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToClass(ListarTiposIngresoDto, req.query);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'Datos de entrada inválidos',
            detalles: errors.map(e => Object.values(e.constraints || {})).flat()
          }
        });
        return;
      }

      const resultado = await this.service.listar(
        dto.pagina,
        dto.tamanoPagina,
        dto.orden,
        dto.activo
      );

      res.status(200).json({
        ok: true,
        ...resultado
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipoIngresoId = parseInt(req.params.id);

      if (isNaN(tipoIngresoId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'ID inválido'
          }
        });
        return;
      }

      const tipoIngreso = await this.service.obtenerPorId(tipoIngresoId);

      res.status(200).json({
        ok: true,
        data: tipoIngreso
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = plainToClass(CrearTipoIngresoDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'Datos de entrada inválidos',
            detalles: errors.map(e => Object.values(e.constraints || {})).flat()
          }
        });
        return;
      }

      const resultado = await this.service.crear(
        dto.nombre,
        dto.descripcion,
        dto.activo
      );

      res.status(201).json({
        ok: true,
        data: resultado
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipoIngresoId = parseInt(req.params.id);

      if (isNaN(tipoIngresoId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'ID inválido'
          }
        });
        return;
      }

      const dto = plainToClass(ActualizarTipoIngresoDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'Datos de entrada inválidos',
            detalles: errors.map(e => Object.values(e.constraints || {})).flat()
          }
        });
        return;
      }

      const resultado = await this.service.actualizar(
        tipoIngresoId,
        dto.nombre,
        dto.descripcion,
        dto.activo
      );

      res.status(200).json({
        ok: true,
        data: resultado
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  eliminar = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipoIngresoId = parseInt(req.params.id);

      if (isNaN(tipoIngresoId)) {
        res.status(422).json({
          ok: false,
          error: {
            codigo: 'DATOS_INVALIDOS',
            mensaje: 'ID inválido'
          }
        });
        return;
      }

      const resultado = await this.service.eliminar(tipoIngresoId);

      res.status(200).json({
        ok: true,
        data: resultado
      });
    } catch (error: any) {
      this.manejarError(error, res);
    }
  };

  private manejarError(error: any, res: Response): void {
    console.error('Error en TiposIngresoController:', error);

    if (error.message === 'NO_ENCONTRADO') {
      res.status(404).json({
        ok: false,
        error: {
          codigo: 'NO_ENCONTRADO',
          mensaje: 'Tipo de ingreso no encontrado'
        }
      });
      return;
    }

    if (error.message.startsWith('DATOS_INVALIDOS')) {
      res.status(422).json({
        ok: false,
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje: error.message
        }
      });
      return;
    }

    res.status(500).json({
      ok: false,
      error: {
        codigo: 'ERROR_INTERNO',
        mensaje: 'Error interno del servidor'
      }
    });
  }
}