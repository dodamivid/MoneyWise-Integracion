/**
 * @fileoverview Pruebas de integración para endpoints de Metas.
 *
 * Este archivo contiene pruebas de integración completas para todos los endpoints
 * de la API de metas, incluyendo casos de éxito y casos de error.
 *
 * @module tests/integration/metas.test
 * @category Tests
 */

import request from "supertest";
import app from "../../../src/app";
import { metasRepository } from "../../../src/repositories/metas.repository";

describe("Metas API Endpoints", () => {
  // Limpiar el repositorio antes de cada prueba para asegurar estado limpio
  beforeEach(async () => {
    await metasRepository.clear();
  });

  describe("POST /api/v1/metas", () => {
    it("should create a new meta and return 201", async () => {
      const metaData = {
        usuarioId: 23,
        nombre: "Vacaciones 2026",
        montoObjetivo: 150000.0,
        fechaInicio: "2025-01-01T00:00:00Z",
        fechaFin: "2026-12-31T23:59:59Z",
        activa: true,
      };

      const response = await request(app)
        .post("/api/v1/metas")
        .send(metaData)
        .set("Accept", "application/json")
        .expect(201);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("metaId");
      expect(typeof response.body.data.metaId).toBe("number");
    });

    it("should create a meta without fechaFin", async () => {
      const metaData = {
        usuarioId: 23,
        nombre: "Fondo de emergencia",
        montoObjetivo: 50000.0,
        fechaInicio: "2025-01-01T00:00:00Z",
        activa: true,
      };

      const response = await request(app)
        .post("/api/v1/metas")
        .send(metaData)
        .set("Accept", "application/json")
        .expect(201);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("metaId");
    });

    it("should return error for invalid meta data - montoObjetivo negative", async () => {
      const invalidMetaData = {
        usuarioId: 23,
        nombre: "Meta inválida",
        montoObjetivo: -1000.0,
        fechaInicio: "2025-01-01T00:00:00Z",
      };

      const response = await request(app)
        .post("/api/v1/metas")
        .send(invalidMetaData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("statusCode", 400);
    });

    it("should return error for fechaFin before fechaInicio", async () => {
      const invalidMetaData = {
        usuarioId: 23,
        nombre: "Meta con fechas inválidas",
        montoObjetivo: 10000.0,
        fechaInicio: "2025-12-31T00:00:00Z",
        fechaFin: "2025-01-01T00:00:00Z",
      };

      const response = await request(app)
        .post("/api/v1/metas")
        .send(invalidMetaData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should return error for missing required fields", async () => {
      const invalidMetaData = {
        usuarioId: 23,
        nombre: "Meta incompleta",
        // Falta montoObjetivo y fechaInicio
      };

      const response = await request(app)
        .post("/api/v1/metas")
        .send(invalidMetaData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should return error for nombre too long", async () => {
      const invalidMetaData = {
        usuarioId: 23,
        nombre: "A".repeat(121), // Excede el máximo de 120 caracteres
        montoObjetivo: 10000.0,
        fechaInicio: "2025-01-01T00:00:00Z",
      };

      const response = await request(app)
        .post("/api/v1/metas")
        .send(invalidMetaData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("GET /api/v1/metas/:id", () => {
    it("should return a meta by ID", async () => {
      // Primero crear una meta
      const metaData = {
        usuarioId: 23,
        nombre: "Meta de prueba",
        montoObjetivo: 100000.0,
        fechaInicio: "2025-01-01T00:00:00Z",
        activa: true,
      };

      const createResponse = await request(app)
        .post("/api/v1/metas")
        .send(metaData)
        .expect(201);

      const metaId = createResponse.body.data.metaId;

      // Luego obtenerla por ID
      const response = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("metaId", metaId);
      expect(response.body.data).toHaveProperty("nombre", metaData.nombre);
      expect(response.body.data).toHaveProperty("montoObjetivo", metaData.montoObjetivo);
      expect(response.body.data).toHaveProperty("ahorroReal", 0.0);
      expect(response.body.data).toHaveProperty("porcentajeAvance", 0.0);
      expect(response.body.data).toHaveProperty("activa", true);
    });

    it("should return error for non-existent meta ID", async () => {
      const nonExistentId = 9999;

      const response = await request(app)
        .get(`/api/v1/metas/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("statusCode", 404);
    });

    it("should return error for invalid meta ID format", async () => {
      const invalidId = "abc";

      const response = await request(app)
        .get(`/api/v1/metas/${invalidId}`)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("GET /api/v1/metas", () => {
    beforeEach(async () => {
      // Crear varias metas de prueba
      await request(app)
        .post("/api/v1/metas")
        .send({
          usuarioId: 23,
          nombre: "Meta 1",
          montoObjetivo: 10000.0,
          fechaInicio: "2025-01-01T00:00:00Z",
          activa: true,
        });

      await request(app)
        .post("/api/v1/metas")
        .send({
          usuarioId: 23,
          nombre: "Meta 2",
          montoObjetivo: 20000.0,
          fechaInicio: "2025-02-01T00:00:00Z",
          activa: false,
        });

      await request(app)
        .post("/api/v1/metas")
        .send({
          usuarioId: 24,
          nombre: "Meta 3",
          montoObjetivo: 30000.0,
          fechaInicio: "2025-03-01T00:00:00Z",
          activa: true,
        });
    });

    it("should return list of metas with pagination", async () => {
      const response = await request(app)
        .get("/api/v1/metas")
        .query({ pagina: 1, tamanoPagina: 10 })
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body).toHaveProperty("data");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta).toHaveProperty("paginacion");
      expect(response.body.meta.paginacion).toHaveProperty("pagina", 1);
      expect(response.body.meta.paginacion).toHaveProperty("tamanoPagina", 10);
      expect(response.body.meta.paginacion).toHaveProperty("total");
    });

    it("should filter metas by usuarioId", async () => {
      const response = await request(app)
        .get("/api/v1/metas")
        .query({ usuarioId: 23, pagina: 1, tamanoPagina: 10 })
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((meta: any) => {
        expect(meta.usuarioId).toBe(23);
      });
    });

    it("should filter metas by activa status", async () => {
      const response = await request(app)
        .get("/api/v1/metas")
        .query({ activa: true, pagina: 1, tamanoPagina: 10 })
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      response.body.data.forEach((meta: any) => {
        expect(meta.activa).toBe(true);
      });
    });

    it("should support ordering by fechaInicio:desc", async () => {
      const response = await request(app)
        .get("/api/v1/metas")
        .query({ orden: "fechaInicio:desc", pagina: 1, tamanoPagina: 10 })
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verificar que están ordenadas correctamente
      for (let i = 0; i < response.body.data.length - 1; i++) {
        const fecha1 = new Date(response.body.data[i].fechaInicio);
        const fecha2 = new Date(response.body.data[i + 1].fechaInicio);
        expect(fecha1.getTime()).toBeGreaterThanOrEqual(fecha2.getTime());
      }
    });

    it("should return error for invalid pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/metas")
        .query({ pagina: -1, tamanoPagina: 10 })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should return error for invalid orden parameter", async () => {
      const response = await request(app)
        .get("/api/v1/metas")
        .query({ orden: "campoInvalido:asc" })
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("PATCH /api/v1/metas/:id", () => {
    let metaId: number;

    beforeEach(async () => {
      // Crear una meta de prueba
      const response = await request(app)
        .post("/api/v1/metas")
        .send({
          usuarioId: 23,
          nombre: "Meta original",
          montoObjetivo: 100000.0,
          fechaInicio: "2025-01-01T00:00:00Z",
          activa: true,
        });

      metaId = response.body.data.metaId;
    });

    it("should update meta ahorroReal", async () => {
      const updateData = {
        ahorroReal: 50000.0,
      };

      const response = await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("actualizado", true);

      // Verificar que se actualizó correctamente
      const getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.ahorroReal).toBe(50000.0);
      expect(getResponse.body.data.porcentajeAvance).toBe(50.0);
    });

    it("should update meta nombre and montoObjetivo", async () => {
      const updateData = {
        nombre: "Meta actualizada",
        montoObjetivo: 200000.0,
      };

      const response = await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);

      // Verificar actualización
      const getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.nombre).toBe("Meta actualizada");
      expect(getResponse.body.data.montoObjetivo).toBe(200000.0);
    });

    it("should update meta to inactive", async () => {
      const updateData = {
        activa: false,
      };

      const response = await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);

      // Verificar actualización
      const getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.activa).toBe(false);
    });

    it("should return error when ahorroReal exceeds montoObjetivo", async () => {
      const updateData = {
        ahorroReal: 150000.0, // Excede el montoObjetivo de 100000
      };

      const response = await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should return error for non-existent meta", async () => {
      const updateData = {
        nombre: "Meta no existente",
      };

      const response = await request(app)
        .patch("/api/v1/metas/9999")
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should return error for invalid fechaFin", async () => {
      const updateData = {
        fechaFin: "2024-01-01T00:00:00Z", // Antes de fechaInicio (2025-01-01)
      };

      const response = await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("DELETE /api/v1/metas/:id", () => {
    let metaId: number;

    beforeEach(async () => {
      // Crear una meta de prueba
      const response = await request(app)
        .post("/api/v1/metas")
        .send({
          usuarioId: 23,
          nombre: "Meta a eliminar",
          montoObjetivo: 100000.0,
          fechaInicio: "2025-01-01T00:00:00Z",
          activa: true,
        });

      metaId = response.body.data.metaId;
    });

    it("should delete meta (soft delete)", async () => {
      const response = await request(app)
        .delete(`/api/v1/metas/${metaId}`)
        .send({ usuarioId: 23 }) // Simulando autenticación
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("eliminado", true);

      // Verificar que la meta sigue existiendo pero está inactiva
      const getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.activa).toBe(false);
    });

    it("should return error for non-existent meta", async () => {
      const response = await request(app)
        .delete("/api/v1/metas/9999")
        .send({ usuarioId: 23 })
        .expect(404);

      expect(response.body).toHaveProperty("status", "error");
    });

    it("should return error when deleting meta from different user", async () => {
      const response = await request(app)
        .delete(`/api/v1/metas/${metaId}`)
        .send({ usuarioId: 999 }) // Usuario diferente
        .expect(400);

      expect(response.body).toHaveProperty("status", "error");
    });
  });

  describe("Integration Flow", () => {
    it("should create, update, and track progress of a meta", async () => {
      // 1. Crear meta
      const createResponse = await request(app)
        .post("/api/v1/metas")
        .send({
          usuarioId: 23,
          nombre: "Vacaciones 2026",
          montoObjetivo: 100000.0,
          fechaInicio: "2025-01-01T00:00:00Z",
          fechaFin: "2026-12-31T23:59:59Z",
          activa: true,
        })
        .expect(201);

      const metaId = createResponse.body.data.metaId;

      // 2. Obtener meta - verificar estado inicial
      let getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.ahorroReal).toBe(0.0);
      expect(getResponse.body.data.porcentajeAvance).toBe(0.0);

      // 3. Actualizar ahorro - 25% progreso
      await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send({ ahorroReal: 25000.0 })
        .expect(200);

      getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.ahorroReal).toBe(25000.0);
      expect(getResponse.body.data.porcentajeAvance).toBe(25.0);

      // 4. Actualizar ahorro - 100% progreso
      await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send({ ahorroReal: 100000.0 })
        .expect(200);

      getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.ahorroReal).toBe(100000.0);
      expect(getResponse.body.data.porcentajeAvance).toBe(100.0);

      // 5. Cerrar meta (marcar como completada)
      await request(app)
        .patch(`/api/v1/metas/${metaId}`)
        .send({ activa: false })
        .expect(200);

      getResponse = await request(app)
        .get(`/api/v1/metas/${metaId}`)
        .expect(200);

      expect(getResponse.body.data.activa).toBe(false);
    });
  });
});
