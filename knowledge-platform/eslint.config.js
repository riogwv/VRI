import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["src/scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2022,
        "import.meta": "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-debugger": "warn",
    },
  },
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    rules: {
      "no-console": "off",
    },
  },
];

