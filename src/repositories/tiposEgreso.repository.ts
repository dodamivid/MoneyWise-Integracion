import { TipoEgresoDTO } from "../dtos/tiposEgreso.dto";

/**
 * Repository en memoria para Tipos de Egreso.
 * En ambientes sin BD usa seeds y operaciones síncronas simuladas.
 * Si en el futuro se conecta a SPs, adaptar aquí manteniendo la firma.
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
    const existe = this.tipos.find(
      (t) => t.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      throw new Error("Ya existe un tipo de egreso con este nombre");
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
    const tipo = this.tipos.find((t) => t.tipoEgresoId === tipoEgresoId);
    if (!tipo) return false;
    if (tipo.esPorDefecto && tipo.usuarioId === null && usuarioId !== "admin") {
      throw new Error("No tienes permiso para modificar este tipo de egreso");
    }
    tipo.nombre = nombre;
    tipo.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarTipoEgreso(
    tipoEgresoId: number,
    usuarioId: string
  ): Promise<boolean> {
    const tipo = this.tipos.find((t) => t.tipoEgresoId === tipoEgresoId);
    if (!tipo) return false;
    if (tipo.esPorDefecto && tipo.usuarioId === null && usuarioId !== "admin") {
      throw new Error("No puedes eliminar tipos de egreso por defecto");
    }
    const len = this.tipos.length;
    this.tipos = this.tipos.filter((t) => t.tipoEgresoId !== tipoEgresoId);
    return this.tipos.length < len;
  }
}

export const tiposEgresoRepository = new TiposEgresoRepository();
