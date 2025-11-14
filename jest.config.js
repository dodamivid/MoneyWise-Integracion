//jest.config.js
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

  // 👇 BLOQUE NECESARIO PARA IGNORAR TS151002
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151002]
      }
    }
  },

  // 👇 BLOQUE EXTRA para que coverage TAMBIÉN ignore TS151002
  diagnostics: {
    ignoreCodes: [151002]
  }
};
