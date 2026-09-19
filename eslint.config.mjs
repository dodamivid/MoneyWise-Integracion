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
      // Apagada a favor de la de @typescript-eslint de abajo: la base de
      // js.configs.recommended no respeta argsIgnorePattern/varsIgnorePattern,
      // así que marcaba como error params como `_req`/`_res` (ignorados a
      // propósito por convención) además de la regla de TS.
      "no-unused-vars": "off",
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
  {
    // Scripts/config sueltos en CommonJS (scripts/*.js, jest.config.js,
    // tickets/demo.js). Sin este bloque, js.configs.recommended los
    // analiza sin globals de Node, así que console/process/require/
    // module/__dirname/fetch salían como "no definido" (no-undef) aunque
    // son globals reales del entorno donde corren.
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
