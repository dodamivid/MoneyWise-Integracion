/****
 * ESLint config para TypeScript + Prettier no disruptivo
 */
module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    // Integración con Prettier: reporta diferencias de formato como warnings
    "prettier/prettier": ["warn", { endOfLine: "auto" }],

    // Reglas suaves para evitar ruido
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "off",
  },
  ignorePatterns: [
    "dist/",
    "coverage/",
    "node_modules/",
    "docs/**",
    "**/*.js",
  ],
  overrides: [
    {
      files: ["**/__tests__/**/*.ts", "**/tests/**/*.ts", "__tests__/**/*.ts"],
      env: { jest: true },
    },
  ],
};
