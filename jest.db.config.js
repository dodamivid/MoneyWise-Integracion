// Config de Jest separada para la suite que pega a MySQL real (issue de
// seguimiento tras la pregunta "¿ya probamos que todo funciona?" -- ver
// CLAUDE.md, sección "Pruebas contra MySQL real").
//
// A diferencia de jest.config.js (que corre con DB_ENABLED apagado, así
// que cada repositorio cae a su fallback en memoria), esta config fuerza
// DB_ENABLED=true y exige que quien la corra le pase una base real
// (efímera/de pruebas, nunca la de producción) via DB_HOST/DB_PORT/
// DB_USER/DB_PASSWORD/DB_NAME.
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: __dirname,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
  testMatch: ["**/__tests__/tests/db/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  watchPathIgnorePatterns: ["<rootDir>/dist/"],
  setupFiles: ["<rootDir>/__tests__/tests/db/env.setup.js"],
  testTimeout: 20000,
  // El pool de mysql2 (src/config/db.ts) se queda abierto a propósito
  // (es un singleton pensado para vivir toda la vida del proceso Express
  // real) -- en esta suite eso deja handles abiertos que Jest nunca ve
  // cerrarse solos. forceExit es la salida estándar para este caso
  // (los tests ya terminaron y reportaron para cuando esto corre).
  forceExit: true,
  // Esta suite pega en serio a una base de datos compartida (no al
  // fallback en memoria de cada test), así que corre los test *files*
  // secuencialmente para evitar carreras entre ellos (dentro de un mismo
  // archivo sí puede haber paralelismo si Jest lo decide, por eso cada
  // archivo usa datos con sufijo único / usuarios propios).
  maxWorkers: 1,
};
