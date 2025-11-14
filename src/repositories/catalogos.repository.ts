import { db } from "../config/db";
import { DestinoDTO, FrecuenciaDTO } from "../dtos/catalogos.dto";

/**
 * @fileoverview Repository para catálogos (Destinos y Frecuencias)
 */

// ============================================
// TIPOS DE RESULTADOS DE SPs - DESTINOS
// ============================================

interface SPListarDestinosResult {
  destinoId: number;
  usuarioId: string | null;
  nombre: string;
  esPorDefecto: 0 | 1;
  creadoEn: string;
  actualizadoEn: string;
  totalRegistros?: number;
}

interface SPCrearDestinoResult {
  destinoId: number;
  nombre: string;
}

interface SPActualizarDestinoResult {
  actualizado: 0 | 1;
}

interface SPEliminarDestinoResult {
  eliminado: 0 | 1;
}

// ============================================
// TIPOS DE RESULTADOS DE SPs - FRECUENCIAS
// ============================================

interface SPListarFrecuenciasResult {
  frecuenciaId: number;
  nombre: string;
  creadoEn: string;
  actualizadoEn: string;
  totalRegistros?: number;
}

interface SPCrearFrecuenciaResult {
  frecuenciaId: number;
  nombre: string;
}

interface SPActualizarFrecuenciaResult {
  actualizado: 0 | 1;
}

interface SPEliminarFrecuenciaResult {
  eliminado: 0 | 1;
}

export class CatalogosRepository {
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
    // Simulación: En producción usar db.call()
    const destinos: DestinoDTO[] = [
      {
        destinoId: 1,
        usuarioId: null,
        nombre: "Renta",
        esPorDefecto: true,
        creadoEn: "2025-01-01T00:00:00Z",
        actualizadoEn: "2025-01-01T00:00:00Z",
      },
      {
        destinoId: 2,
        usuarioId: null,
        nombre: "Servicios",
        esPorDefecto: true,
        creadoEn: "2025-01-01T00:00:00Z",
        actualizadoEn: "2025-01-01T00:00:00Z",
      },
    ];

    return { destinos, total: destinos.length };
  }

  async crearDestino(
    usuarioId: string,
    nombre: string
  ): Promise<{ destinoId: number; nombre: string }> {
    // Simulación
    return {
      destinoId: Math.floor(Math.random() * 1000),
      nombre,
    };
  }

  async actualizarDestino(
    destinoId: number,
    usuarioId: string,
    nombre: string
  ): Promise<boolean> {
    // Simulación
    return true;
  }

  async eliminarDestino(destinoId: number, usuarioId: string): Promise<boolean> {
    // Simulación
    return true;
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
    // Simulación: En producción usar db.call()
    const frecuencias: FrecuenciaDTO[] = [
      {
        frecuenciaId: 1,
        nombre: "Mensual",
        creadoEn: "2025-01-01T00:00:00Z",
        actualizadoEn: "2025-01-01T00:00:00Z",
      },
      {
        frecuenciaId: 2,
        nombre: "Semanal",
        creadoEn: "2025-01-01T00:00:00Z",
        actualizadoEn: "2025-01-01T00:00:00Z",
      },
      {
        frecuenciaId: 3,
        nombre: "Quincenal",
        creadoEn: "2025-01-01T00:00:00Z",
        actualizadoEn: "2025-01-01T00:00:00Z",
      },
    ];

    return { frecuencias, total: frecuencias.length };
  }

  async crearFrecuencia(
    nombre: string
  ): Promise<{ frecuenciaId: number; nombre: string }> {
    // Simulación
    return {
      frecuenciaId: Math.floor(Math.random() * 1000),
      nombre,
    };
  }

  async actualizarFrecuencia(
    frecuenciaId: number,
    nombre: string
  ): Promise<boolean> {
    // Simulación
    return true;
  }

  async eliminarFrecuencia(frecuenciaId: number): Promise<boolean> {
    // Simulación
    return true;
  }
}

export const catalogosRepository = new CatalogosRepository();