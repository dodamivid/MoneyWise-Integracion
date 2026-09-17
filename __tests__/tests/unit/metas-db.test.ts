import { db } from "../../../src/config/db";
import { MetasRepository } from "../../../src/repositories/metas.repository";

/**
 * Regresión issue #87: metas conectado a sus SPs reales. Igual que con
 * destinos/frecuencias/tipos_egreso (#71), el result set de sp_metas_listar
 * trae los datos + una fila final de COUNT(*) (UNION ALL, #75) que no debe
 * colarse como un registro real.
 */
describe("MetasRepository conectado a SPs (issue #87)", () => {
  const originalEnabled = db.enabled;

  beforeEach(() => {
    (db as any).enabled = true;
  });

  afterEach(() => {
    db.pool = undefined;
    (db as any).enabled = originalEnabled;
  });

  it("findAll separa la fila de COUNT(*) del array de datos", async () => {
    const query = jest.fn().mockResolvedValue([
      [
        [
          {
            metaId: 1,
            usuarioId: 5,
            nombre: "Vacaciones",
            montoObjetivo: "100000.00",
            ahorroReal: "25000.00",
            activa: 1,
            fechaInicio: "2026-01-01 00:00:00",
            fechaFin: null,
            creadoEn: "2026-01-01 00:00:00",
            actualizadoEn: "2026-01-01 00:00:00",
            porcentajeAvance: "25.00",
            totalRegistros: null,
          },
          {
            metaId: null,
            usuarioId: null,
            nombre: null,
            montoObjetivo: null,
            ahorroReal: null,
            activa: null,
            fechaInicio: null,
            fechaFin: null,
            creadoEn: null,
            actualizadoEn: null,
            porcentajeAvance: null,
            totalRegistros: 1,
          },
        ],
        {},
      ],
      [],
    ]);
    db.pool = { query } as any;

    const repo = new MetasRepository();
    const { metas, total } = await repo.findAll(
      { usuarioId: 5 },
      { pagina: 1, tamanoPagina: 20 }
    );

    expect(metas).toHaveLength(1);
    expect(metas[0].nombre).toBe("Vacaciones");
    expect(metas[0].montoObjetivo).toBe(100000);
    expect(total).toBe(1);
  });

  it("create convierte fechas ISO a formato MySQL antes de llamar al SP", async () => {
    const query = jest
      .fn()
      // 1) sp_metas_crear
      .mockResolvedValueOnce([[[{ metaId: 9 }], {}], []])
      // 2) sp_metas_obtener (para devolver la meta recién creada)
      .mockResolvedValueOnce([
        [
          [
            {
              metaId: 9,
              usuarioId: 5,
              nombre: "Fondo",
              montoObjetivo: "5000.00",
              ahorroReal: "0.00",
              activa: 1,
              fechaInicio: "2026-01-01 00:00:00",
              fechaFin: null,
              creadoEn: "2026-01-01 00:00:00",
              actualizadoEn: "2026-01-01 00:00:00",
              porcentajeAvance: "0.00",
            },
          ],
          {},
        ],
        [],
      ]);
    db.pool = { query } as any;

    const repo = new MetasRepository();
    const meta = await repo.create({
      usuarioId: 5,
      nombre: "Fondo",
      montoObjetivo: 5000,
      fechaInicio: "2026-01-01T00:00:00Z",
      activa: true,
    });

    expect(meta.metaId).toBe(9);
    const [, paramsCrear] = query.mock.calls[0];
    expect(paramsCrear[3]).toBe("2026-01-01 00:00:00"); // fechaInicio convertida
  });
});
