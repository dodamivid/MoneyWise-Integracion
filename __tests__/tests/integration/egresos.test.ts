import request from "supertest";
import app from "../../../src/app";

const TEST_API_KEY = process.env.TEST_API_KEY ?? "test-x-api-key";
const withApiKey = (headers: Record<string, string>) => ({
  "x-api-key": TEST_API_KEY,
  ...headers,
});

describe("API Egresos - Integraci├│n", () => {
  const baseHeaders = withApiKey({
    "x-mw-user": "1",
    "x-mw-scopes": "egresos:leer,egresos:escribir,admin:egresos",
  });

  describe("GET /api/v1/egresos", () => {
    it("200 - lista egresos con par├ímetros v├ílidos", async () => {
      const response = await request(app)
        .get("/api/v1/egresos")
        .set(baseHeaders)
        .query({
          pagina: 1,
          tamanoPagina: 20,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("meta.paginacion");
      expect(response.body.meta.paginacion).toMatchObject({
        pagina: 1,
        tamanoPagina: 20,
        total: expect.any(Number),
      });
    });

    it("422 - rechaza rango de fechas inv├ílido (desde sin hasta)", async () => {
      const response = await request(app)
        .get("/api/v1/egresos")
        .set(baseHeaders)
        .query({
          desde: "2025-01-01T00:00:00Z",
        });

      expect(response.status).toBe(422);
      expect(response.body.ok).toBe(false);
      expect(response.body.error.codigo).toBe("DATOS_INVALIDOS");
    });

    it("422 - rechaza min > max", async () => {
      const response = await request(app)
        .get("/api/v1/egresos")
        .set(baseHeaders)
        .query({
          min: 100,
          max: 50,
        });

      expect(response.status).toBe(422);
      expect(response.body.ok).toBe(false);
    });

    it("403 - rechaza consulta de otro usuario sin scope admin", async () => {
      const response = await request(app)
        .get("/api/v1/egresos")
        .set(withApiKey({
          "x-mw-user": "1",
          "x-mw-scopes": "egresos:leer",
        }))
        .query({
          usuarioId: "99",
        });

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      expect(response.body.error.codigo).toBe("PERMISO_DENEGADO");
    });
  });

  describe("POST /api/v1/egresos", () => {
    it("201 - crea egreso con datos v├ílidos", async () => {
      const response = await request(app)
        .post("/api/v1/egresos")
        .set(baseHeaders)
        .send({
          tipoId: 1,
          destinoId: 1,
          monto: 1250.5,
          descripcion: "Renta mensual",
          fechaInicio: "2025-01-01T00:00:00Z",
          fechaFin: "2025-01-31T23:59:59Z",
        });

      expect(response.status).toBe(201);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("egresoId");
      expect(typeof response.body.data.egresoId).toBe("number");
    });

    it("422 - rechaza monto negativo", async () => {
      const response = await request(app)
        .post("/api/v1/egresos")
        .set(baseHeaders)
        .send({
          tipoId: 1,
          monto: -100,
          fechaInicio: "2025-01-01T00:00:00Z",
        });

      expect(response.status).toBe(422);
      expect(response.body.ok).toBe(false);
      expect(response.body.error.codigo).toBe("DATOS_INVALIDOS");
    });

    it("422 - rechaza fechaFin < fechaInicio", async () => {
      const response = await request(app)
        .post("/api/v1/egresos")
        .set(baseHeaders)
        .send({
          tipoId: 1,
          monto: 500,
          fechaInicio: "2025-02-01T00:00:00Z",
          fechaFin: "2025-01-01T00:00:00Z",
        });

      expect(response.status).toBe(422);
      expect(response.body.ok).toBe(false);
    });

    it("403 - rechaza crear egreso para otro usuario sin scope admin", async () => {
      const response = await request(app)
        .post("/api/v1/egresos")
        .set(withApiKey({
          "x-mw-user": "1",
          "x-mw-scopes": "egresos:escribir",
        }))
        .send({
          usuarioId: "99",
          tipoId: 1,
          monto: 100,
          fechaInicio: "2025-01-01T00:00:00Z",
        });

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      expect(response.body.error.codigo).toBe("PERMISO_DENEGADO");
    });
  });

  describe("GET /api/v1/egresos/:id", () => {
    it("200 - obtiene egreso existente", async () => {
      const response = await request(app)
        .get("/api/v1/egresos/1")
        .set(baseHeaders);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("egresoId", 1);
      expect(response.body.data).toHaveProperty("monto");
      expect(response.body.data).toHaveProperty("fechaInicio");
    });

    it("404 - egreso no encontrado", async () => {
      const response = await request(app)
        .get("/api/v1/egresos/99999")
        .set(baseHeaders);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
      expect(response.body.error.codigo).toBe("NO_ENCONTRADO");
    });

    it("422 - ID inv├ílido", async () => {
      const response = await request(app)
        .get("/api/v1/egresos/abc")
        .set(baseHeaders);

      expect(response.status).toBe(422);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("PATCH /api/v1/egresos/:id", () => {
    it("200 - actualiza egreso existente", async () => {
      const response = await request(app)
        .patch("/api/v1/egresos/1")
        .set(baseHeaders)
        .send({
          monto: 1500.0,
          descripcion: "Renta actualizada",
        });

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("actualizado", true);
    });

    it("422 - body vac├¡o", async () => {
      const response = await request(app)
        .patch("/api/v1/egresos/1")
        .set(baseHeaders)
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.ok).toBe(false);
    });

    it("404 - egreso no encontrado", async () => {
      const response = await request(app)
        .patch("/api/v1/egresos/99999")
        .set(baseHeaders)
        .send({
          monto: 100,
        });

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("DELETE /api/v1/egresos/:id", () => {
    it("200 - elimina egreso existente", async () => {
      const response = await request(app)
        .delete("/api/v1/egresos/1")
        .set(baseHeaders);

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty("eliminado", true);
    });

    it("404 - egreso no encontrado", async () => {
      const response = await request(app)
        .delete("/api/v1/egresos/99999")
        .set(baseHeaders);

      expect(response.status).toBe(404);
      expect(response.body.ok).toBe(false);
    });
  });

  describe("Autorizaci├│n - scopes", () => {
    it("403 - rechaza GET sin scope egresos:leer", async () => {
      const response = await request(app)
        .get("/api/v1/egresos")
        .set(withApiKey({
          "x-mw-user": "1",
          "x-mw-scopes": "",
        }));

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });

    it("403 - rechaza POST sin scope egresos:escribir", async () => {
      const response = await request(app)
        .post("/api/v1/egresos")
        .set(withApiKey({
          "x-mw-user": "1",
          "x-mw-scopes": "egresos:leer",
        }))
        .send({
          tipoId: 1,
          monto: 100,
          fechaInicio: "2025-01-01T00:00:00Z",
        });

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
    });
  });
});
