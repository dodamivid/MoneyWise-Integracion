import { db } from "../config/db";
import { toMySQLDateTime } from "../utils/mysqlDate";
import { FechaCorteDTO } from "../dtos/fechasCorte.dto";

/**
 * Repository para Fechas de Corte de Ahorro.
 *
 * Issue #91: conectado a `sp_fechasCorte_*` cuando `DB_ENABLED`/`USE_DB` está
 * activo; si no, cae al almacenamiento en memoria de abajo (tests / dev sin
 * base de datos). Sigue el mismo patrón que `tiposEgreso.repository.ts`.
 */
export class FechasCorteRepository {
  private fechas: FechaCorteDTO[] = [];
  private nextId = 1;

  async listar(
    usuarioId: number,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ datos: FechaCorteDTO[]; total: number }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_fechasCorte_listar", [
        usuarioId,
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

      const datos = dataRows.map((row) => ({
        fechaCorteId: Number(row.fechaCorteId),
        usuarioId: row.usuarioId?.toString(),
        fechaCorte: row.fechaCorte,
        creadoEn: row.creadoEn,
      }));

      return { datos, total };
    }

    const disponibles = this.fechas.filter(
      (f) => f.usuarioId === usuarioId.toString()
    );

    const [campo, direccion] = orden.split(":");
    const factor = direccion === "asc" ? 1 : -1;
    const ordenados = [...disponibles].sort((a, b) => {
      const va = (a as any)[campo] ?? "";
      const vb = (b as any)[campo] ?? "";
      if (va < vb) return -1 * factor;
      if (va > vb) return 1 * factor;
      return 0;
    });

    const total = ordenados.length;
    const inicio = (pagina - 1) * tamanoPagina;
    const datos = ordenados.slice(inicio, inicio + tamanoPagina);

    return { datos, total };
  }

  async crear(
    usuarioId: number,
    fechaCorte: string
  ): Promise<{ fechaCorteId: number }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_fechasCorte_crear", [
        usuarioId,
        toMySQLDateTime(fechaCorte),
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      if (!rows.length) {
        throw new Error("Error al crear fecha de corte");
      }
      return { fechaCorteId: Number(rows[0].fechaCorteId) };
    }

    const yaExiste = this.fechas.some(
      (f) =>
        f.usuarioId === usuarioId.toString() && f.fechaCorte === fechaCorte
    );
    if (yaExiste) {
      throw new Error("DUPLICADO:La fecha de corte ya existe para el usuario");
    }

    const fechaCorteId = this.nextId++;
    this.fechas.push({
      fechaCorteId,
      usuarioId: usuarioId.toString(),
      fechaCorte,
      creadoEn: new Date().toISOString(),
    });
    return { fechaCorteId };
  }

  async eliminar(fechaCorteId: number, usuarioId: number): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_fechasCorte_eliminar", [
        fechaCorteId,
        usuarioId,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].eliminado) : false;
    }

    const existe = this.fechas.find(
      (f) =>
        f.fechaCorteId === fechaCorteId &&
        f.usuarioId === usuarioId.toString()
    );
    if (!existe) return false;

    this.fechas = this.fechas.filter((f) => f.fechaCorteId !== fechaCorteId);
    return true;
  }

  /** Solo para pruebas: limpia el almacenamiento en memoria. */
  async clear(): Promise<void> {
    this.fechas = [];
    this.nextId = 1;
  }
}

export const fechasCorteRepository = new FechasCorteRepository();
