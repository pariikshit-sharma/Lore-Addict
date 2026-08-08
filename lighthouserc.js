// Requires a running server, not a static export, since this app has
// middleware, ISR, and Server Actions — collect.startServerCommand boots
// the real `next start` against real env vars. In CI those env vars are
// currently placeholders (see lighthouse.yml), which means server-side
// Supabase calls will fail at runtime; this config is correct and ready,
// but actually running green in CI needs a real staging Supabase project
// wired in as a GitHub secret, which doesn't exist until Milestone 14
// stands up a deployed environment to point at.
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter web start",
      startServerReadyPattern: "Ready in",
      url: ["http://localhost:3000/"],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 1800 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
