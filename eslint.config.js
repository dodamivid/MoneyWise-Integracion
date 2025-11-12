// ESLint flat config para ESLint v9
import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
  // Ignorar artefactos generados y directorios no fuente
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "docs/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      prettier,
    },
    rules: {
      "prettier/prettier": ["warn", { endOfLine: "auto" }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "__tests__/**/*.ts"],
    languageOptions: { parser: tsparser, globals: { ...globals.jest, ...globals.node } },
    rules: {},
  },
];
