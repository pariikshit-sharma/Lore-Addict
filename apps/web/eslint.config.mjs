import { nextJsConfig } from "@lore-addict/config/eslint/next.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // No TODOs ship to main — this is enforced by the same rule the
      // whole workspace shares, defined once in packages/config.
      "no-warning-comments": [
        "error",
        { terms: ["todo", "fixme", "xxx"], location: "anywhere" },
      ],
    },
  },
];
