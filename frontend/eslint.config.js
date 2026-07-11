import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-empty-object-type": "off",
      "no-empty": "off",
    },
  },
  {
    files: ["pages/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/((gray|slate|zinc|neutral|stone)-[0-9]|bg-white)/]",
          message:
            "Use semantic tokens (bg-card, text-muted-foreground, border-border) instead of raw palette classes.",
        },
        {
          selector: "TemplateElement[value.raw=/((gray|slate|zinc|neutral|stone)-[0-9]|bg-white)/]",
          message:
            "Use semantic tokens (bg-card, text-muted-foreground, border-border) instead of raw palette classes.",
        },
      ],
    },
  }
);
