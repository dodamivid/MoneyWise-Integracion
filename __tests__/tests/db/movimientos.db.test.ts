import {
  request,
  app,
  crearUsuarioDePrueba,
  headersDe,
  primerIdDeCatalogo,
} from "./helpers";

/**
 * Pruebas contra MySQL real para ingresos/egresos/inversiones.
 *
 * Motivación (ver issue #84 en tickets/ESTADO_SESION.md): estos tres
 * repositorios antes tragaban cualquier error no reconocido y devolvían
 * un ID inventado como si la creación hubiera funcionado -- la API
 * respondía 201 pero no se guardaba nada real. La suite normal (con
 * DB_ENABLED apagado) nunca hubiera atrapado eso, porque corre contra el
 * fallback en memoria, no contra un SP real. Por eso cada "crear" de
 * aquí hace un GET inmediato después para confirmar que el registro
 * existe de verdad en la base, no solo que la API devolvió un id.
 */
describe("Ingresos/Egresos/Inversiones contra MySQL real", () => {
  let usuarioId: number;
  let tipoIngresoId: number;
  let tipoEgresoId: number;
  let procedenciaId: number;
  let destinoId: number;

  beforeAll(async () => {
    ({ usuarioId } = await crearUsuarioDePrueba("movimientos"));
    tipoIngresoId = await primerIdDeCatalogo("tipos-ingreso", "tipoIngresoId", usuarioId);
    tipoEgresoId = await primerIdDeCatalogo("tipos-egreso", "tipoEgresoId", usuarioId);
    procedenciaId = await primerIdDeCatalogo("procedencias", "procedenciaId", usuarioId);
    destinoId = await primerIdDeCatalogo("destinos", "destinoId", usuarioId);
  });

  describe("Ingresos", () => {
    it("crea un ingreso con fecha ISO y persiste de verdad (regresión #84)", async () => {
      const creado = await request(app)
        .post("/api/v1/ingresos")
        .set(headersDe(usuarioId))
        .send({
          tipoId: tipoIngresoId,
          procedenciaId,
          monto: 15000.5,
          descripcion: "Sueldo prueba DB real",
          fechaInicio: "2026-01-15T00:00:00Z",
        });

      expect(creado.status).toBe(201);
      const { ingresoId } = creado.body.data;
      expect(typeof ingresoId).toBe("number");

      // La prueba real: que exista de verdad, con los datos correctos,
      // no solo que la API haya respondido 201.
      const obtenido = await request(app)
        .get(`/api/v1/ingresos/${ingresoId}`)
        .set(headersDe(usuarioId));

      expect(obtenido.status).toBe(200);
      expect(obtenido.body.data.monto).toBe(15000.5);
      expect(obtenido.body.data.descripcion).toBe("Sueldo prueba DB real");
      // La fecha se convirtió a formato MySQL al guardar (toMySQLDateTime)
      // y al leerla de vuelta debe seguir representando el mismo instante.
      expect(new Date(obtenido.body.data.fechaInicio).toISOString()).toBe(
        "2026-01-15T00:00:00.000Z"
      );
    });

    it("lista ingresos con paginación real (regresión #75: UNION ALL)", async () => {
      const respuesta = await request(app)
        .get("/api/v1/ingresos?tamanoPagina=5")
        .set(headersDe(usuarioId));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.meta.paginacion.total).toBeGreaterThanOrEqual(1);
      // La fila de COUNT(*) del UNION ALL no debe colarse como un registro
      // real -- si se colara, tendría campos nulos/undefined.
      for (const ingreso of respuesta.body.data) {
        expect(ingreso.ingresoId).toBeTruthy();
        expect(typeof ingreso.monto).toBe("number");
      }
    });

    it("elimina un ingreso y confirma que ya no aparece", async () => {
      const creado = await request(app)
        .post("/api/v1/ingresos")
        .set(headersDe(usuarioId))
        .send({
          tipoId: tipoIngresoId,
          procedenciaId,
          monto: 500,
          fechaInicio: "2026-02-01T00:00:00Z",
        });
      const { ingresoId } = creado.body.data;

      const eliminado = await request(app)
        .delete(`/api/v1/ingresos/${ingresoId}`)
        .set(headersDe(usuarioId));
      expect(eliminado.status).toBe(200);

      const obtenido = await request(app)
        .get(`/api/v1/ingresos/${ingresoId}`)
        .set(headersDe(usuarioId));
      expect(obtenido.status).toBe(404);
    });
  });

  describe("Egresos", () => {
    it("crea un egreso y persiste de verdad (regresión #84)", async () => {
      const creado = await request(app)
        .post("/api/v1/egresos")
        .set(headersDe(usuarioId))
        .send({
          tipoId: tipoEgresoId,
          destinoId,
          monto: 2340.75,
          descripcion: "Renta prueba DB real",
          fechaInicio: "2026-01-05T00:00:00Z",
        });

      expect(creado.status).toBe(201);
      const { egresoId } = creado.body.data;

      const obtenido = await request(app)
        .get(`/api/v1/egresos/${egresoId}`)
        .set(headersDe(usuarioId));

      expect(obtenido.status).toBe(200);
      expect(obtenido.body.data.monto).toBe(2340.75);
      expect(obtenido.body.data.destinoId).toBe(destinoId);
    });

    it("actualiza un egreso y el cambio persiste de verdad", async () => {
      const creado = await request(app)
        .post("/api/v1/egresos")
        .set(headersDe(usuarioId))
        .send({
          tipoId: tipoEgresoId,
          destinoId,
          monto: 100,
          fechaInicio: "2026-01-10T00:00:00Z",
        });
      const { egresoId } = creado.body.data;

      const actualizado = await request(app)
        .patch(`/api/v1/egresos/${egresoId}`)
        .set(headersDe(usuarioId))
        .send({ monto: 999.99 });
      expect(actualizado.status).toBe(200);

      const obtenido = await request(app)
        .get(`/api/v1/egresos/${egresoId}`)
        .set(headersDe(usuarioId));
      expect(obtenido.body.data.monto).toBe(999.99);
    });
  });

  describe("Inversiones", () => {
    it("crea una inversión y persiste de verdad (regresión #84)", async () => {
      const creada = await request(app)
        .post("/api/v1/inversiones")
        .set(headersDe(usuarioId))
        .send({
          destinoId,
          monto: 50000,
          objetivo: "Fondo de emergencia prueba DB real",
          fechaInicio: "2026-01-01T00:00:00Z",
          tasaInteresPorc: 5.5,
        });

      expect(creada.status).toBe(201);
      const inversionId =
        creada.body.data?.inversionId ?? creada.body.data?.id;
      expect(inversionId).toBeTruthy();

      const obtenida = await request(app)
        .get(`/api/v1/inversiones/${inversionId}`)
        .set(headersDe(usuarioId));

      expect(obtenida.status).toBe(200);
      expect(Number(obtenida.body.data.monto)).toBe(50000);
      expect(obtenida.body.data.objetivo).toBe(
        "Fondo de emergencia prueba DB real"
      );
    });
  });
});
