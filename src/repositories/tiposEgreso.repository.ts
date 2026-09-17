import { db } from "../config/db";
import { TipoEgresoDTO } from "../dtos/tiposEgreso.dto";

/**
 * Repository para Tipos de Egreso.
 *
 * Issue #71: conectado a `sp_tiposEgreso_*` cuando `DB_ENABLED`/`USE_DB` está
 * activo; si no, cae al almacenamiento en memoria de abajo (tests / dev sin
 * base de datos). Sigue el mismo patrón que
 * `catalogosProcedencia.repository.ts`.
 */
export class TiposEgresoRepository {
  private tipos: TipoEgresoDTO[] = [];

  constructor() {
    const now = new Date().toISOString();
    this.tipos = [
      {
        tipoEgresoId: 1,
        usuarioId: null,
        nombre: "Renta",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        tipoEgresoId: 2,
        usuarioId: null,
        nombre: "Servicios",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        tipoEgresoId: 3,
        usuarioId: null,
        nombre: "Transporte",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
    ];
  }

  async listarTiposEgreso(
    usuarioId: string,
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ datos: TipoEgresoDTO[]; total: number }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposEgreso_listar", [
        usuarioId,
        buscar ?? "",
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
        tipoEgresoId: Number(row.tipoEgresoId),
        usuarioId: row.usuarioId?.toString() ?? null,
        nombre: row.nombre,
        esPorDefecto: Boolean(row.esPorDefecto),
        creadoEn: row.creadoEn,
        actualizadoEn: row.actualizadoEn,
      }));

      return { datos, total };
    }

    const disponibles = this.tipos.filter(
      (t) => t.usuarioId === null || t.usuarioId === usuarioId
    );

    let filtrados = disponibles;
    if (buscar) {
      const term = buscar.toLowerCase();
      filtrados = filtrados.filter((t) =>
        t.nombre.toLowerCase().includes(term)
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
    const datos = filtrados.slice(inicio, inicio + tamanoPagina);

    return { datos, total };
  }

  async crearTipoEgreso(
    usuarioId: string,
    nombre: string
  ): Promise<{ tipoEgresoId: number; nombre: string }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposEgreso_crear", [
        usuarioId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      if (!rows.length) {
        throw new Error("Error al crear tipo de egreso");
      }
      return {
        tipoEgresoId: Number(rows[0].tipoEgresoId),
        nombre: rows[0].nombre,
      };
    }

    const existe = this.tipos.find(
      (t) => t.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      throw new Error("DUPLICADO:Ya existe un tipo de egreso con este nombre");
    }

    const tipoEgresoId =
      Math.max(...this.tipos.map((t) => t.tipoEgresoId), 0) + 1;
    const now = new Date().toISOString();
    this.tipos.push({
      tipoEgresoId,
      usuarioId,
      nombre,
      esPorDefecto: false,
      creadoEn: now,
      actualizadoEn: now,
    });
    return { tipoEgresoId, nombre };
  }

  async actualizarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposEgreso_actualizar", [
        tipoEgresoId,
        usuarioId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].actualizado) : false;
    }

    const tipo = this.tipos.find((t) => t.tipoEgresoId === tipoEgresoId);
    if (!tipo) return false;
    if (tipo.esPorDefecto && tipo.usuarioId === null && usuarioId !== "admin") {
      throw new Error("PERMISO_DENEGADO:No tienes permiso para modificar este tipo de egreso");
    }
    tipo.nombre = nombre;
    tipo.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposEgreso_eliminar", [
        tipoEgresoId,
        usuarioId,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].eliminado) : false;
    }

    const tipo = this.tipos.find((t) => t.tipoEgresoId === tipoEgresoId);
    if (!tipo) return false;
    if (tipo.esPorDefecto && tipo.usuarioId === null && usuarioId !== "admin") {
      throw new Error("PERMISO_DENEGADO:No puedes eliminar tipos de egreso por defecto");
    }
    const len = this.tipos.length;
    this.tipos = this.tipos.filter((t) => t.tipoEgresoId !== tipoEgresoId);
    return this.tipos.length < len;
  }
}

export const tiposEgresoRepository = new TiposEgresoRepository();
