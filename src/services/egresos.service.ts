import { egresosRepository } from "../repositories/egresos.repository";
import {
  ListarEgresosQuerySchema,
  CrearEgresoBodySchema,
  ActualizarEgresoBodySchema,
  type ListarEgresosQuery,
  type CrearEgresoBody,
  type ActualizarEgresoBody,
  type EgresoDTO,
} from "../dtos/egresos.dto";

interface AuthContext {
  userId: string;
  scopes: string[];
}

class EgresosService {
  /**
   * Lista egresos con filtros y paginación
   */
  async listar(
    query: Record<string, any>,
    auth: AuthContext
  ): Promise<{ egresos: EgresoDTO[]; total: number }> {
    // Validar query params con Zod
    const validated = ListarEgresosQuerySchema.parse(query);

    // Resolver usuarioId
    let usuarioIdResuelto: number;
    if (validated.usuarioId) {
      // Si se pasa usuarioId, requiere scope admin:egresos
      if (!auth.scopes.includes("admin:egresos")) {
        throw new Error(
          "PERMISO_DENEGADO: requiere scope 'admin:egresos' para consultar otro usuario"
        );
      }
      usuarioIdResuelto = parseInt(validated.usuarioId, 10);
      if (isNaN(usuarioIdResuelto)) {
        throw new Error("DATOS_INVALIDOS: usuarioId debe ser numérico");
      }
    } else {
      // Usar el userId del token
      usuarioIdResuelto = parseInt(auth.userId, 10);
      if (isNaN(usuarioIdResuelto)) {
        throw new Error("DATOS_INVALIDOS: userId del token debe ser numérico");
      }
    }

    return await egresosRepository.listar(validated, usuarioIdResuelto);
  }

  /**
   * Crea un nuevo egreso
   */
  async crear(
    body: Record<string, any>,
    auth: AuthContext
  ): Promise<number> {
    // Validar body con Zod
    const validated = CrearEgresoBodySchema.parse(body);

    // Resolver usuarioId
    let usuarioIdResuelto: number;
    if (validated.usuarioId) {
      // Si se pasa usuarioId en el body, requiere scope admin:egresos
      if (!auth.scopes.includes("admin:egresos")) {
        throw new Error(
          "PERMISO_DENEGADO: requiere scope 'admin:egresos' para crear egreso de otro usuario"
        );
      }
      usuarioIdResuelto = parseInt(validated.usuarioId, 10);
      if (isNaN(usuarioIdResuelto)) {
        throw new Error("DATOS_INVALIDOS: usuarioId debe ser numérico");
      }
    } else {
      // Usar el userId del token
      usuarioIdResuelto = parseInt(auth.userId, 10);
      if (isNaN(usuarioIdResuelto)) {
        throw new Error("DATOS_INVALIDOS: userId del token debe ser numérico");
      }
    }

    return await egresosRepository.crear(validated, usuarioIdResuelto);
  }

  /**
   * Obtiene un egreso por ID
   */
  async obtener(egresoId: number, auth: AuthContext): Promise<EgresoDTO> {
    const egreso = await egresosRepository.obtener(egresoId);

    if (!egreso) {
      throw new Error(`NO_ENCONTRADO: egreso con id ${egresoId} no encontrado`);
    }

    // Verificar permiso: solo el dueño o admin puede ver
    const usuarioIdToken = parseInt(auth.userId, 10);
    if (
      egreso.usuarioId !== usuarioIdToken &&
      !auth.scopes.includes("admin:egresos")
    ) {
      throw new Error(
        "PERMISO_DENEGADO: no tiene permiso para ver este egreso"
      );
    }

    return egreso;
  }

  /**
   * Actualiza un egreso
   */
  async actualizar(
    egresoId: number,
    body: Record<string, any>,
    auth: AuthContext
  ): Promise<boolean> {
    // Validar body con Zod
    const validated = ActualizarEgresoBodySchema.parse(body);

    // Obtener el egreso para verificar permisos
    const egreso = await egresosRepository.obtener(egresoId);
    if (!egreso) {
      throw new Error(`NO_ENCONTRADO: egreso con id ${egresoId} no encontrado`);
    }

    // Verificar permiso: solo el dueño o admin puede actualizar
    const usuarioIdToken = parseInt(auth.userId, 10);
    if (
      egreso.usuarioId !== usuarioIdToken &&
      !auth.scopes.includes("admin:egresos")
    ) {
      throw new Error(
        "PERMISO_DENEGADO: no tiene permiso para actualizar este egreso"
      );
    }

    return await egresosRepository.actualizar(
      egresoId,
      validated,
      egreso.usuarioId
    );
  }

  /**
   * Elimina un egreso
   */
  async eliminar(egresoId: number, auth: AuthContext): Promise<boolean> {
    // Obtener el egreso para verificar permisos
    const egreso = await egresosRepository.obtener(egresoId);
    if (!egreso) {
      throw new Error(`NO_ENCONTRADO: egreso con id ${egresoId} no encontrado`);
    }

    // Verificar permiso: solo el dueño o admin puede eliminar
    const usuarioIdToken = parseInt(auth.userId, 10);
    if (
      egreso.usuarioId !== usuarioIdToken &&
      !auth.scopes.includes("admin:egresos")
    ) {
      throw new Error(
        "PERMISO_DENEGADO: no tiene permiso para eliminar este egreso"
      );
    }

    return await egresosRepository.eliminar(egresoId, egreso.usuarioId);
  }
}

export const egresosService = new EgresosService();
