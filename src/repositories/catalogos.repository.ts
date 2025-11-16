import { DestinoDTO, FrecuenciaDTO } from "../dtos/catalogos.dto";

/**
 * Repository en memoria para catálogos (Destinos y Frecuencias).
 * Esta implementación persiste mientras viva el proceso y sirve como contrato
 * para que BD adapte sus SPs a nuestra firma:
 *  - sp_destinos_listar/crear/actualizar/eliminar
 *  - sp_frecuencias_listar/crear/actualizar/eliminar
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
    const destino = this.destinos.find((d) => d.destinoId === destinoId);
    if (!destino) return false;
    destino.nombre = nombre;
    destino.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarDestino(destinoId: number, usuarioId: string): Promise<boolean> {
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
    const frecuencia = this.frecuencias.find(
      (f) => f.frecuenciaId === frecuenciaId
    );
    if (!frecuencia) return false;
    frecuencia.nombre = nombre;
    frecuencia.actualizadoEn = new Date().toISOString();
    return true;
  }

  async eliminarFrecuencia(frecuenciaId: number): Promise<boolean> {
    const len = this.frecuencias.length;
    this.frecuencias = this.frecuencias.filter(
      (f) => f.frecuenciaId !== frecuenciaId
    );
    return this.frecuencias.length < len;
  }
}

export const catalogosRepository = new CatalogosRepository();
