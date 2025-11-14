module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Evitar que Jest escanee 'dist' para prevenir colisiones de nombre (p.ej., package.json)
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  watchPathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,

  // LÍNEA QUE SOLUCIONA TU ERROR
  diagnostics: { ignoreCodes: [151002] },
};
