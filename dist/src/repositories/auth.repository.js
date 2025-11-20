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
        // Parsear scopes (puede venir como JSON o CSV)
        let scopes = [];
        try {
            scopes = JSON.parse(row.scopesPorDefecto);
        }
        catch {
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
    async obtenerUsuarioPorCorreo(correo) {
        const [resultSets] = await db_1.db.call("sp_auth_acceso(?)", [correo]);
        const rows = resultSets;
        if (!rows || rows.length === 0) {
            return null;
        }
        const row = rows[0];
        // Parsear scopes
        let scopes = [];
        try {
            scopes = JSON.parse(row.scopes);
        }
        catch {
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
}
exports.AuthRepository = AuthRepository;
// Exportar instancia singleton
exports.authRepository = new AuthRepository();
