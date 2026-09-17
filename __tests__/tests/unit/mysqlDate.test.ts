import { toMySQLDateTime } from "../../../src/utils/mysqlDate";

/**
 * Regresión issue #84: la API acepta fechas ISO-8601 (ej. "2026-01-01T00:00:00Z"),
 * pero se pasaban tal cual a los stored procedures, y MySQL las rechaza para
 * columnas DATETIME ("Incorrect datetime value"). Esto hacía que crear
 * ingresos/egresos/inversiones fallara siempre contra una base real, y el
 * fallback en memoria de cada repo disfrazaba la falla de éxito.
 */
describe("toMySQLDateTime()", () => {
  it("convierte una fecha ISO-8601 con Z al formato MySQL", () => {
    expect(toMySQLDateTime("2026-01-01T00:00:00Z")).toBe("2026-01-01 00:00:00");
  });

  it("convierte una fecha ISO-8601 con milisegundos", () => {
    expect(toMySQLDateTime("2026-01-01T13:45:30.123Z")).toBe(
      "2026-01-01 13:45:30"
    );
  });

  it("convierte una fecha simple YYYY-MM-DD", () => {
    expect(toMySQLDateTime("2026-01-01")).toBe("2026-01-01 00:00:00");
  });

  it("devuelve null para null/undefined/string vacío", () => {
    expect(toMySQLDateTime(null)).toBeNull();
    expect(toMySQLDateTime(undefined)).toBeNull();
    expect(toMySQLDateTime("")).toBeNull();
  });

  it("deja pasar tal cual una fecha no parseable (para que MySQL/el SP la rechace)", () => {
    expect(toMySQLDateTime("no-es-una-fecha")).toBe("no-es-una-fecha");
  });
});
