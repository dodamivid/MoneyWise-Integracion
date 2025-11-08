import { FechaCorte, CrearFechaCorteInput } from "../models/fechasCorte.model";

interface ListarResult {
  rows: FechaCorte[];
  total: number;
}

// Orden permitido
function aplicarOrden(data: FechaCorte[], orden: string): FechaCorte[] {
  const [campo, dirRaw] = orden.split(":");
  const dir = dirRaw === "asc" ? 1 : -1; // por defecto desc si no asc
  return [...data].sort((a, b) => {
    const va = a[campo as keyof FechaCorte];
    const vb = b[campo as keyof FechaCorte];
    if (typeof va === "string" && typeof vb === "string") {
      return va.localeCompare(vb) * dir;
    }
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * dir;
    }
    return 0;
  });
}

let autoId = 1;

export class FechasCorteRepository {
  private storage: FechaCorte[] = [];

  async listar(
    usuarioId: number | undefined,
    pagina: number,
    tamanoPagina: number,
    orden: string
  ): Promise<ListarResult> {
    let data = this.storage;
    if (usuarioId) {
      data = data.filter((r) => r.usuarioId === usuarioId);
    }
    data = aplicarOrden(data, orden);

    const total = data.length;
    const start = (pagina - 1) * tamanoPagina;
    const rows = data.slice(start, start + tamanoPagina);
    return { rows, total };
  }

  async crear(input: CrearFechaCorteInput, usuarioId: number): Promise<FechaCorte> {
    // Validar duplicado para usuario
    const existe = this.storage.find(
      (r) => r.usuarioId === usuarioId && r.fechaCorte === input.fechaCorte
    );
    if (existe) {
      throw new Error("DUPLICADO");
    }
    const now = new Date().toISOString();
    const record: FechaCorte = {
      fechaCorteId: autoId++,
      usuarioId,
      fechaCorte: input.fechaCorte,
      creadoEn: now,
    };
    this.storage.push(record);
    return record;
  }

  async eliminar(id: number, usuarioId: number): Promise<boolean> {
    const idx = this.storage.findIndex(
      (r) => r.fechaCorteId === id && r.usuarioId === usuarioId
    );
    if (idx === -1) return false;
    this.storage.splice(idx, 1);
    return true;
  }

  async obtenerUltima(usuarioId: number): Promise<FechaCorte | null> {
    const records = this.storage
      .filter((r) => r.usuarioId === usuarioId)
      .sort((a, b) => b.fechaCorte.localeCompare(a.fechaCorte));
    return records[0] ?? null;
  }

  async existeFecha(usuarioId: number, fechaCorte: string): Promise<boolean> {
    return this.storage.some(
      (r) => r.usuarioId === usuarioId && r.fechaCorte === fechaCorte
    );
  }
}

export const fechasCorteRepository = new FechasCorteRepository();
