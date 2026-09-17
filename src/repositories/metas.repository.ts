/**
 * @fileoverview Repositorio para la gestión de datos de Meta.
 *
 * Issue #87: conectado a `sp_metas_listar/crear/actualizar/eliminar` cuando
 * `DB_ENABLED`/`USE_DB` está activo; si no, cae al almacenamiento en memoria
 * de abajo (usado en tests y en dev sin base de datos). La interfaz pública
 * (create/findById/findAll/update/delete/...) se mantiene igual para no
 * tener que tocar `metas.service.ts`/`metas.controller.ts` más de lo
 * estrictamente necesario.
 *
 * Notas sobre el mapeo a los SPs:
 * - `sp_metas_listar` exige `usuario_id = ?` (no es catálogo global como
 *   destinos/frecuencias) — si no hay `usuarioId` en el filtro, la consulta
 *   real no puede traer nada; se documenta como limitación conocida, igual
 *   que ya era el comportamiento implícito (sin auth real) de este módulo.
 * - `sp_metas_actualizar` exige `pUsuarioId` para su propio chequeo de
 *   propiedad, pero `metas.service.ts`/`metas.controller.ts` no validan
 *   dueño en `update()` (solo en `delete()`). Para no cambiar ese
 *   comportamiento existente, `update()` primero obtiene el dueño real de la
 *   meta y se lo pasa al SP, preservando el comportamiento actual (cualquiera
 *   con el ID puede actualizar) sin romper el `WHERE usuario_id = ?` del SP.
 * - `delete()` SÍ gana un parámetro `usuarioId` porque el propio
 *   `metas.service.ts` ya valida el dueño antes de llamar al repo — el SP
 *   solo refuerza esa misma regla (defensa en profundidad), no cambia el
 *   comportamiento observable.
 * - La fila de `COUNT(*)` del `UNION ALL` de `sp_metas_listar` se descarta
 *   (issue #75), y las fechas se convierten con `toMySQLDateTime` antes de
 *   llamar al SP (issue #84).
 */

import { db } from "../config/db";
import { toMySQLDateTime } from "../utils/mysqlDate";
import { Meta, CreateMetaInput, UpdateMetaInput } from "../models/meta.model";

export interface MetaFilters {
  usuarioId?: number;
  desde?: string;
  hasta?: string;
  activa?: boolean;
}

export interface PaginationOptions {
  pagina: number;
  tamanoPagina: number;
  orden?: string;
}

export interface PaginatedResult {
  metas: Meta[];
  total: number;
}

export class MetasRepository {
  // ============================================
  // Fallback en memoria (tests / DB_ENABLED=false)
  // ============================================
  private metas: Map<number, Meta> = new Map();
  private nextId: number = 1;

  private mapRow(row: any): Meta {
    return {
      metaId: Number(row.metaId),
      usuarioId: Number(row.usuarioId),
      nombre: row.nombre,
      montoObjetivo: Number(row.montoObjetivo),
      ahorroReal: Number(row.ahorroReal),
      porcentajeAvance: Number(row.porcentajeAvance),
      activa: Boolean(row.activa),
      fechaInicio: row.fechaInicio,
      ...(row.fechaFin ? { fechaFin: row.fechaFin } : {}),
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  async create(metaData: CreateMetaInput): Promise<Meta> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_metas_crear", [
        metaData.usuarioId,
        metaData.nombre,
        metaData.montoObjetivo,
        toMySQLDateTime(metaData.fechaInicio),
        toMySQLDateTime(metaData.fechaFin ?? null),
        metaData.activa ?? true,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      if (!rows.length || !rows[0].metaId) {
        throw new Error("No se pudo crear la meta: la base no devolvió un metaId");
      }
      const creada = await this.findById(Number(rows[0].metaId));
      if (!creada) {
        throw new Error("No se pudo leer la meta recién creada");
      }
      return creada;
    }

    const now = new Date().toISOString();
    const metaId = this.nextId++;
    const meta: Meta = {
      metaId,
      usuarioId: metaData.usuarioId,
      nombre: metaData.nombre,
      montoObjetivo: metaData.montoObjetivo,
      ahorroReal: 0.0,
      porcentajeAvance: 0.0,
      activa: metaData.activa ?? true,
      fechaInicio: metaData.fechaInicio,
      ...(metaData.fechaFin && { fechaFin: metaData.fechaFin }),
      creadoEn: now,
      actualizadoEn: now,
    };
    this.metas.set(metaId, meta);
    return meta;
  }

