import { dashboardService } from "../../../src/services/dashboard.service";
import { dashboardRepository } from "../../../src/repositories/dashboard.repository";

/**
 * Bug encontrado durante el issue #91 (fechas_corte_ahorro): DashboardService.balance()
 * leía `row.ingresos`/`row.egresos`/`row.balance`, pero `sp_dashboard_balance`
 * (db/moneywise_schema.sql) devuelve las columnas como
 * `ingresosAcumulados`/`egresosAcumulados`/`balanceAcumulado`. Como ninguno de
 * esos nombres existía en la fila, el endpoint siempre respondía 0 aunque el
 * usuario tuviera movimientos reales -- sin que ningún test lo hubiera
 * cubierto hasta ahora.
 */
describe("DashboardService.balance() (regresión issue #91)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("mapea ingresosAcumulados/egresosAcumulados/balanceAcumulado del SP a la respuesta", async () => {
    jest.spyOn(dashboardRepository, "balance").mockResolvedValue([
      [
        {
          fechaCorte: "2026-09-18 23:59:59",
          ingresosAcumulados: "173493.66",
          egresosAcumulados: "232885.55",
          balanceAcumulado: "-59391.89",
        },
      ],
    ] as any);

    const resultado = await dashboardService.balance(
      { fechaCorte: undefined } as any,
      { userId: "3", scopes: ["dashboard:leer"] }
    );

    expect(resultado.ingresosAcumulados).toBe(173493.66);
    expect(resultado.egresosAcumulados).toBe(232885.55);
    expect(resultado.balanceAcumulado).toBe(-59391.89);
  });

  it("calcula balanceAcumulado como ingresos - egresos si el SP no lo trae", async () => {
    jest.spyOn(dashboardRepository, "balance").mockResolvedValue([
      [
        {
          fechaCorte: "2026-09-18 23:59:59",
          ingresosAcumulados: "1000.00",
          egresosAcumulados: "400.00",
          balanceAcumulado: undefined,
        },
      ],
    ] as any);

    const resultado = await dashboardService.balance(
      { fechaCorte: undefined } as any,
      { userId: "3", scopes: ["dashboard:leer"] }
    );

    expect(resultado.balanceAcumulado).toBe(600);
  });
});
