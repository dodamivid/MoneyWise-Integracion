import mysql from "mysql2/promise";

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
  },

  async call<T = any[]>(sp: string, params: any[] = []): Promise<any[]> {
    if (!this.pool) throw new Error("DB pool no inicializado");

    // IMPORTANTE (issue #73): hay que incluir un placeholder `?` por cada
    // parámetro. `mysql2`/`sqlstring` solo sustituyen los `?` que encuentran
    // en el texto del SQL; si el SQL no trae ninguno (como pasaba con
    // `` `CALL ${sp}` `` a secas), los valores de `params` se descartan en
    // silencio y MySQL recibe la llamada sin argumentos, lo que rompe
    // cualquier stored procedure con parámetros `IN` obligatorios.
    //
    // Defensivo (regresión detectada al arreglar #73): algunos callers ya
    // traían un workaround propio y pasaban el nombre CON paréntesis/
    // placeholders incluidos (ej. "sp_x(?, ?)"), lo que con el fix de arriba
    // duplicaba los paréntesis (`CALL sp_x(?, ?)(?, ?)`, sintaxis inválida) y
    // rompió login/registro/dashboard en producción. Se normaliza tomando
    // solo el nombre antes del primer `(`, sin importar qué convención use
    // el caller.
    const spName = sp.split("(")[0].trim();
    const placeholders = params.map(() => "?").join(", ");
    const sql = placeholders ? `CALL ${spName}(${placeholders})` : `CALL ${spName}()`;
    const [rows] = await this.pool.query(sql, params);

    // mysql2 devuelve arrays anidados para múltiples result sets
    if (Array.isArray(rows) && Array.isArray(rows[0])) {
      return rows as any[];
    }
    return [rows] as any[];
  },

  // ✅ Nuevo método compatible con db.query(...)
  async query<T = any[]>(sql: string, params: any[] = []): Promise<[T, any]> {
    if (!this.pool) throw new Error("DB pool no inicializado");
    const [rows, fields] = await this.pool.query(sql, params);
    return [rows as T, fields];
  },
};

// 🔄 Inicializa automáticamente la conexión al iniciar la app
(async () => {
  try {
    await db.init();
  } catch (e) {
    console.error(
      "Error inicializando la conexión a BD:",
      (e as Error).message
    );
  }
})();

