import { ingresosRepository } from "../repositories/ingresos.repository";
import {
  ActualizarIngresoBodySchema,
  CrearIngresoBodySchema,
  ListarIngresosQuerySchema,
  type ActualizarIngresoBody,
  type CrearIngresoBody,
  type IngresoDTO,
  type ListarIngresosQuery,
} from "../dtos/ingresos.dto";

interface AuthContext {
  userId: string;
  scopes: string[];
}

const ADMIN_SCOPE = "admin:ingresos";

const sanitizeQueryParams = (query: Record<string, unknown>) => {
  const sanitized: Record<string, unknown> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const first = value[0];
      if (typeof first === "string") {
        const trimmed = first.trim();
        if (trimmed.length > 0) {
          sanitized[key] = trimmed;
        }
      }
      return;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        sanitized[key] = trimmed;
      }
      return;
    }

    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

class IngresosService {
  async listar(
    query: Record<string, unknown>,
    auth: AuthContext
  ): Promise<{
    ingresos: IngresoDTO[];
    total: number;
    pagina: number;
    tamanoPagina: number;
  }> {
    const sanitized = sanitizeQueryParams(query);
    const validated: ListarIngresosQuery =
      ListarIngresosQuerySchema.parse(sanitized);

    const usuarioIdResuelto = this.resolverUsuarioId(
      validated.usuarioId,
      auth,
      "consultar ingresos de otro usuario"
    );

    const result = await ingresosRepository.listar(
      validated,
      usuarioIdResuelto
    );

    return {
      ...result,
      pagina: validated.pagina,
      tamanoPagina: validated.tamanoPagina,
    };
  }

  async crear(
    body: Record<string, unknown>,
    auth: AuthContext
  ): Promise<number> {
    const validated: CrearIngresoBody = CrearIngresoBodySchema.parse(body);

    const usuarioIdResuelto = this.resolverUsuarioId(
      validated.usuarioId,
      auth,
      "crear ingresos para otro usuario"
    );

    return await ingresosRepository.crear(validated, usuarioIdResuelto);
  }

  async obtener(ingresoId: number, auth: AuthContext): Promise<IngresoDTO> {
    const ingreso = await ingresosRepository.obtener(ingresoId);

    if (!ingreso) {
      throw new Error(
        `NO_ENCONTRADO: ingreso con id ${ingresoId} no encontrado`
      );
    }

    this.verificarPropietario(ingreso.usuarioId, auth);
    return ingreso;
  }

  async actualizar(
    ingresoId: number,
    body: Record<string, unknown>,
    auth: AuthContext
  ): Promise<boolean> {
    const validated: ActualizarIngresoBody =
      ActualizarIngresoBodySchema.parse(body);

    const ingreso = await ingresosRepository.obtener(ingresoId);
    if (!ingreso) {
      throw new Error(
        `NO_ENCONTRADO: ingreso con id ${ingresoId} no encontrado`
      );
    }

    this.verificarPropietario(ingreso.usuarioId, auth);

    return await ingresosRepository.actualizar(
      ingresoId,
      validated,
      ingreso.usuarioId
    );
  }

  async eliminar(ingresoId: number, auth: AuthContext): Promise<boolean> {
    const ingreso = await ingresosRepository.obtener(ingresoId);
    if (!ingreso) {
      throw new Error(
        `NO_ENCONTRADO: ingreso con id ${ingresoId} no encontrado`
      );
    }

    this.verificarPropietario(ingreso.usuarioId, auth);

    return await ingresosRepository.eliminar(ingresoId, ingreso.usuarioId);
  }

  private resolverUsuarioId(
    usuarioIdSolicitado: string | undefined,
    auth: AuthContext,
    accion: string
  ): number {
    if (usuarioIdSolicitado) {
      if (!auth.scopes.includes(ADMIN_SCOPE)) {
        throw new Error(
          `PERMISO_DENEGADO: requiere scope '${ADMIN_SCOPE}' para ${accion}`
        );
      }

      const parsed = parseInt(usuarioIdSolicitado, 10);
      if (isNaN(parsed)) {
        throw new Error("DATOS_INVALIDOS: usuarioId debe ser numerico");
      }
      return parsed;
    }

    const parsedUserId = parseInt(auth.userId, 10);
    if (isNaN(parsedUserId)) {
      throw new Error("DATOS_INVALIDOS: userId del token debe ser numerico");
    }
    return parsedUserId;
  }

  private verificarPropietario(usuarioId: number, auth: AuthContext) {
    const usuarioToken = parseInt(auth.userId, 10);
    if (isNaN(usuarioToken)) {
      throw new Error("DATOS_INVALIDOS: userId del token debe ser numerico");
    }

    if (
      usuarioId !== usuarioToken &&
      !auth.scopes.includes(ADMIN_SCOPE)
    ) {
      throw new Error(
        "PERMISO_DENEGADO: no tiene permiso para operar sobre este ingreso"
      );
    }
  }
}

export const ingresosService = new IngresosService();
