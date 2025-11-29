import { db } from "../config/db";

/**
 * @fileoverview Repository para operaciones de autenticación
 * Maneja las llamadas a Stored Procedures
 */

// ============================================
// TIPOS DE RESULTADOS DE SPs
// ============================================

interface SPUsuarioRegistrarResult {
  usuarioId: number;
  nombre: string;
  apellidoP: string;
  apellidoM: string;
  correo: string;
  creadoEn: string;
  scopesPorDefecto: any; // JSON column, puede venir como string/obj/array
}

interface SPAuthAccesoResult {
  usuarioId: number;
  hash: string;
  nombre: string;
  correo: string;
  activo: 0 | 1;
  scopes: any; // JSON column, puede venir como string/obj/array
}

interface SPAuthOlvidoResult {
  enviado: 0 | 1;
}

interface SPAuthRestablecerResult {
  restablecido: 0 | 1;
}

export class AuthRepository {
  /**
   * Registra un nuevo usuario
   * SP: sp_usuarios_registrar(pNombre, pApellidoP, pApellidoM, pCorreo, pFechaN, pHash)
   */
  async registrarUsuario(
    nombre: string,
    apellidoP: string,
    apellidoM: string,
    correo: string,
    fechaN: string,
    hash: string
  ): Promise<{
    usuarioId: number;
    nombre: string;
    apellidoP: string;
    apellidoM: string;
    correo: string;
    creadoEn: string;
    scopes: string[];
  }> {
    const [resultSets] = await db.call<SPUsuarioRegistrarResult[]>(
      "sp_usuarios_registrar(?, ?, ?, ?, ?, ?)",
      [nombre, apellidoP, apellidoM, correo, fechaN, hash]
    );

    const rows = resultSets as unknown as SPUsuarioRegistrarResult[];

    if (!rows || rows.length === 0) {
      throw new Error("El SP no devolvió resultado");
    }

    const row = rows[0];

    // Parsear scopes (JSON column en MySQL 9, CSV o string)
    const scopes = this.parseScopes(row.scopesPorDefecto);

    return {
      usuarioId: row.usuarioId,
      nombre: row.nombre,
      apellidoP: row.apellidoP,
      apellidoM: row.apellidoM,
      correo: row.correo,
      creadoEn: row.creadoEn,
      scopes,
    };
  }

  /**
   * Obtiene datos de usuario para login
   * SP: sp_auth_acceso(pCorreo)
   */
  async obtenerUsuarioPorCorreo(correo: string): Promise<{
    usuarioId: number;
    hash: string;
    nombre: string;
    correo: string;
    activo: boolean;
    scopes: string[];
  } | null> {
    const [resultSets] = await db.call<SPAuthAccesoResult[]>(
      "sp_auth_acceso(?)",
      [correo]
    );

    const rows = resultSets as unknown as SPAuthAccesoResult[];

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];

    // Parsear scopes
    const scopes = this.parseScopes(row.scopes);

    return {
      usuarioId: row.usuarioId,
      hash: row.hash,
      nombre: row.nombre,
      correo: row.correo,
      activo: row.activo === 1,
      scopes,
    };
  }

  /**
   * Inicia proceso de recuperación de contraseña
   * SP: sp_auth_olvido_iniciar(pCorreo, pToken, pExpira)
   */
  async iniciarRecuperacion(
    correo: string,
    token: string,
    expira: Date
  ): Promise<boolean> {
    // Formatear fecha para MySQL
    const expiraStr = expira.toISOString().slice(0, 19).replace("T", " ");

    const [resultSets] = await db.call<SPAuthOlvidoResult[]>(
      "sp_auth_olvido_iniciar(?, ?, ?)",
      [correo, token, expiraStr]
    );

    const rows = resultSets as unknown as SPAuthOlvidoResult[];

    if (!rows || rows.length === 0) {
      return false;
    }

    return rows[0].enviado === 1;
  }

  /**
   * Confirma restablecimiento de contraseña
   * SP: sp_auth_restablecer_confirmar(pToken, pHashNuevo)
   */
  async confirmarRestablecimiento(
    token: string,
    hashNuevo: string
  ): Promise<boolean> {
    const [resultSets] = await db.call<SPAuthRestablecerResult[]>(
      "sp_auth_restablecer_confirmar(?, ?)",
      [token, hashNuevo]
    );

    const rows = resultSets as unknown as SPAuthRestablecerResult[];

    if (!rows || rows.length === 0) {
      return false;
    }

    return rows[0].restablecido === 1;
  }

  /**
   * Normaliza scopes desde MySQL (puede venir como JSON, array, objeto o CSV).
   */
  private parseScopes(raw: unknown): string[] {
    // Si ya es arreglo
    if (Array.isArray(raw)) {
      return raw.map((s) => String(s).trim()).filter(Boolean);
    }

    // Si es objeto (JSON column puede mapear a objeto)
    if (raw && typeof raw === "object") {
      try {
        const parsed = JSON.parse(JSON.stringify(raw));
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {
        // continuar al fallback
      }
    }

    // Si es string, intentar JSON.parse y luego CSV
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {
        // no es JSON, continuar
      }
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Fallback vacío
    return [];
  }
}

// Exportar instancia singleton
export const authRepository = new AuthRepository();
