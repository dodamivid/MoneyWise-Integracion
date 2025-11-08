import { CrearFechaCorteSchema, CrearFechaCorteInput, ListarFechasCorteQuerySchema, ListarFechasCorteQuery } from "../models/fechasCorte.model";
import { fechasCorteRepository } from "../repositories/fechasCorte.repository";
import { ValidationError, NotFoundError, BadRequestError, ForbiddenError, ConflictError, UnprocessableEntityError } from "../utils/errors";

// Simulación mínima de scopes (en el futuro se integrará JWT real). Se espera que el controlador provea usuarioId del token.
export interface ContextAuth {
  usuarioIdToken: number; // id extraído de JWT (sub)
  scopes: string[]; // scopes del token
  esAdminAhorro: boolean; // derivado de scopes tipo 'admin:ahorro'
}

export class FechasCorteService {
  async listar(query: ListarFechasCorteQuery, ctx: ContextAuth) {
    // Validar query
    let parsed: ListarFechasCorteQuery;
    try {
      parsed = ListarFechasCorteQuerySchema.parse(query);
    } catch (e: any) {
      throw new UnprocessableEntityError(
        "DATOS_INVALIDOS"
      );
    }

    // Si se solicita usuarioId distinto al del token y no es admin => permiso denegado
    if (
      parsed.usuarioId &&
      parsed.usuarioId !== ctx.usuarioIdToken &&
      !ctx.esAdminAhorro
    ) {
      throw new ForbiddenError("PERMISO_DENEGADO");
    }

    const usuarioIdConsulta = parsed.usuarioId ?? ctx.usuarioIdToken;
    const { rows, total } = await fechasCorteRepository.listar(
      usuarioIdConsulta,
      parsed.pagina,
      parsed.tamanoPagina,
      parsed.orden!
    );

    return {
      rows,
      meta: {
        paginacion: {
          pagina: parsed.pagina,
          tamanoPagina: parsed.tamanoPagina,
          total,
        },
      },
    };
  }

  async crear(input: CrearFechaCorteInput, ctx: ContextAuth) {
    let parsed: CrearFechaCorteInput;
    try {
      parsed = CrearFechaCorteSchema.parse(input);
    } catch (e: any) {
      throw new UnprocessableEntityError("DATOS_INVALIDOS");
    }

    const usuarioObjetivo = parsed.usuarioId ?? ctx.usuarioIdToken;
    if (parsed.usuarioId && parsed.usuarioId !== ctx.usuarioIdToken && !ctx.esAdminAhorro) {
      throw new ForbiddenError("PERMISO_DENEGADO");
    }

    // Primero: duplicados -> retornar 409
    const yaExiste = await fechasCorteRepository.existeFecha(
      usuarioObjetivo,
      parsed.fechaCorte
    );
    if (yaExiste) {
      throw new ConflictError("DUPLICADO");
    }

    // Después: regla opcional - fechaCorte > última
    const ultima = await fechasCorteRepository.obtenerUltima(usuarioObjetivo);
    if (ultima && parsed.fechaCorte <= ultima.fechaCorte) {
      throw new UnprocessableEntityError("DATOS_INVALIDOS");
    }

    try {
      const creada = await fechasCorteRepository.crear(parsed, usuarioObjetivo);
      return { fechaCorteId: creada.fechaCorteId };
    } catch (e: any) {
      if (e.message === "DUPLICADO") {
        throw new ConflictError("DUPLICADO");
      }
      throw e;
    }
  }

  async eliminar(idRaw: string, ctx: ContextAuth) {
    const id = Number(idRaw);
    if (Number.isNaN(id) || id <= 0) {
      throw new ValidationError("ID inválido");
    }

    // No permitir eliminar de otro usuario sin admin
    // Para simplificar, buscamos primero el record para ver usuario
    // (en repo actual no hay findById, así que usamos listado completo)
    const { rows } = await fechasCorteRepository.listar(undefined, 1, 100000, "fechaCorte:asc");
    const record = rows.find((r) => r.fechaCorteId === id);
    if (!record) {
      throw new NotFoundError("Fecha de corte", String(id));
    }
    if (record.usuarioId !== ctx.usuarioIdToken && !ctx.esAdminAhorro) {
      throw new ForbiddenError("PERMISO_DENEGADO");
    }

    const ok = await fechasCorteRepository.eliminar(id, record.usuarioId);
    if (!ok) {
      throw new NotFoundError("Fecha de corte", String(id));
    }
    return { eliminado: true };
  }
}

export const fechasCorteService = new FechasCorteService();
