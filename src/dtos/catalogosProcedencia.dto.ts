/**
 * DTOs para Catálogos - Procedencias de Ingreso
 * Fecha: 2025-10-31
 * Archivo: src/dtos/catalogosProcedencia.dto.ts
 */

// ========== INTERFACES DE ENTIDAD ==========

/**
 * DTO para Procedencia de Ingreso
 */
export interface ProcedenciaDto {
  procedenciaId: number;
  usuarioId: number | null;
  nombre: string;
  esPorDefecto: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

// ========== DTOs DE REQUEST ==========

/**
 * DTO para crear una nueva procedencia
 */
export interface CrearProcedenciaDto {
  nombre: string;
}

/**
 * DTO para actualizar una procedencia existente
 */
export interface ActualizarProcedenciaDto {
  nombre: string;
}

/**
 * DTO para query params al listar procedencias
 */
export interface ListarProcedenciasQueryDto {
  buscar?: string;
  pagina?: number;
  tamanoPagina?: number;
  orden?: string;
}

// ========== DTOs DE RESPONSE ==========

/**
 * Metadata de paginación
 */
export interface PaginacionMetaProcedencias {
  pagina: number;
  tamanoPagina: number;
  total: number;
}

/**
 * Respuesta al listar procedencias
 */
export interface RespuestaListaProcedencias {
  ok: boolean;
  data: ProcedenciaDto[];
  meta: {
    paginacion: PaginacionMetaProcedencias;
  };
}

/**
 * Respuesta al crear una procedencia
 */
export interface RespuestaCrearProcedencia {
  ok: boolean;
  data: {
    procedenciaId: number;
    nombre: string;
  };
}

/**
 * Respuesta al actualizar una procedencia
 */
export interface RespuestaActualizarProcedencia {
  ok: boolean;
  data: {
    actualizado: boolean;
  };
}

/**
 * Respuesta al eliminar una procedencia
 */
export interface RespuestaEliminarProcedencia {
  ok: boolean;
  data: {
    eliminado: boolean;
  };
}

// ========== CLASE DE VALIDACIONES ==========

/**
 * Clase con métodos estáticos para validar datos de Procedencias
 */
export class ValidacionProcedencia {
  /**
   * Valida el nombre de la procedencia
   * Reglas: 3-100 caracteres, no vacío
   */
  static validarNombre(nombre: string): { valido: boolean; error?: string } {
    // Verificar que el nombre existe y es un string
    if (!nombre || typeof nombre !== 'string') {
      return { valido: false, error: 'El nombre es requerido' };
    }

    const nombreTrim = nombre.trim();

    // Verificar longitud mínima
    if (nombreTrim.length < 3) {
      return {
        valido: false,
        error: 'El nombre debe tener al menos 3 caracteres',
      };
    }

    // Verificar longitud máxima
    if (nombreTrim.length > 100) {
      return {
        valido: false,
        error: 'El nombre no puede exceder 100 caracteres',
      };
    }

    return { valido: true };
  }

  /**
   * Valida y normaliza los parámetros de paginación
   */
  static validarPaginacion(
    pagina?: number,
    tamanoPagina?: number
  ): {
    valido: boolean;
    error?: string;
    paginaValida: number;
    tamanoValido: number;
  } {
    let paginaValida = 1;
    let tamanoValido = 20;

    // Validar página
    if (pagina !== undefined) {
      const paginaNum = Number(pagina);
      if (isNaN(paginaNum) || paginaNum < 1) {
        paginaValida = 1;
      } else {
        paginaValida = Math.floor(paginaNum);
      }
    }

    // Validar tamaño de página
    if (tamanoPagina !== undefined) {
      const tamanoNum = Number(tamanoPagina);
      if (isNaN(tamanoNum) || tamanoNum < 1) {
        tamanoValido = 20;
      } else if (tamanoNum > 100) {
        // Máximo 100 registros por página
        tamanoValido = 100;
      } else {
        tamanoValido = Math.floor(tamanoNum);
      }
    }

    return {
      valido: true,
      paginaValida,
      tamanoValido,
    };
  }

  /**
   * Valida el parámetro de ordenamiento
   * Valores permitidos: nombre, nombre:asc, nombre:desc, creadoEn, creadoEn:asc, creadoEn:desc
   */
  static validarOrden(orden?: string): {
    valido: boolean;
    error?: string;
    ordenValido: string;
  } {
    const ordenesPermitidos = [
      'nombre',
      'nombre:asc',
      'nombre:desc',
      'creadoEn',
      'creadoEn:asc',
      'creadoEn:desc',
    ];

    // Si no se especifica orden, usar por defecto
    if (!orden || typeof orden !== 'string') {
      return { valido: true, ordenValido: 'nombre:asc' };
    }

    const ordenTrim = orden.trim().toLowerCase();

    // Validar que el orden sea uno de los permitidos
    if (!ordenesPermitidos.includes(ordenTrim)) {
      return {
        valido: false,
        error: `Orden inválido. Opciones válidas: ${ordenesPermitidos.join(', ')}`,
        ordenValido: 'nombre:asc',
      };
    }

    return { valido: true, ordenValido: ordenTrim };
  }

  /**
   * Valida el ID de procedencia
   */
  static validarId(id: any): {
    valido: boolean;
    error?: string;
    idValido?: number;
  } {
    const idNum = Number(id);

    if (isNaN(idNum) || idNum <= 0 || !Number.isInteger(idNum)) {
      return { valido: false, error: 'ID de procedencia inválido' };
    }

    return { valido: true, idValido: idNum };
  }
}