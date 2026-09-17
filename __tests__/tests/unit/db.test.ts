import { db } from "../../../src/config/db";

/**
 * Regresión issue #73: `db.call()` debe incluir un placeholder `?` por cada
 * parámetro. Antes del fix armaba `` `CALL ${sp}` `` sin placeholders, por lo
 * que `sqlstring` descartaba los parámetros en silencio y MySQL recibía la
 * llamada sin argumentos, rompiendo cualquier SP con parámetros `IN`
 * obligatorios (ver ingresos/egresos/procedencias).
 */
describe("db.call()", () => {
  afterEach(() => {
    db.pool = undefined;
  });

  it("arma CALL con un placeholder por parámetro y los reenvía a query()", async () => {
    const query = jest.fn().mockResolvedValue([[{ ok: 1 }], []]);
    db.pool = { query } as any;

    await db.call("sp_ingresos_listar", [
      1,
      "2025-01-01",
      "2025-12-31",
      null,
      null,
      null,
      null,
      1,
      20,
      "fecha:desc",
    ]);

    expect(query).toHaveBeenCalledWith(
      "CALL sp_ingresos_listar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [1, "2025-01-01", "2025-12-31", null, null, null, null, 1, 20, "fecha:desc"]
    );
  });

  it("arma CALL sin parámetros con paréntesis vacíos cuando no hay params", async () => {
    const query = jest.fn().mockResolvedValue([[{ ok: 1 }], []]);
    db.pool = { query } as any;

    await db.call("sp_sin_parametros");

    expect(query).toHaveBeenCalledWith("CALL sp_sin_parametros()", []);
  });

  it("lanza si el pool no está inicializado", async () => {
    db.pool = undefined;
    await expect(db.call("sp_x", [1])).rejects.toThrow(
      "DB pool no inicializado"
    );
  });
});
