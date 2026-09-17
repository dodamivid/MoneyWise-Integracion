import { db } from "../config/db";
import { DestinoDTO, FrecuenciaDTO } from "../dtos/catalogos.dto";

/**
 * Repository para catálogos (Destinos y Frecuencias).
 *
 * Issue #71: conectado a los stored procedures reales
 * (sp_destinos_* y sp_frecuencias_*) cuando `DB_ENABLED`/`USE_DB` está activo;
 * si no, cae al almacenamiento en memoria de abajo (usado en tests y en dev
 * sin base de datos). Sigue el mismo patrón que
 * `catalogosProcedencia.repository.ts`.
 *
 * Nota: en el SP, el SELECT con datos + `ORDER BY`/`LIMIT` va combinado con
 * un segundo SELECT de `COUNT(*)` vía `UNION ALL` (ver comentario en
 * db/moneywise_schema.sql, issue #75). La última fila del result set es la
 * del total y no debe mapearse como un registro real.
 */
export class CatalogosRepository {
  private destinos: DestinoDTO[] = [];
  private frecuencias: FrecuenciaDTO[] = [];

  constructor() {
    const now = new Date().toISOString();
    this.destinos = [
      {
        destinoId: 1,
        usuarioId: null,
        nombre: "Renta",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        destinoId: 2,
        usuarioId: null,
        nombre: "Servicios",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        destinoId: 3,
        usuarioId: null,
        nombre: "Transporte",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        destinoId: 4,
        usuarioId: null,
        nombre: "Alimentación",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
    ];

    const seeds = [
      "Diario",
      "Semanal",
      "Quincenal",
      "Mensual",
      "Bimestral",
      "Trimestral",
      "Semestral",
      "Anual",
    ];
    this.frecuencias = seeds.map((nombre, idx) => ({
      frecuenciaId: idx + 1,
      nombre,
      creadoEn: now,
      actualizadoEn: now,
    }));
  }

  /** Separa la fila de totales (COUNT(*), viene al final del UNION ALL) del resto. */
  private splitTotalRow(rows: any[]): { dataRows: any[]; total: number } {
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
    return { dataRows, total };
  }

  // ============================================
  // DESTINOS
  // ============================================

  async listarDestinos(
    usuarioId: string,
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ destinos: DestinoDTO[]; total: number }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_destinos_listar", [
        usuarioId,
        buscar ?? "",
        pagina,
        tamanoPagina,
        orden,
      ]);

      const rows = (resultSets[0] as any[]) ?? [];
      const { dataRows, total } = this.splitTotalRow(rows);
      const destinos = dataRows.map((row) => ({
        destinoId: Number(row.destinoId),
        usuarioId: row.usuarioId?.toString() ?? null,
        nombre: row.nombre,
        esPorDefecto: Boolean(row.esPorDefecto),
        creadoEn: row.creadoEn,
        actualizadoEn: row.actualizadoEn,
      }));

      return { destinos, total };
    }

    const disponibles = this.destinos.filter(
      (d) => d.usuarioId === null || d.usuarioId === usuarioId
    );

    let filtrados = disponibles;
    if (buscar) {
      const term = buscar.toLowerCase();
      filtrados = filtrados.filter((d) =>
        d.nombre.toLowerCase().includes(term)
      );
    }

    const [campo, direccion] = orden.split(":");
    const factor = direccion === "desc" ? -1 : 1;
    filtrados = filtrados.sort((a, b) => {
      const va = (a as any)[campo] ?? "";
      const vb = (b as any)[campo] ?? "";
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return 0;
    });

    const total = filtrados.length;
    const inicio = (pagina - 1) * tamanoPagina;
    const destinos = filtrados.slice(inicio, inicio + tamanoPagina);

    return { destinos, total };
  }

  async crearDestino(
    usuarioId: string,
    nombre: string
  ): Promise<{ destinoId: number; nombre: string }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_destinos_crear", [
        usuarioId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      if (!rows.length) {
        throw new Error("Error al crear destino");
      }
      return { destinoId: Number(rows[0].destinoId), nombre: rows[0].nombre };
    }

    const destinoId =
      Math.max(...this.destinos.map((d) => d.destinoId), 0) + 1;
    const now = new Date().toISOString();
    this.destinos.push({
      destinoId,
      usuarioId,
      nombre,
      esPorDefecto: false,
      creadoEn: now,
      actualizadoEn: now,
    });
    return { destinoId, nombre };
  }

  async actualizarDestino(
    destinoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_destinos_actualizar", [
        destinoId,
        usuarioId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].actualizado) : false;
    }

    const destino = this.destinos.find((d) => d.destinoId === destinoId);
    if (!destino) return false;
    destino.nombre = nombre;
    destino.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarDestino(destinoId: number, usuarioId: string): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_destinos_eliminar", [
        destinoId,
        usuarioId,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].eliminado) : false;
    }

    const len = this.destinos.length;
    this.destinos = this.destinos.filter((d) => d.destinoId !== destinoId);
    return this.destinos.length < len;
  }

  // ============================================
  // FRECUENCIAS
  // ============================================

  async listarFrecuencias(
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ frecuencias: FrecuenciaDTO[]; total: number }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_frecuencias_listar", [
        buscar ?? "",
        pagina,
        tamanoPagina,
        orden,
      ]);

      const rows = (resultSets[0] as any[]) ?? [];
      const { dataRows, total } = this.splitTotalRow(rows);
      const frecuencias = dataRows.map((row) => ({
        frecuenciaId: Number(row.frecuenciaId),
        nombre: row.nombre,
        creadoEn: row.creadoEn,
        actualizadoEn: row.actualizadoEn,
      }));

      return { frecuencias, total };
    }

    let filtradas = this.frecuencias;
    if (buscar) {
      const term = buscar.toLowerCase();
      filtradas = filtradas.filter((f) =>
        f.nombre.toLowerCase().includes(term)
      );
    }

    const [campo, direccion] = orden.split(":");
    const factor = direccion === "desc" ? -1 : 1;
    filtradas = filtradas.sort((a, b) => {
      const va = (a as any)[campo] ?? "";
      const vb = (b as any)[campo] ?? "";
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return 0;
    });

    const total = filtradas.length;
    const inicio = (pagina - 1) * tamanoPagina;
    const frecuencias = filtradas.slice(inicio, inicio + tamanoPagina);
    return { frecuencias, total };
  }

  async crearFrecuencia(
    nombre: string
  ): Promise<{ frecuenciaId: number; nombre: string }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_frecuencias_crear", [nombre]);
      const rows = (resultSets[0] as any[]) ?? [];
      if (!rows.length) {
        throw new Error("Error al crear frecuencia");
      }
      return {
        frecuenciaId: Number(rows[0].frecuenciaId),
        nombre: rows[0].nombre,
      };
    }

    const frecuenciaId =
      Math.max(...this.frecuencias.map((f) => f.frecuenciaId), 0) + 1;
    const now = new Date().toISOString();
    this.frecuencias.push({
      frecuenciaId,
      nombre,
      creadoEn: now,
      actualizadoEn: now,
    });
    return { frecuenciaId, nombre };
  }

  async actualizarFrecuencia(
    frecuenciaId: number,
    nombre: string
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_frecuencias_actualizar", [
        frecuenciaId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].actualizado) : false;
    }

    const frecuencia = this.frecuencias.find(
      (f) => f.frecuenciaId === frecuenciaId
    );
    if (!frecuencia) return false;
    frecuencia.nombre = nombre;
    frecuencia.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarFrecuencia(frecuenciaId: number): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_frecuencias_eliminar", [
        frecuenciaId,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].eliminado) : false;
    }

    const len = this.frecuencias.length;
    this.frecuencias = this.frecuencias.filter(
      (f) => f.frecuenciaId !== frecuenciaId
    );
    return this.frecuencias.length < len;
  }
}

export const catalogosRepository = new CatalogosRepository();
