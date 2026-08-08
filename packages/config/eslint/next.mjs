import nextPlugin from "eslint-config-next";

/**
 * Shared ESLint baseline for every Next.js app in the workspace.
 * App-specific configs (apps/web/eslint.config.mjs) extend this and
 * add only what's genuinely app-specific — the point of putting this
 * in packages/config is that a second app never has to re-decide
 * these rules from scratch.
 */
export const nextJsConfig = [
  ...nextPlugin,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "react/no-unescaped-entities": "off",
    },
  },
];