  async findById(metaId: number): Promise<Meta | null> {
    if (db.enabled && db.pool) {
      try {
        const resultSets = await db.call("sp_metas_obtener", [metaId]);
        const rows = (resultSets[0] as any[]) ?? [];
        return rows.length ? this.mapRow(rows[0]) : null;
      } catch (error: any) {
        if (error.message?.includes("NO_ENCONTRADO")) {
          return null;
        }
        throw error;
      }
    }

    const meta = this.metas.get(metaId);
    return meta ?? null;
  }

  async findAll(
    filters: MetaFilters = {},
    pagination?: PaginationOptions
  ): Promise<PaginatedResult> {
    if (db.enabled && db.pool) {
      const pagina = pagination?.pagina ?? 1;
      const tamanoPagina = pagination?.tamanoPagina ?? 20;
      const orden = pagination?.orden ?? "creadoEn:desc";

      const resultSets = await db.call("sp_metas_listar", [
        filters.usuarioId ?? null,
        toMySQLDateTime(filters.desde ?? null),
        toMySQLDateTime(filters.hasta ?? null),
        filters.activa ?? null,
        pagina,
        tamanoPagina,
        orden,
      ]);

      const rows = (resultSets[0] as any[]) ?? [];
      let total = 0;
      let dataRows = rows;
      const lastRow = rows[rows.length - 1];
      if (
        lastRow &&
        lastRow.totalRegistros !== null &&
        lastRow.totalRegistros !== undefined
      ) {
        total = Number(lastRow.totalRegistros) || 0;
        dataRows = rows.slice(0, -1);
      }

      return { metas: dataRows.map((row) => this.mapRow(row)), total };
    }

    let filteredMetas = Array.from(this.metas.values());

    if (filters.usuarioId !== undefined) {
      filteredMetas = filteredMetas.filter(
        (meta) => meta.usuarioId === filters.usuarioId
      );
    }
    if (filters.activa !== undefined) {
      filteredMetas = filteredMetas.filter((meta) => meta.activa === filters.activa);
    }
    if (filters.desde) {
      const desde = new Date(filters.desde);
      filteredMetas = filteredMetas.filter(
        (meta) => new Date(meta.fechaInicio) >= desde
      );
    }
    if (filters.hasta) {
      const hasta = new Date(filters.hasta);
      filteredMetas = filteredMetas.filter((meta) => {
        const fechaComparar = meta.fechaFin
          ? new Date(meta.fechaFin)
          : new Date(meta.fechaInicio);
        return fechaComparar <= hasta;
      });
    }

    const total = filteredMetas.length;

    if (pagination?.orden) {
      const [campo, direccion = "asc"] = pagination.orden.split(":");
      filteredMetas = this.sortMetas(filteredMetas, campo, direccion as "asc" | "desc");
    }

    if (pagination) {
      const { pagina, tamanoPagina } = pagination;
      const startIndex = (pagina - 1) * tamanoPagina;
      const endIndex = startIndex + tamanoPagina;
      filteredMetas = filteredMetas.slice(startIndex, endIndex);
    }

    return { metas: filteredMetas, total };
  }

  async findByUsuarioId(usuarioId: number): Promise<Meta[]> {
    const result = await this.findAll({ usuarioId });
    return result.metas;
  }

