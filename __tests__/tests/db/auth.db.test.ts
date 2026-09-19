import { request, app, TEST_API_KEY, crearUsuarioDePrueba, runSuffix } from "./helpers";

/**
 * Pruebas contra MySQL real: registro/login/duplicados.
 * Cubre auth.repository.ts (6.5% de cobertura con el fallback en
 * memoria de la suite normal, porque ese repo no tiene fallback: siempre
 * llama a db.call()) contra la base de datos real, no un mock.
 */
describe("Auth contra MySQL real", () => {
  it("registra un usuario real y persiste en la tabla usuarios", async () => {
    const { usuarioId, correo } = await crearUsuarioDePrueba("registro");

    expect(typeof usuarioId).toBe("number");
    expect(usuarioId).toBeGreaterThan(0);

    // La contraseña se hashea con bcrypt (issue histórico: CLAUDE.md
    // antes decía que no, se corrigió) -- lo confirmamos indirectamente:
    // login con la contraseña correcta funciona, con una incorrecta no.
    const loginOk = await request(app)
      .post("/api/v1/auth/acceso")
      .set("x-api-key", TEST_API_KEY)
      .send({ correo, contrasena: "TestDB2026!" });

    expect(loginOk.status).toBe(200);
    expect(loginOk.body.data.usuario.usuarioId).toBe(usuarioId);
    expect(loginOk.body.data.token).toBeTruthy();

    const loginMal = await request(app)
      .post("/api/v1/auth/acceso")
      .set("x-api-key", TEST_API_KEY)
      .send({ correo, contrasena: "ContraseñaIncorrecta1!" });

    expect(loginMal.status).toBe(400);
  });

  it("rechaza un correo duplicado (409/400 real desde la BD, no un mock)", async () => {
    const correo = `duplicado.${runSuffix}@dbtest.moneywise`;
    const primero = await request(app)
      .post("/api/v1/auth/registro")
      .set("x-api-key", TEST_API_KEY)
      .send({
        nombre: "Test",
        apellidoP: "Dup",
        apellidoM: "Licado",
        correo,
        fechaN: "1995-01-01",
        contrasena: "TestDB2026!",
      });
    expect(primero.status).toBe(201);

    const segundo = await request(app)
      .post("/api/v1/auth/registro")
      .set("x-api-key", TEST_API_KEY)
      .send({
        nombre: "Test",
        apellidoP: "Dup",
        apellidoM: "Licado",
        correo,
        fechaN: "1995-01-01",
        contrasena: "OtraContra2026!",
      });

    expect(segundo.status).toBe(400);
    expect(segundo.body.ok).toBe(false);
  });
});
