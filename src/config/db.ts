import mysql from "mysql2/promise";
import { logger } from "./logger";

const enabled =
  (process.env.DB_ENABLED || process.env.USE_DB || "").toLowerCase() === "true";

export const db = {
  enabled,
  pool: undefined as undefined | mysql.Pool,

  async init() {
    if (!enabled) return;
    if (this.pool) return;

    const host = process.env.DB_HOST || "127.0.0.1";
    const port = Number(process.env.DB_PORT || 3306);
    const user = process.env.DB_USER || "root";
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_NAME || "moneywise";
    const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 10);

    this.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit,
      dateStrings: true,
      supportBigNumbers: true,
    });

    logger.info(
      { host, database, connectionLimit },
      "DB pool inicializada"
    );
  },

  async call<T = any[]>(sp: string, params: any[] = []): Promise<any[]> {
    if (!this.pool) throw new Error("DB pool no inicializado");
    const [rows] = await this.pool.query(`CALL ${sp}`, params);

    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows as any[];
    }
    return [rows] as any[];
  },

  async query<T = any[]>(sql: string, params: any[] = []): Promise<[T, any]> {
    if (!this.pool) throw new Error("DB pool no inicializado");
    const [rows, fields] = await this.pool.query(sql, params);
    return [rows as T, fields];
  },
};

(async () => {
  try {
    await db.init();
  } catch (e) {
    logger.error(
      { err: e },
      "Error inicializando la conexion a BD"
    );
  }
})();
