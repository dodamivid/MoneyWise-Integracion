/**
 * Fuerza DB_ENABLED=true para la suite de pruebas contra MySQL real
 * (jest.db.config.js / `npm run test:db`). Las variables de conexión
 * (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME) las tiene que dar quien
 * corre la suite -- normalmente un MySQL efímero de pruebas (ver
 * CLAUDE.md, "Pruebas contra MySQL real"), nunca la base de producción.
 */
process.env.DB_ENABLED = "true";
process.env.NODE_ENV = process.env.NODE_ENV || "test";

if (!process.env.DB_HOST) {
  throw new Error(
    "test:db requiere DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME. " +
      "Ver CLAUDE.md, seccion \"Pruebas contra MySQL real\" para levantar " +
      "un MySQL de pruebas con Docker."
  );
}
