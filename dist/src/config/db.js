"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const enabled = (process.env.DB_ENABLED || process.env.USE_DB || "").toLowerCase() === "true";
exports.db = {
    enabled,
    pool: undefined,
    async init() {
        if (!enabled)
            return;
        if (this.pool)
            return;
        const host = process.env.DB_HOST || "127.0.0.1";
        const port = Number(process.env.DB_PORT || 3306);
        const user = process.env.DB_USER || "root";
        const password = process.env.DB_PASSWORD || "";
        const database = process.env.DB_NAME || "moneywise";
        const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 10);
        this.pool = promise_1.default.createPool({
            host,
            port,
            user,
            password,
            database,
            connectionLimit,
            dateStrings: true,
            supportBigNumbers: true,
        });
    },
    async call(sp, params = []) {
        if (!this.pool)
            throw new Error("DB pool no inicializado");
        const [rows] = await this.pool.query(`CALL ${sp}`, params);
        // mysql2 devuelve arrays anidados para múltiples result sets
        if (Array.isArray(rows) && Array.isArray(rows[0])) {
            return rows;
        }
        return [rows];
    },
    // ✅ Nuevo método compatible con db.query(...)
    async query(sql, params = []) {
        if (!this.pool)
            throw new Error("DB pool no inicializado");
        const [rows, fields] = await this.pool.query(sql, params);
        return [rows, fields];
    },
};
// 🔄 Inicializa automáticamente la conexión al iniciar la app
(async () => {
    try {
        await exports.db.init();
    }
    catch (e) {
        console.error("Error inicializando la conexión a BD:", e.message);
    }
})();
