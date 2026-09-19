import { request, app, crearUsuarioDePrueba, headersDe, runSuffix } from "./helpers";

/**
 * Pruebas contra MySQL real para catálogos per-usuario (destinos,
 * procedencias, tipos-egreso). Foco en dos regresiones históricas que un
 * mock nunca hubiera detectado porque dependen de cómo el SP real calcula
 * un valor, no de qué le mandó el caller:
 *
 * - #82: `es_por_defecto` se calculaba mal en los SPs `_crear` (guardaba
 *   el usuario_id en vez de 0), lo que bloqueaba al dueño real para
 *   editar/eliminar SU PROPIO catálogo recién creado.
 * - #75: el UNION ALL de los `_listar` sin paréntesis era un error de
 *   sintaxis real de MySQL; la fila de COUNT(*) no debe colarse como
 *   registro.
 */
describe("Catálogos per-usuario contra MySQL real", () => {
  let usuarioId: number;

  beforeAll(async () => {
    ({ usuarioId } = await crearUsuarioDePrueba("catalogos"));
  });

  describe("destinos", () => {
    it("crea un destino propio, con es_por_defecto=false (regresión #82)", async () => {
      const nombre = `Destino prueba ${runSuffix}`;
      const creado = await request(app)
        .post("/api/v1/catalogos/destinos")
        .set(headersDe(usuarioId))
        .send({ nombre });

      expect(creado.status).toBe(201);
      const { destinoId } = creado.body.data;

      const listado = await request(app)
        .get("/api/v1/catalogos/destinos?tamanoPagina=50")
        .set(headersDe(usuarioId));
      const propio = listado.body.data.find((d: any) => d.destinoId === destinoId);
      expect(propio).toBeTruthy();
      expect(propio.esPorDefecto).toBe(false);

      // La prueba real de la regresión #82: si es_por_defecto se hubiera
      // guardado mal (con el usuario_id en vez de 0), esta edición
      // fallaría con PERMISO_DENEGADO aunque sea el propio dueño.
      const editado = await request(app)
        .put(`/api/v1/catalogos/destinos/${destinoId}`)
        .set(headersDe(usuarioId))
        .send({ nombre: `${nombre} editado` });
      expect(editado.status).toBe(200);

      const eliminado = await request(app)
        .delete(`/api/v1/catalogos/destinos/${destinoId}`)
        .set(headersDe(usuarioId));
      expect(eliminado.status).toBe(200);
    });

    it("rechaza un nombre duplicado para el mismo usuario", async () => {
      const nombre = `Duplicado ${runSuffix}`;
      const primero = await request(app)
        .post("/api/v1/catalogos/destinos")
        .set(headersDe(usuarioId))
        .send({ nombre });
      expect(primero.status).toBe(201);

      const segundo = await request(app)
        .post("/api/v1/catalogos/destinos")
        .set(headersDe(usuarioId))
        .send({ nombre });
      expect(segundo.status).toBe(400);
    });

    it("lista con paginación real sin colar la fila de COUNT(*) (regresión #75)", async () => {
      const respuesta = await request(app)
        .get("/api/v1/catalogos/destinos?tamanoPagina=3")
        .set(headersDe(usuarioId));

      expect(respuesta.status).toBe(200);
      expect(respuesta.body.data.length).toBeLessThanOrEqual(3);
      expect(respuesta.body.meta.paginacion.total).toBeGreaterThan(0);
      for (const destino of respuesta.body.data) {
        expect(destino.destinoId).toBeTruthy();
        expect(typeof destino.nombre).toBe("string");
      }
    });
  });

  describe("procedencias", () => {
    it("crea, edita y elimina una procedencia propia (regresión #82)", async () => {
      const nombre = `Procedencia prueba ${runSuffix}`;
      const creada = await request(app)
        .post("/api/v1/catalogos/procedencias")
        .set(headersDe(usuarioId))
        .send({ nombre });
      expect(creada.status).toBe(201);
      const { procedenciaId } = creada.body.data;

      const editada = await request(app)
        .put(`/api/v1/catalogos/procedencias/${procedenciaId}`)
        .set(headersDe(usuarioId))
        .send({ nombre: `${nombre} editada` });
      expect(editada.status).toBe(200);

      const eliminada = await request(app)
        .delete(`/api/v1/catalogos/procedencias/${procedenciaId}`)
        .set(headersDe(usuarioId));
      expect(eliminada.status).toBe(200);
    });
  });

  describe("tipos-egreso", () => {
    it("crea, edita y elimina un tipo de egreso propio (regresión #82)", async () => {
      const nombre = `Tipo egreso prueba ${runSuffix}`;
      const creado = await request(app)
        .post("/api/v1/catalogos/tipos-egreso")
        .set(headersDe(usuarioId))
        .send({ nombre });
      expect(creado.status).toBe(201);
      const { tipoEgresoId } = creado.body.data;

      const editado = await request(app)
        .put(`/api/v1/catalogos/tipos-egreso/${tipoEgresoId}`)
        .set(headersDe(usuarioId))
        .send({ nombre: `${nombre} editado` });
      expect(editado.status).toBe(200);

      const eliminado = await request(app)
        .delete(`/api/v1/catalogos/tipos-egreso/${tipoEgresoId}`)
        .set(headersDe(usuarioId));
      expect(eliminado.status).toBe(200);
    });
  });

  describe("frecuencias (global, solo admin escribe)", () => {
    it("permite lectura libre pero bloquea escritura sin admin:catalogos", async () => {
      const lectura = await request(app)
        .get("/api/v1/catalogos/frecuencias")
        .set({
          "x-api-key": headersDe(usuarioId)["x-api-key"],
          "x-mw-user": String(usuarioId),
          "x-mw-scopes": "catalogos:leer",
        });
      expect(lectura.status).toBe(200);

      const escritura = await request(app)
        .post("/api/v1/catalogos/frecuencias")
        .set({
          "x-api-key": headersDe(usuarioId)["x-api-key"],
          "x-mw-user": String(usuarioId),
          "x-mw-scopes": "catalogos:leer,catalogos:escribir",
        })
        .send({ nombre: "No debería crearse" });
      expect(escritura.status).toBe(403);
    });
  });
});