  /**
   * Actualiza una meta. No valida dueño aquí (ver nota de arriba: eso ya lo
   * hace -o no- `metas.service.ts`, y no se cambia ese comportamiento en
   * este issue); en el camino a la base obtiene el usuario real de la meta
   * para satisfacer el `WHERE usuario_id = ?` del SP.
   */
  async update(metaId: number, updateData: UpdateMetaInput): Promise<Meta | null> {
    if (db.enabled && db.pool) {
      const actual = await this.findById(metaId);
      if (!actual) return null;

      try {
        const resultSets = await db.call("sp_metas_actualizar", [
          metaId,
          actual.usuarioId,
          updateData.nombre ?? null,
          updateData.montoObjetivo ?? null,
          updateData.ahorroReal ?? null,
          toMySQLDateTime(updateData.fechaInicio ?? null),
          toMySQLDateTime(updateData.fechaFin ?? null),
          updateData.activa ?? null,
        ]);
        const rows = (resultSets[0] as any[]) ?? [];
        if (!rows.length || !rows[0].actualizado) {
          return null;
        }
      } catch (error: any) {
        if (error.message?.includes("NO_ENCONTRADO")) {
          return null;
        }
        throw error;
      }

      return this.findById(metaId);
    }

    const existingMeta = await this.findById(metaId);
    if (!existingMeta) {
      return null;
    }

    const updatedMeta: Meta = {
      ...existingMeta,
      ...updateData,
      actualizadoEn: new Date().toISOString(),
    };

    const montoObjetivo = updateData.montoObjetivo ?? existingMeta.montoObjetivo;
    const ahorroReal = updateData.ahorroReal ?? existingMeta.ahorroReal;
    updatedMeta.porcentajeAvance = this.calcularPorcentajeAvance(
      ahorroReal,
      montoObjetivo
    );

    this.metas.set(metaId, updatedMeta);
    return updatedMeta;
  }

  /**
   * Elimina (soft delete) una meta. `usuarioId` es requerido porque el SP lo
   * usa como parte de su `WHERE usuario_id = ?` -- `metas.service.ts` ya lo
   * valida antes de llamar aquí, así que esto es defensa en profundidad, no
   * un cambio de comportamiento observable.
   */
  async delete(metaId: number, usuarioId: number): Promise<boolean> {
    if (db.enabled && db.pool) {
      try {
        const resultSets = await db.call("sp_metas_eliminar", [metaId, usuarioId]);
        const rows = (resultSets[0] as any[]) ?? [];
        return rows.length > 0 && Boolean(rows[0].eliminado);
      } catch (error: any) {
        if (error.message?.includes("NO_ENCONTRADO")) {
          return false;
        }
        throw error;
      }
    }

    const existingMeta = await this.findById(metaId);
    if (!existingMeta) {
      return false;
    }

    // Fallback en memoria: soft delete vía `activa = false` (no hay columna
    // `eliminado_en` separada en este almacenamiento simplificado).
    const updated = await this.update(metaId, {
      activa: false,
      actualizadoEn: new Date().toISOString(),
    });

    return updated !== null;
  }

  async hardDelete(metaId: number): Promise<boolean> {
    return this.metas.delete(metaId);
  }

  async count(): Promise<number> {
    if (db.enabled && db.pool) {
      const { total } = await this.findAll({}, { pagina: 1, tamanoPagina: 1 });
      return total;
    }
    return this.metas.size;
  }

  async countActiveByUsuario(usuarioId: number): Promise<number> {
    const result = await this.findAll({ usuarioId, activa: true });
    return result.total;
  }

  async exists(metaId: number): Promise<boolean> {
    if (db.enabled && db.pool) {
      return (await this.findById(metaId)) !== null;
    }
    return this.metas.has(metaId);
  }

  async clear(): Promise<void> {
    this.metas.clear();
    this.nextId = 1;
  }

  private calcularPorcentajeAvance(ahorroReal: number, montoObjetivo: number): number {
    if (montoObjetivo === 0) return 0;
    const porcentaje = (ahorroReal / montoObjetivo) * 100;
    return Math.round(porcentaje * 100) / 100;
  }

  private sortMetas(metas: Meta[], campo: string, direccion: "asc" | "desc"): Meta[] {
    return metas.sort((a, b) => {
      let comparison = 0;
      switch (campo) {
        case "fechaInicio":
          comparison =
            new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime();
          break;
        case "fechaFin": {
          const aFin = a.fechaFin ? new Date(a.fechaFin).getTime() : 0;
          const bFin = b.fechaFin ? new Date(b.fechaFin).getTime() : 0;
          comparison = aFin - bFin;
          break;
        }
        case "creadoEn":
          comparison = new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime();
          break;
        case "montoObjetivo":
          comparison = a.montoObjetivo - b.montoObjetivo;
          break;
        case "porcentajeAvance":
          comparison = a.porcentajeAvance - b.porcentajeAvance;
          break;
        default:
          comparison = 0;
      }
      return direccion === "desc" ? -comparison : comparison;
    });
  }
}

export const metasRepository = new MetasRepository();
