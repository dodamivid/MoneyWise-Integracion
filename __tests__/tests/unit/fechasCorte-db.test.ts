import { db } from "../../../src/config/db";
import { FechasCorteRepository } from "../../../src/repositories/fechasCorte.repository";

/**
 * Issue #91: fechas_corte_ahorro conectado a sus SPs (sp_fechasCorte_*), que
 * ya existían en el esquema pero no tenían routes/controller/service/
 * repository. Mismo patrón de UNION ALL + fila de COUNT(*) que el resto de
 * los `_listar` (#75), y misma conversión de fechas ISO -> MySQL (#84).
 */
describe("FechasCorteRepository conectado a SPs (issue #91)", () => {
  const originalEnabled = db.enabled;

  beforeEach(() => {
    (db as any).enabled = true;
  });

  afterEach(() => {
    db.pool = undefined;
    (db as any).enabled = originalEnabled;
  });

  it("listar separa la fila de COUNT(*) del array de datos", async () => {
    const query = jest.fn().mockResolvedValue([
      [
        [
          {
            fechaCorteId: 5,
            usuarioId: 23,
            fechaCorte: "2026-03-31 23:59:59",
            creadoEn: "2026-03-01 10:00:00",
            totalRegistros: null,
          },
          {
            fechaCorteId: null,
            usuarioId: null,
            fechaCorte: null,
            creadoEn: null,
            totalRegistros: 1,
          },
        ],
        {},
      ],
      [],
    ]);
    db.pool = { query } as any;

    const repo = new FechasCorteRepository();
    const { datos, total } = await repo.listar(23, 1, 20, "fechaCorte:desc");

    expect(datos).toHaveLength(1);
    expect(datos[0].fechaCorteId).toBe(5);
    expect(datos[0].usuarioId).toBe("23");
    expect(total).toBe(1);
  });

  it("crear convierte la fecha ISO a formato MySQL antes de llamar al SP", async () => {
    const query = jest
      .fn()
      .mockResolvedValue([[[{ fechaCorteId: 9 }], {}], []]);
    db.pool = { query } as any;

    const repo = new FechasCorteRepository();
    const resultado = await repo.crear(23, "2026-03-31T23:59:59Z");

    expect(resultado.fechaCorteId).toBe(9);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain("CALL sp_fechasCorte_crear(?, ?)");
    expect(params[1]).toBe("2026-03-31 23:59:59"); // fechaCorte convertida
  });

  it("eliminar propaga el error NO_ENCONTRADO del SP tal cual", async () => {
    const query = jest
      .fn()
      .mockRejectedValue(
        new Error("NO_ENCONTRADO:Fecha de corte no existe o no pertenece al usuario")
      );
    db.pool = { query } as any;

    const repo = new FechasCorteRepository();
    await expect(repo.eliminar(999, 23)).rejects.toThrow("NO_ENCONTRADO");
  });
});
