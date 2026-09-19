import request from "supertest";
import app from "../../../src/app";
import { fechasCorteRepository } from "../../../src/repositories/fechasCorte.repository";

/**
 * Pruebas de integración para Fechas de Corte de Ahorro (issue #91).
 */
const TEST_API_KEY = process.env.TEST_API_KEY ?? "test-x-api-key";
const baseHeaders = {
  "x-api-key": TEST_API_KEY,
  "x-mw-user": "23",
  "x-mw-scopes": "ahorro:leer,ahorro:escribir",
};

describe("Fechas de Corte de Ahorro API (issue #91)", () => {
  beforeEach(async () => {
    await fechasCorteRepository.clear();
  });

  describe("GET /api/v1/ahorro/fechas-corte", () => {
    it("403 sin el scope ahorro:leer", async () => {
      const response = await request(app)
        .get("/api/v1/ahorro/fechas-corte")
        .set("x-api-key", TEST_API_KEY)
        .set("x-mw-user", "23")
        .set("x-mw-scopes", "ninguno");

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("ok", false);
    });

    it("200 y lista vacía cuando el usuario no tiene fechas de corte", async () => {
      const response = await request(app)
        .get("/api/v1/ahorro/fechas-corte")
        .set(baseHeaders)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.paginacion.total).toBe(0);
    });
  });

  describe("POST /api/v1/ahorro/fechas-corte", () => {
    it("201 al crear una fecha de corte", async () => {
      const response = await request(app)
        .post("/api/v1/ahorro/fechas-corte")
        .set(baseHeaders)
        .send({ fechaCorte: "2026-03-31T23:59:59Z" })
        .expect(201);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("fechaCorteId");
      expect(typeof response.body.data.fechaCorteId).toBe("number");
    });

    it("403 sin el scope ahorro:escribir", async () => {
      const response = await request(app)
        .post("/api/v1/ahorro/fechas-corte")
        .set("x-api-key", TEST_API_KEY)
        .set("x-mw-user", "23")
        .set("x-mw-scopes", "ahorro:leer")
        .send({ fechaCorte: "2026-03-31T23:59:59Z" });

      expect(response.status).toBe(403);
    });

    it("422 con fecha en formato inválido", async () => {
      const response = await request(app)
        .post("/api/v1/ahorro/fechas-corte")
        .set(baseHeaders)
        .send({ fechaCorte: "31-03-2026" })
        .expect(422);

      expect(response.body).toHaveProperty("ok", false);
    });

    it("409 al crear una fecha de corte duplicada para el mismo usuario", async () => {
      await request(app)
        .post("/api/v1/ahorro/fechas-corte")
        .set(baseHeaders)
        .send({ fechaCorte: "2026-03-31T23:59:59Z" })
        .expect(201);

      const response = await request(app)
        .post("/api/v1/ahorro/fechas-corte")
        .set(baseHeaders)
        .send({ fechaCorte: "2026-03-31T23:59:59Z" })
        .expect(409);

      expect(response.body).toHaveProperty("ok", false);
    });
  });

  describe("DELETE /api/v1/ahorro/fechas-corte/:id", () => {
    it("200 al eliminar una fecha de corte propia", async () => {
      const creada = await request(app)
        .post("/api/v1/ahorro/fechas-corte")
        .set(baseHeaders)
        .send({ fechaCorte: "2026-06-30T23:59:59Z" })
        .expect(201);

      const { fechaCorteId } = creada.body.data;

      const response = await request(app)
        .delete(`/api/v1/ahorro/fechas-corte/${fechaCorteId}`)
        .set(baseHeaders)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("eliminado", true);
    });

    it("404 al eliminar una fecha de corte que no existe", async () => {
      const response = await request(app)
        .delete("/api/v1/ahorro/fechas-corte/9999")
        .set(baseHeaders)
        .expect(404);

      expect(response.body).toHaveProperty("ok", false);
    });
  });

});
