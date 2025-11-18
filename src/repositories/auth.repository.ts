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
  scopesPorDefecto: string; // JSON string o CSV
}

interface SPAuthAccesoResult {
  usuarioId: number;
  hash: string;
  nombre: string;
  correo: string;
  activo: 0 | 1;
  scopes: string; // JSON string o CSV
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

    // Parsear scopes (puede venir como JSON o CSV)
    let scopes: string[] = [];
    try {
      scopes = JSON.parse(row.scopesPorDefecto);
    } catch {
      // Si no es JSON, asumir CSV
      scopes = row.scopesPorDefecto
        ? row.scopesPorDefecto.split(",").map((s) => s.trim())
        : [];
    }

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
    let scopes: string[] = [];
    try {
      scopes = JSON.parse(row.scopes);
    } catch {
      scopes = row.scopes
        ? row.scopes.split(",").map((s) => s.trim())
        : [];
    }

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
}

// Exportar instancia singleton
export const authRepository = new AuthRepository();