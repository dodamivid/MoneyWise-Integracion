import request from "supertest";
import app from "../../../src/app";

const headers = {
  "x-api-key": process.env.TEST_API_KEY ?? "test-x-api-key",
  "x-mw-user": "user-1",
  "x-mw-scopes": "catalogos:leer,catalogos:escribir,admin:catalogos",
};

describe("API Catálogos - Frecuencias y Destinos", () => {
  describe("Frecuencias", () => {
    it("GET /api/v1/catalogos/frecuencias retorna seeds", async () => {
      const res = await request(app)
        .get("/api/v1/catalogos/frecuencias")
        .set(headers)
        .expect(200);

      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.meta).toHaveProperty("paginacion");
    });

    it("POST /frecuencias crea y permite actualizar/eliminar", async () => {
      const create = await request(app)
        .post("/api/v1/catalogos/frecuencias")
        .set(headers)
        .send({ nombre: "Cada 2 meses" })
        .expect(201);

      const createdId = create.body.data.frecuenciaId;
      expect(createdId).toBeGreaterThan(0);

      await request(app)
        .post("/api/v1/catalogos/frecuencias")
        .set(headers)
        .send({ nombre: "Cada 2 meses" })
        .expect(400);

      await request(app)
        .put(`/api/v1/catalogos/frecuencias/${createdId}`)
        .set(headers)
        .send({ nombre: "Cada 3 meses" })
        .expect(200);

      await request(app)
        .delete(`/api/v1/catalogos/frecuencias/${createdId}`)
        .set(headers)
        .expect(200);

      await request(app)
        .delete(`/api/v1/catalogos/frecuencias/${createdId}`)
        .set(headers)
        .expect(404);
    });
  });

  describe("Destinos", () => {
    it("GET /api/v1/catalogos/destinos retorna seeds por usuario", async () => {
      const res = await request(app)
        .get("/api/v1/catalogos/destinos")
        .set(headers)
        .expect(200);

      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it("CRUD de destino de usuario respeta validaciones", async () => {
      const create = await request(app)
        .post("/api/v1/catalogos/destinos")
        .set(headers)
        .send({ nombre: "Suscripciones" })
        .expect(201);

      const destinoId = create.body.data.destinoId;
      expect(destinoId).toBeGreaterThan(0);

      await request(app)
        .post("/api/v1/catalogos/destinos")
        .set(headers)
        .send({ nombre: "Suscripciones" })
        .expect(400);

      await request(app)
        .put(`/api/v1/catalogos/destinos/${destinoId}`)
        .set(headers)
        .send({ nombre: "Suscripciones Digitales" })
        .expect(200);

      await request(app)
        .delete(`/api/v1/catalogos/destinos/${destinoId}`)
        .set(headers)
        .expect(200);
    });

    it("No permite eliminar destino por defecto", async () => {
      await request(app)
        .delete("/api/v1/catalogos/destinos/1")
        .set(headers)
        .expect(400);
    });
  });
});
