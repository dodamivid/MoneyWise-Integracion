"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRepository = exports.AuthRepository = void 0;
const db_1 = require("../config/db");
class AuthRepository {
    /**
     * Registra un nuevo usuario
     * SP: sp_usuarios_registrar(pNombre, pApellidoP, pApellidoM, pCorreo, pFechaN, pHash)
     */
    async registrarUsuario(nombre, apellidoP, apellidoM, correo, fechaN, hash) {
        const [resultSets] = await db_1.db.call("sp_usuarios_registrar(?, ?, ?, ?, ?, ?)", [nombre, apellidoP, apellidoM, correo, fechaN, hash]);
        const rows = resultSets;
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
    async obtenerUsuarioPorCorreo(correo) {
        const [resultSets] = await db_1.db.call("sp_auth_acceso(?)", [correo]);
        const rows = resultSets;
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
    async iniciarRecuperacion(correo, token, expira) {
        // Formatear fecha para MySQL
        const expiraStr = expira.toISOString().slice(0, 19).replace("T", " ");
        const [resultSets] = await db_1.db.call("sp_auth_olvido_iniciar(?, ?, ?)", [correo, token, expiraStr]);
        const rows = resultSets;
        if (!rows || rows.length === 0) {
            return false;
        }
        return rows[0].enviado === 1;
    }
    /**
     * Confirma restablecimiento de contraseña
     * SP: sp_auth_restablecer_confirmar(pToken, pHashNuevo)
     */
    async confirmarRestablecimiento(token, hashNuevo) {
        const [resultSets] = await db_1.db.call("sp_auth_restablecer_confirmar(?, ?)", [token, hashNuevo]);
        const rows = resultSets;
        if (!rows || rows.length === 0) {
            return false;
        }
        return rows[0].restablecido === 1;
    }
    /**
     * Normaliza scopes desde MySQL (puede venir como JSON, array, objeto o CSV).
     */
    parseScopes(raw) {
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
            }
            catch {
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
            }
            catch {
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
exports.AuthRepository = AuthRepository;
// Exportar instancia singleton
exports.authRepository = new AuthRepository();
