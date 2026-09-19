import request from "supertest";
import app from "../../../src/app";

/**
 * Helpers compartidos para la suite de pruebas contra MySQL real
 * (jest.db.config.js). A diferencia de los tests de integración normales
 * (que corren con el fallback en memoria), aquí cada usuario/registro que
 * se crea es real y persiste en la base de pruebas -- por eso se usan
 * correos únicos por corrida para no chocar con datos de corridas
 * anteriores contra la misma base.
 */

export const TEST_API_KEY = process.env.TEST_API_KEY ?? "test-x-api-key";

const ALL_SCOPES =
  "ingresos:leer,ingresos:escribir,egresos:leer,egresos:escribir,inversiones:leer,inversiones:escribir,metas:leer,metas:escribir,catalogos:leer,catalogos:escribir,admin:catalogos,dashboard:leer,ahorro:leer,ahorro:escribir";

/** Sufijo único por proceso de test, para no chocar entre corridas. */
export const runSuffix = `${Date.now()}${Math.floor(Math.random() * 1e5)}`;

export interface UsuarioDePrueba {
  usuarioId: number;
  correo: string;
}

/**
 * Registra un usuario real via /api/v1/auth/registro y devuelve su
 * usuarioId real (de la tabla `usuarios`).
 */
export async function crearUsuarioDePrueba(
  etiqueta: string
): Promise<UsuarioDePrueba> {
  const correo = `${etiqueta}.${runSuffix}.${Math.floor(Math.random() * 1e6)}@dbtest.moneywise`;
  const respuesta = await request(app)
    .post("/api/v1/auth/registro")
    .set("x-api-key", TEST_API_KEY)
    .send({
      nombre: "Test",
      apellidoP: "DB",
      apellidoM: etiqueta,
      correo,
      fechaN: "1995-01-01",
      contrasena: "TestDB2026!",
    });

  if (respuesta.status !== 201) {
    throw new Error(
      `No se pudo crear usuario de prueba (${etiqueta}): ${JSON.stringify(respuesta.body)}`
    );
  }

  return { usuarioId: respuesta.body.data.usuarioId, correo };
}

/** Headers de auth simulada (mockAuth) para actuar como el usuario dado. */
export function headersDe(usuarioId: number) {
  return {
    "x-api-key": TEST_API_KEY,
    "x-mw-user": String(usuarioId),
    "x-mw-scopes": ALL_SCOPES,
  };
}

/**
 * Trae el id del primer registro de un catálogo global disponible, vía la
 * API real (no hardcodeado) -- evita que estos tests se rompan si el seed
 * global cambia. `campoId` es el nombre del campo id en la respuesta
 * (ej. "destinoId", "tipoIngresoId").
 */
export async function primerIdDeCatalogo(
  path: string,
  campoId: string,
  usuarioId: number
): Promise<number> {
  const respuesta = await request(app)
    .get(`/api/v1/catalogos/${path}?tamanoPagina=1`)
    .set(headersDe(usuarioId));

  if (respuesta.status !== 200 || !respuesta.body.data?.length) {
    throw new Error(
      `No hay catálogo "${path}" disponible para el helper de pruebas: ${JSON.stringify(respuesta.body)}`
    );
  }

  return respuesta.body.data[0][campoId];
}

export { request, app };
