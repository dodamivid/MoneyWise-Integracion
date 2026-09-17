import request from "supertest";
import app from "../../../src/app";

/**
 * Issue #77: tipos-ingreso rediseñado y movido a /api/v1/catalogos/tipos-ingreso
 * (antes vivía en /api/v1/tipos-ingreso sin ningún middleware de auth aplicado).
 * No existían tests de integración para este módulo — se agregan aquí,
 * calcados de catalogos.test.ts (destinos) y tiposEgreso.
 */
const headers = {
  "x-api-key": process.env.TEST_API_KEY ?? "test-x-api-key",
  "x-mw-user": "user-1",
  "x-mw-scopes": "catalogos:leer,catalogos:escribir",
};

describe("API Catálogos - Tipos de Ingreso (issue #77)", () => {
  it("GET /api/v1/catalogos/tipos-ingreso retorna seeds", async () => {
    const res = await request(app)
      .get("/api/v1/catalogos/tipos-ingreso")
      .set(headers)
      .expect(200);

    expect(res.body.ok).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    expect(res.body.meta).toHaveProperty("paginacion");
  });

  it("la ruta vieja /api/v1/tipos-ingreso ya no existe (se movió a /catalogos)", async () => {
    await request(app)
      .get("/api/v1/tipos-ingreso")
      .set(headers)
      .expect(404);
  });

  it("sin x-api-key no se puede listar, y sin el scope correcto da 403 (antes no había auth aquí)", async () => {
    await request(app).get("/api/v1/catalogos/tipos-ingreso").expect(401);

    await request(app)
      .get("/api/v1/catalogos/tipos-ingreso")
      .set({
        "x-api-key": headers["x-api-key"],
        "x-mw-scopes": "egresos:leer",
      })
      .expect(403);
  });

  it("CRUD de tipo de ingreso de usuario respeta validaciones", async () => {
    const create = await request(app)
      .post("/api/v1/catalogos/tipos-ingreso")
      .set(headers)
      .send({ nombre: "Reembolso" })
      .expect(201);

    const tipoIngresoId = create.body.data.tipoIngresoId;
    expect(tipoIngresoId).toBeGreaterThan(0);

    await request(app)
      .post("/api/v1/catalogos/tipos-ingreso")
      .set(headers)
      .send({ nombre: "Reembolso" })
      .expect(409);

    await request(app)
      .put(`/api/v1/catalogos/tipos-ingreso/${tipoIngresoId}`)
      .set(headers)
      .send({ nombre: "Reembolso ajustado" })
      .expect(200);

    await request(app)
      .delete(`/api/v1/catalogos/tipos-ingreso/${tipoIngresoId}`)
      .set(headers)
      .expect(200);

    await request(app)
      .delete(`/api/v1/catalogos/tipos-ingreso/${tipoIngresoId}`)
      .set(headers)
      .expect(404);
  });
});
