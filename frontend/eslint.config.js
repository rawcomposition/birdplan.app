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
    ignores: [
      "pages/\\[tripId\\]/index.tsx",
      "pages/\\[tripId\\]/lifelist.tsx",
      "pages/\\[tripId\\]/participants.tsx",
      "pages/\\[tripId\\]/settings.tsx",
      "pages/\\[tripId\\]/targets/\\[speciesCode\\].tsx",
      "pages/account.tsx",
      "pages/admin.tsx",
      "pages/contact.tsx",
      "pages/import-lifelist.tsx",
      "pages/index.tsx",
      "pages/onboarding.tsx",
      "pages/trips.tsx",
      "pages/whats-new.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/(gray-[0-9]|slate-[0-9]|bg-white)/]",
          message:
            "Use semantic tokens (bg-card, text-muted-foreground, border-border) instead of raw palette classes. Legacy pages are grandfathered in eslint.config.js — remove a page from that list when you modernize it.",
        },
        {
          selector: "TemplateElement[value.raw=/(gray-[0-9]|slate-[0-9]|bg-white)/]",
          message:
            "Use semantic tokens (bg-card, text-muted-foreground, border-border) instead of raw palette classes. Legacy pages are grandfathered in eslint.config.js — remove a page from that list when you modernize it.",
        },
      ],
    },
  }
);
