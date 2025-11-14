import { db } from "../config/db";
import { DestinoDTO } from "../dtos/catalogos.dto";

/**
 * @fileoverview Repository para catálogos de destinos
 * Maneja las llamadas a Stored Procedures de MySQL
 */

/**
 * Tipo para el resultado de paginación del SP
 */
interface SPListarResult {
  destinoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: 0 | 1; // MySQL devuelve BOOLEAN como 0/1
  creadoEn: string;
  actualizadoEn: string;
  totalRegistros?: number; // Solo viene en la primera fila
}

interface SPCrearResult {
  destinoId: number;
  nombre: string;
}

interface SPActualizarResult {
  actualizado: 0 | 1;
}

interface SPEliminarResult {
  eliminado: 0 | 1;
}

export class CatalogosRepository {
  /**
   * Lista destinos con filtros y paginación
   * SP: sp_destinos_listar(pUsuarioId, pBuscar, pPagina, pTam, pOrden)
   */
  async listarDestinos(
    usuarioId: string,
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ destinos: DestinoDTO[]; total: number }> {
    const [resultSets] = await db.call<SPListarResult[]>(
      "sp_destinos_listar(?, ?, ?, ?, ?)",
      [usuarioId, buscar, pagina, tamanoPagina, orden]
    );

    const rows = resultSets as unknown as SPListarResult[];

    if (!rows || rows.length === 0) {
      return { destinos: [], total: 0 };
    }

    // El total viene en todas las filas (misma columna calculada)
    const total = rows[0].totalRegistros || 0;

    // Mapear a DTO y convertir 0/1 a boolean
    const destinos: DestinoDTO[] = rows.map((row) => ({
      destinoId: row.destinoId,
      usuarioId: row.usuarioId,
      nombre: row.nombre,
      esPorDefecto: row.esPorDefecto === 1,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    }));

    return { destinos, total };
  }

  /**
   * Crea un nuevo destino
   * SP: sp_destinos_crear(pUsuarioId, pNombre)
   */
  async crearDestino(
    usuarioId: string,
    nombre: string
  ): Promise<{ destinoId: number; nombre: string }> {
    const [resultSets] = await db.call<SPCrearResult[]>(
      "sp_destinos_crear(?, ?)",
      [usuarioId, nombre]
    );

    const rows = resultSets as unknown as SPCrearResult[];

    if (!rows || rows.length === 0) {
      throw new Error("El SP no devolvió resultado");
    }

    return {
      destinoId: rows[0].destinoId,
      nombre: rows[0].nombre,
    };
  }

  /**
   * Actualiza un destino existente
   * SP: sp_destinos_actualizar(pDestinoId, pUsuarioId, pNombre)
   */
  async actualizarDestino(
    destinoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<boolean> {
    const [resultSets] = await db.call<SPActualizarResult[]>(
      "sp_destinos_actualizar(?, ?, ?)",
      [destinoId, usuarioId, nombre]
    );

    const rows = resultSets as unknown as SPActualizarResult[];

    if (!rows || rows.length === 0) {
      return false;
    }

    return rows[0].actualizado === 1;
  }

  /**
   * Elimina un destino (soft delete)
   * SP: sp_destinos_eliminar(pDestinoId, pUsuarioId)
   */
  async eliminarDestino(
    destinoId: number,
    usuarioId: string
  ): Promise<boolean> {
    const [resultSets] = await db.call<SPEliminarResult[]>(
      "sp_destinos_eliminar(?, ?)",
      [destinoId, usuarioId]
    );

    const rows = resultSets as unknown as SPEliminarResult[];

    if (!rows || rows.length === 0) {
      return false;
    }

    return rows[0].eliminado === 1;
  }
}

// Exportar instancia singleton
export const catalogosRepository = new CatalogosRepository();