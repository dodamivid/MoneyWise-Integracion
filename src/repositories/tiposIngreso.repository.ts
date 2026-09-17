import { db } from "../config/db";
import { TipoIngresoDTO } from "../dtos/tiposIngreso.dto";

/**
 * Repository para Tipos de Ingreso.
 *
 * Issue #77: rediseñado para alinear con la tabla real (`usuario_id`/
 * `es_por_defecto`) y conectado a `sp_tiposIngreso_*` cuando `DB_ENABLED`/
 * `USE_DB` está activo; si no, cae al almacenamiento en memoria de abajo
 * (tests / dev sin base de datos). Sigue el mismo patrón que
 * `tiposEgreso.repository.ts`.
 */
export class TiposIngresoRepository {
  private tipos: TipoIngresoDTO[] = [];

  constructor() {
    const now = new Date().toISOString();
    this.tipos = [
      {
        tipoIngresoId: 1,
        usuarioId: null,
        nombre: "Efectivo",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        tipoIngresoId: 2,
        usuarioId: null,
        nombre: "Transferencia",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
      {
        tipoIngresoId: 3,
        usuarioId: null,
        nombre: "Cheque",
        esPorDefecto: true,
        creadoEn: now,
        actualizadoEn: now,
      },
    ];
  }

  async listarTiposIngreso(
    usuarioId: string,
    buscar: string | null,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<{ datos: TipoIngresoDTO[]; total: number }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposIngreso_listar", [
        usuarioId,
        buscar ?? "",
        pagina,
        tamanoPagina,
        orden,
      ]);

      const rows = (resultSets[0] as any[]) ?? [];

      // El SP trae los datos + el total en un solo UNION ALL: la última fila
      // es la de COUNT(*) y no debe mapearse como un registro real (#75).
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
        tipoIngresoId: Number(row.tipoIngresoId),
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

  async crearTipoIngreso(
    usuarioId: string,
    nombre: string
  ): Promise<{ tipoIngresoId: number; nombre: string }> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposIngreso_crear", [
        usuarioId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      if (!rows.length) {
        throw new Error("Error al crear tipo de ingreso");
      }
      return {
        tipoIngresoId: Number(rows[0].tipoIngresoId),
        nombre: rows[0].nombre,
      };
    }

    const existe = this.tipos.find(
      (t) => t.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      throw new Error("DUPLICADO:Ya existe un tipo de ingreso con este nombre");
    }

    const tipoIngresoId =
      Math.max(...this.tipos.map((t) => t.tipoIngresoId), 0) + 1;
    const now = new Date().toISOString();
    this.tipos.push({
      tipoIngresoId,
      usuarioId,
      nombre,
      esPorDefecto: false,
      creadoEn: now,
      actualizadoEn: now,
    });
    return { tipoIngresoId, nombre };
  }

  async actualizarTipoIngreso(
    tipoIngresoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposIngreso_actualizar", [
        tipoIngresoId,
        usuarioId,
        nombre,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].actualizado) : false;
    }

    const tipo = this.tipos.find((t) => t.tipoIngresoId === tipoIngresoId);
    if (!tipo) return false;
    if (tipo.esPorDefecto && tipo.usuarioId === null && usuarioId !== "admin") {
      throw new Error(
        "PERMISO_DENEGADO:No tienes permiso para modificar este tipo de ingreso"
      );
    }
    tipo.nombre = nombre;
    tipo.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarTipoIngreso(
    tipoIngresoId: number,
    usuarioId: string
  ): Promise<boolean> {
    if (db.enabled && db.pool) {
      const resultSets = await db.call("sp_tiposIngreso_eliminar", [
        tipoIngresoId,
        usuarioId,
      ]);
      const rows = (resultSets[0] as any[]) ?? [];
      return rows.length > 0 ? Boolean(rows[0].eliminado) : false;
    }

    const tipo = this.tipos.find((t) => t.tipoIngresoId === tipoIngresoId);
    if (!tipo) return false;
    if (tipo.esPorDefecto && tipo.usuarioId === null && usuarioId !== "admin") {
      throw new Error(
        "PERMISO_DENEGADO:No puedes eliminar tipos de ingreso por defecto"
      );
    }
    const len = this.tipos.length;
    this.tipos = this.tipos.filter((t) => t.tipoIngresoId !== tipoIngresoId);
    return this.tipos.length < len;
  }
}

export const tiposIngresoRepository = new TiposIngresoRepository();
