# Milestones

Tracked against `ARCHITECTURE.md`. Each milestone is fully implemented —
no placeholders — before the next begins.

- [x] **1. Project initialization** — monorepo scaffold, tooling, CI
- [x] **2. Design system** — tokens, typography, primitives, signature motif
- [x] **3. Authentication** — Supabase Auth, RLS-backed roles, session middleware, auth pages
- [x] **4. Database** — full content/engagement/analytics schema, RLS on every table, partitioned events, materialized read view
- [x] **5. CMS** — editor, autosave, publish/schedule, media library, taxonomy, comment moderation (site analytics + user/role management deferred to Milestones 10/11 by design)
- [x] **6. Homepage** — magazine-grid layout, trending rail, article_feed-backed queries, immediate on-publish refresh
- [x] **7. Article pages** — static generation, spoiler-gated body, threaded comments, related articles, bookmarking, share, reading progress (Header/MobileNav already link to /bookmarks, built in Milestone 9)
- [x] **8. Search** — Postgres full-text search via generated tsvector column, thin swappable API boundary, debounced URL-as-state input
- [x] **9. User profiles** — author pages, public user pages, bookmarks, reading history (now actually recorded via a scroll tracker wired into article pages), account settings with avatar upload
- [x] **10. Analytics dashboard** — Edge ingest endpoint, nightly rollup + partition rollforward, role-scoped dashboard (site-wide for editors/admins, own-articles for authors); revenue/ad/search-performance metrics explicitly out of scope, not faked
- [x] **11. Admin dashboard** — role management with self-demotion guard, author roster with article counts, ad slot inventory (actual ad-network rendering out of scope pending a real network account)
- [x] **12. SEO optimization** — JSON-LD (Article/Review/NewsArticle, BreadcrumbList, sitewide WebSite/Organization), paginated sitemap, robots.txt, RSS feed, automatic slug regeneration pre-publish; also closed dead links from Milestones 6-9 (category/tag/news/reviews/theories/trending listing pages never existed until now)
- [x] **13. Performance optimization** — dynamic-imported Tiptap/recharts (CMS-only bundles deferred), Suspense-streamed related-articles/comments, route-level loading skeletons, error boundary, package-import tree-shaking, Lighthouse CI gate matching the stated budget (needs a real staging Supabase project as a secret before it can run green — see lighthouserc.js)
- [x] **14. Production deployment** — closed a real gap (scheduled-publish flip was promised in Milestone 5's architecture but never built until now), Vercel Cron config, Vercel Analytics/Speed Insights, a production migration-deploy workflow, and DEPLOYMENT.md as the actual client handoff runbook

## All 14 milestones complete.

What's deliberately not built, documented with reasoning at the point it
came up rather than glossed over: revenue/ad-network rendering and
search-performance analytics (Milestone 10), Sentry error tracking and a
staging Supabase project (Milestone 14). Everything else in
`ARCHITECTURE.md` is implemented against real Postgres schema, real RLS
policies, and real Next.js routes — no placeholder code, no TODO comments
(enforced by the shared ESLint config since Milestone 1).
