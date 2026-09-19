import { request, app, crearUsuarioDePrueba, headersDe } from "./helpers";

/**
 * Pruebas contra MySQL real para metas. Cubre metas.repository.ts (59%
 * de cobertura con el fallback en memoria) contra los SPs reales
 * (sp_metas_listar/crear/obtener/actualizar/eliminar, issue #87) y la
 * auth agregada en el #89.
 */
describe("Metas contra MySQL real", () => {
  let usuarioId: number;

  beforeAll(async () => {
    ({ usuarioId } = await crearUsuarioDePrueba("metas"));
  });

  it("403 sin metas:leer (regresión #89)", async () => {
    const respuesta = await request(app)
      .get("/api/v1/metas")
      .set({
        "x-api-key": headersDe(usuarioId)["x-api-key"],
        "x-mw-user": String(usuarioId),
        "x-mw-scopes": "ninguno",
      });
    expect(respuesta.status).toBe(403);
  });

  it("crea una meta, persiste de verdad y el avance se calcula real", async () => {
    const creada = await request(app)
      .post("/api/v1/metas")
      .set(headersDe(usuarioId))
      .send({
        usuarioId,
        nombre: "Meta prueba DB real",
        montoObjetivo: 20000,
        fechaInicio: "2026-01-01T00:00:00Z",
      });
    expect(creada.status).toBe(201);
    const { metaId } = creada.body.data;

    const obtenida = await request(app)
      .get(`/api/v1/metas/${metaId}`)
      .set(headersDe(usuarioId));
    expect(obtenida.status).toBe(200);
    expect(obtenida.body.data.ahorroReal).toBe(0);
    expect(obtenida.body.data.porcentajeAvance).toBe(0);

    const actualizada = await request(app)
      .patch(`/api/v1/metas/${metaId}`)
      .set(headersDe(usuarioId))
      .send({ ahorroReal: 5000 });
    expect(actualizada.status).toBe(200);

    const releida = await request(app)
      .get(`/api/v1/metas/${metaId}`)
      .set(headersDe(usuarioId));
    expect(releida.body.data.ahorroReal).toBe(5000);
    expect(releida.body.data.porcentajeAvance).toBe(25);
  });

  it("DELETE valida que el usuarioId del body sea el dueño real", async () => {
    const creada = await request(app)
      .post("/api/v1/metas")
      .set(headersDe(usuarioId))
      .send({
        usuarioId,
        nombre: "Meta a borrar",
        montoObjetivo: 1000,
        fechaInicio: "2026-01-01T00:00:00Z",
      });
    const { metaId } = creada.body.data;

    const otroUsuario = await request(app)
      .delete(`/api/v1/metas/${metaId}`)
      .set(headersDe(usuarioId))
      .send({ usuarioId: usuarioId + 999999 });
    expect(otroUsuario.status).toBe(400);

    const dueñoReal = await request(app)
      .delete(`/api/v1/metas/${metaId}`)
      .set(headersDe(usuarioId))
      .send({ usuarioId });
    expect(dueñoReal.status).toBe(200);
  });
});
