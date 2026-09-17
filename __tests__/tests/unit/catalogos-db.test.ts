import { db } from "../../../src/config/db";
import { CatalogosRepository } from "../../../src/repositories/catalogos.repository";
import { TiposEgresoRepository } from "../../../src/repositories/tiposEgreso.repository";

/**
 * Regresión issue #71: al conectar destinos/frecuencias/tiposEgreso a sus
 * stored procedures, el result set del SP trae los datos + una fila final de
 * `COUNT(*) AS totalRegistros` (UNION ALL, ver issue #75). Esa fila NO debe
 * colarse como un registro real en el array devuelto (justo el bug que se
 * encontró en catalogosProcedencia.repository.ts).
 */
describe("catálogos conectados a SPs (issue #71) — no filtran la fila de total", () => {
  const originalEnabled = db.enabled;

  beforeEach(() => {
    (db as any).enabled = true;
  });

  afterEach(() => {
    db.pool = undefined;
    (db as any).enabled = originalEnabled;
  });

  it("listarDestinos separa la fila de COUNT(*) del array de datos", async () => {
    const query = jest.fn().mockResolvedValue([
      [
        [
          {
            destinoId: 1,
            usuarioId: null,
            nombre: "Renta",
            esPorDefecto: 1,
            creadoEn: "2026-01-01",
            actualizadoEn: "2026-01-01",
            totalRegistros: null,
          },
          {
            destinoId: null,
            usuarioId: null,
            nombre: null,
            esPorDefecto: null,
            creadoEn: null,
            actualizadoEn: null,
            totalRegistros: 1,
          },
        ],
        {},
      ],
      [],
    ]);
    db.pool = { query } as any;

    const repo = new CatalogosRepository();
    const { destinos, total } = await repo.listarDestinos(
      "1",
      null,
      1,
      20,
      "nombre:asc"
    );

    expect(destinos).toHaveLength(1);
    expect(destinos[0].nombre).toBe("Renta");
    expect(total).toBe(1);
  });

  it("listarFrecuencias separa la fila de COUNT(*) del array de datos", async () => {
    const query = jest.fn().mockResolvedValue([
      [
        [
          {
            frecuenciaId: 1,
            nombre: "Diario",
            creadoEn: "2026-01-01",
            actualizadoEn: "2026-01-01",
            totalRegistros: null,
          },
          {
            frecuenciaId: null,
            nombre: null,
            creadoEn: null,
            actualizadoEn: null,
            totalRegistros: 1,
          },
        ],
        {},
      ],
      [],
    ]);
    db.pool = { query } as any;

    const repo = new CatalogosRepository();
    const { frecuencias, total } = await repo.listarFrecuencias(
      null,
      1,
      20,
      "nombre:asc"
    );

    expect(frecuencias).toHaveLength(1);
    expect(frecuencias[0].nombre).toBe("Diario");
    expect(total).toBe(1);
  });

  it("listarTiposEgreso separa la fila de COUNT(*) del array de datos", async () => {
    const query = jest.fn().mockResolvedValue([
      [
        [
          {
            tipoEgresoId: 1,
            usuarioId: null,
            nombre: "Renta",
            esPorDefecto: 1,
            creadoEn: "2026-01-01",
            actualizadoEn: "2026-01-01",
            totalRegistros: null,
          },
          {
            tipoEgresoId: null,
            usuarioId: null,
            nombre: null,
            esPorDefecto: null,
            creadoEn: null,
            actualizadoEn: null,
            totalRegistros: 1,
          },
        ],
        {},
      ],
      [],
    ]);
    db.pool = { query } as any;

    const repo = new TiposEgresoRepository();
    const { datos, total } = await repo.listarTiposEgreso(
      "1",
      null,
      1,
      20,
      "nombre:asc"
    );

    expect(datos).toHaveLength(1);
    expect(datos[0].nombre).toBe("Renta");
    expect(total).toBe(1);
  });
});
