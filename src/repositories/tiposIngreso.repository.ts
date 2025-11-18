export interface TipoIngreso {
  tipoIngresoId: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export class TiposIngresoRepository {
  private tipos: TipoIngreso[] = [];

  constructor() {
    const now = new Date().toISOString();
    this.tipos = [
      { tipoIngresoId: 1, nombre: "Salario", activo: true, creadoEn: now, actualizadoEn: now },
      { tipoIngresoId: 2, nombre: "Comisiones", activo: true, creadoEn: now, actualizadoEn: now },
    ];
  }

  async listar(
    pagina: number = 1,
    tamanoPagina: number = 20,
    orden: string = "nombre:asc",
    activo?: boolean
  ): Promise<{ data: TipoIngreso[]; total: number }> {
    let filtrados = this.tipos;
    if (activo !== undefined) {
      filtrados = filtrados.filter((t) => t.activo === activo);
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
    const data = filtrados.slice(inicio, inicio + tamanoPagina);
    return { data, total };
  }

  async obtenerPorId(tipoIngresoId: number): Promise<TipoIngreso | null> {
    return this.tipos.find((t) => t.tipoIngresoId === tipoIngresoId) ?? null;
  }

  async crear(
    nombre: string,
    descripcion?: string,
    activo: boolean = true
  ): Promise<{ tipoIngresoId: number }> {
    const tipoIngresoId = Math.max(...this.tipos.map((t) => t.tipoIngresoId), 0) + 1;
    const now = new Date().toISOString();
    this.tipos.push({
      tipoIngresoId,
      nombre,
      descripcion,
      activo,
      creadoEn: now,
      actualizadoEn: now,
    });
    return { tipoIngresoId };
  }

  async actualizar(
    tipoIngresoId: number,
    nombre?: string,
    descripcion?: string,
    activo?: boolean
  ): Promise<{ actualizado: boolean }> {
    const tipo = this.tipos.find((t) => t.tipoIngresoId === tipoIngresoId);
    if (!tipo) return { actualizado: false };
    if (nombre) tipo.nombre = nombre;
    if (descripcion !== undefined) tipo.descripcion = descripcion;
    if (activo !== undefined) tipo.activo = activo;
    tipo.actualizadoEn = new Date().toISOString();
    return { actualizado: true };
  }

  async eliminar(tipoIngresoId: number): Promise<{ eliminado: boolean }> {
    const len = this.tipos.length;
    this.tipos = this.tipos.filter((t) => t.tipoIngresoId !== tipoIngresoId);
    return { eliminado: this.tipos.length < len };
  }
}

export default new TiposIngresoRepository();
