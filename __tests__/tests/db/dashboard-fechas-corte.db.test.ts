import {
  request,
  app,
  crearUsuarioDePrueba,
  headersDe,
  primerIdDeCatalogo,
} from "./helpers";

/**
 * Pruebas contra MySQL real para dashboard + fechas de corte (issue #91).
 * Es exactamente el flujo que se verificó a mano contra Railway con curl
 * (ver tickets/ESTADO_SESION.md) -- aquí queda automatizado: sin fecha de
 * corte, dashboard/balance da 404; se crea una fecha de corte real;
 * dashboard/balance ya no falla y refleja montos reales (no la fila de
 * ceros que devolvía el bug de mapeo de columnas corregido junto con el
 * #91).
 */
describe("Dashboard + fechas de corte contra MySQL real", () => {
  let usuarioId: number;
  let tipoIngresoId: number;
  let procedenciaId: number;

  beforeAll(async () => {
    ({ usuarioId } = await crearUsuarioDePrueba("dashboard"));
    tipoIngresoId = await primerIdDeCatalogo("tipos-ingreso", "tipoIngresoId", usuarioId);
    procedenciaId = await primerIdDeCatalogo("procedencias", "procedenciaId", usuarioId);

    // Sembrar un ingreso real para que el dashboard tenga algo que sumar.
    await request(app)
      .post("/api/v1/ingresos")
      .set(headersDe(usuarioId))
      .send({
        tipoId: tipoIngresoId,
        procedenciaId,
        monto: 10000,
        fechaInicio: "2026-01-01T00:00:00Z",
      });
  });

  it("dashboard/balance da 404 sin ninguna fecha de corte registrada", async () => {
    const respuesta = await request(app)
      .get("/api/v1/dashboard/balance")
      .set(headersDe(usuarioId));
    expect(respuesta.status).toBe(404);
  });

  it("crear una fecha de corte hace que dashboard/balance refleje montos reales", async () => {
    const creada = await request(app)
      .post("/api/v1/ahorro/fechas-corte")
      .set(headersDe(usuarioId))
      .send({ fechaCorte: "2026-06-30T23:59:59Z" });
    expect(creada.status).toBe(201);

    const balance = await request(app)
      .get("/api/v1/dashboard/balance")
      .set(headersDe(usuarioId));

    expect(balance.status).toBe(200);
    // Regresión: DashboardService.balance() leía row.ingresos/row.egresos/
    // row.balance (nombres que el SP no usa), así que siempre daba 0.
    expect(balance.body.data.ingresosAcumulados).toBe(10000);
    expect(balance.body.data.egresosAcumulados).toBe(0);
    expect(balance.body.data.balanceAcumulado).toBe(10000);
  });

  it("dashboard/resumen refleja los mismos montos reales", async () => {
    const resumen = await request(app)
      .get("/api/v1/dashboard/resumen?desde=2026-01-01T00:00:00Z&hasta=2026-12-31T23:59:59Z")
      .set(headersDe(usuarioId));

    expect(resumen.status).toBe(200);
    expect(resumen.body.data.totales.ingresos).toBe(10000);
    expect(resumen.body.data.totales.balance).toBe(10000);
  });

  it("rechaza una fecha de corte duplicada para el mismo usuario", async () => {
    const respuesta = await request(app)
      .post("/api/v1/ahorro/fechas-corte")
      .set(headersDe(usuarioId))
      .send({ fechaCorte: "2026-06-30T23:59:59Z" });
    expect(respuesta.status).toBe(409);
  });
});
