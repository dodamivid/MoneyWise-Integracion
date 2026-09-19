//jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: {
        ignoreCodes: [151002],
      },
    }],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  // __tests__/tests/db/** es la suite que pega a MySQL real (requiere
  // DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME reales) -- corre aparte
  // con `npm run test:db` / jest.db.config.js, nunca con esta config
  // (que corre con el fallback en memoria, DB_ENABLED apagado).
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/__tests__/tests/db/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Evitar que Jest escanee 'dist' para prevenir colisiones de nombre (p.ej., package.json)
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  watchPathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,
};
