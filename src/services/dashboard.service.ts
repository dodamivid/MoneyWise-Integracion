import { dashboardRepository } from "../repositories/dashboard.repository";
import {
  BalanceOutputDTO,
  BalanceQuery,
  BalanceQuerySchema,
  MetasQuery,
  MetasQuerySchema,
  ResumenOutputDTO,
  ResumenQuery,
  ResumenQuerySchema,
} from "../dtos/dashboard.dto";

export interface AuthContext {
  userId: string;
  scopes: string[];
}

function monthsBetween(a: Date, b: Date): number {
  const years = b.getUTCFullYear() - a.getUTCFullYear();
  const months = b.getUTCMonth() - a.getUTCMonth();
  return years * 12 + months;
}

function ensureRange(desdeISO: string, hastaISO: string) {
  const d = new Date(desdeISO);
  const h = new Date(hastaISO);
  if (d > h) throw new Error("DATOS_INVALIDOS: 'desde' no puede ser mayor que 'hasta'");
  const diffMonths = monthsBetween(d, h);
  if (diffMonths > 12) throw new Error("DATOS_INVALIDOS: rango máximo 12 meses");
}

function resolveUserId(inputUsuarioId: string | undefined, auth: AuthContext): string {
  if (inputUsuarioId) {
    const isAdmin = auth.scopes.includes("admin:dashboard");
    if (!isAdmin) {
      throw new Error("PERMISO_DENEGADO: admin:dashboard requerido para consultar a otros usuarios");
    }
    return inputUsuarioId;
  }
  return auth.userId;
}

class DashboardService {
  async resumen(query: ResumenQuery, auth: AuthContext): Promise<ResumenOutputDTO> {
    const parsed = ResumenQuerySchema.parse(query);
    ensureRange(parsed.desde, parsed.hasta);
    const usuarioId = resolveUserId(parsed.usuarioId, auth);
    return dashboardRepository.getResumen(usuarioId, parsed.desde, parsed.hasta);
  }

  async balance(query: BalanceQuery, auth: AuthContext): Promise<BalanceOutputDTO> {
    const parsed = BalanceQuerySchema.parse(query);
    const usuarioId = resolveUserId(parsed.usuarioId, auth);
    return dashboardRepository.getBalance(usuarioId, parsed.fechaCorte);
  }

  async metas(query: MetasQuery, auth: AuthContext) {
    const parsed = MetasQuerySchema.parse(query);
    ensureRange(parsed.desde, parsed.hasta);
    const usuarioId = resolveUserId(parsed.usuarioId, auth);
    return dashboardRepository.getMetasVsAhorro(usuarioId, parsed.desde, parsed.hasta);
  }
}

export const dashboardService = new DashboardService();
