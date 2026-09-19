import { fechasCorteRepository } from "../repositories/fechasCorte.repository";
import {
  ListarFechasCorteResponse,
  CrearFechaCorteResponse,
  EliminarFechaCorteResponse,
} from "../dtos/fechasCorte.dto";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} from "../utils/errors";

/**
 * @fileoverview Service para lógica de negocio de Fechas de Corte de Ahorro
 * Issue #91 - Alimenta `fechas_corte_ahorro`, de la que depende
 * `GET /dashboard/balance` (ver dashboard.service.ts, que ya sabía leerla
 * pero nunca tuvo cómo escribirla).
 */
export class FechasCorteService {
  constructor(private readonly repository = fechasCorteRepository) {}

  async listar(
    usuarioId: number,
    pagina: number = 1,
    tamanoPagina: number = 20,
    orden: string = "fechaCorte:desc"
  ): Promise<ListarFechasCorteResponse> {
    try {
      const { datos, total } = await this.repository.listar(
        usuarioId,
        pagina,
        tamanoPagina,
        orden
      );

      return {
        ok: true,
        data: datos,
        meta: {
          paginacion: {
            pagina,
            tamanoPagina,
            total,
          },
        },
      };
    } catch (error) {
      console.error("[FechasCorteService] Error en listar:", error);
      throw new InternalServerError("Error al listar fechas de corte");
    }
  }

  async crear(
    usuarioId: number,
    fechaCorte: string
  ): Promise<CrearFechaCorteResponse> {
    try {
      const resultado = await this.repository.crear(usuarioId, fechaCorte);

      return {
        ok: true,
        data: resultado,
      };
    } catch (error: any) {
      // Mapear errores del SP (formato "CODIGO:mensaje", ver SIGNAL en
      // db/moneywise_schema.sql) a clases de error apropiadas
      if (error.message?.includes("DUPLICADO")) {
        throw new ConflictError(
          "Ya existe una fecha de corte igual para este usuario"
        );
      }

      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }

      console.error("[FechasCorteService] Error en crear:", error);
      throw new InternalServerError("Error al crear fecha de corte");
    }
  }

  async eliminar(
    fechaCorteId: number,
    usuarioId: number
  ): Promise<EliminarFechaCorteResponse> {
    try {
      const eliminado = await this.repository.eliminar(
        fechaCorteId,
        usuarioId
      );

      if (!eliminado) {
        throw new NotFoundError("Fecha de corte", fechaCorteId.toString());
      }

      return {
        ok: true,
        data: { eliminado: true },
      };
    } catch (error: any) {
      // Mapear errores del SP (formato "CODIGO:mensaje")
      if (error.message?.includes("NO_ENCONTRADO")) {
        throw new NotFoundError("Fecha de corte", fechaCorteId.toString());
      }

      if (error instanceof NotFoundError) {
        throw error;
      }

      console.error("[FechasCorteService] Error en eliminar:", error);
      throw new InternalServerError("Error al eliminar fecha de corte");
    }
  }
}

export const fechasCorteService = new FechasCorteService();
