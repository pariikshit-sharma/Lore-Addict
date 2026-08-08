# Deploying Lore Addict

This is the actual runbook, not a restatement of the architecture doc.
Follow it in order the first time; after that, day-to-day deploys are just
"merge to `main`."

## Who owns what

Per `ARCHITECTURE.md`'s Deployment Architecture: **the client owns the
Supabase project and the Vercel project.** Anyone doing the setup below
works as a collaborator on both — never as sole owner. Concretely: create
both projects under the client's own Supabase/Vercel accounts (or org),
then invite collaborators, not the other way around.

## One-time setup

### 1. Supabase project

1. Create a new project at supabase.com, in the client's org.
2. Note the project ref (in the dashboard URL), the `anon` key, and the
   `service_role` key (Project Settings → API).
3. Enable the Google and Discord OAuth providers (Authentication →
   Providers) — client ID/secret for each comes from Google Cloud Console
   and the Discord Developer Portal respectively. Set the redirect URL to
   `https://<your-domain>/auth/callback` for both.
4. Locally: `supabase login`, then `supabase link --project-ref <ref>`.
5. Push the full schema: `supabase db push`. This runs every migration in
   `supabase/migrations/` in order — identity, content, storage, search,
   analytics, everything through 0008.
6. **Do not run `supabase/seed.sql` against production** — it's sample
   category/tag data for local development only.
7. Generate real types against the now-live schema:
   `pnpm db:types`, and commit the result — this replaces the hand-authored
   `packages/types/src/database.types.ts` that's been a stand-in since
   Milestone 3, since there was no live project to introspect until now.

### 2. Vercel project

1. Import the repo at vercel.com, in the client's org. Framework preset:
   Next.js. Root directory: `apps/web` (this is a monorepo — Vercel needs
   to know where the actual app lives).
2. Set every variable from `.env.example` in Vercel's Environment
   Variables settings, for both **Production** and **Preview**
   environments (Preview should point at a separate Supabase branch/schema
   — see below — not the same production database).
3. `NEXT_PUBLIC_SITE_URL` should be the real production domain once one is
   attached (step 4), not `localhost`.
4. Attach the production domain (Settings → Domains).
5. Deploy. First deploy will fail Lighthouse CI in GitHub Actions if that
   workflow runs before real env vars exist there too — see below.

### 3. GitHub Actions secrets

The workflows in `.github/workflows/` need these repo secrets
(Settings → Secrets and variables → Actions):

| Secret | Used by | Where to get it |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | `deploy-migrations.yml`, `db-migrate-check.yml` | Supabase dashboard → Account → Access Tokens |
| `SUPABASE_PROJECT_ID` | `deploy-migrations.yml` | Project Settings → General → Reference ID |
| `SUPABASE_DB_PASSWORD` | `deploy-migrations.yml` | Set when the project was created; reset it from Project Settings → Database if lost |

`ci.yml` and `lighthouse.yml` currently build against placeholder Supabase
values (see those files) — once there's a real staging project, swap
those for real secrets so Lighthouse CI can actually boot the app and
assert against real pages instead of failing to start.

### 4. Ordering: migrations before app code

`deploy-migrations.yml` runs on push to `main` when `supabase/migrations/`
changes. Vercel deploys independently, on every push to `main`, regardless
of what changed. **These are two separate pipelines with no guaranteed
ordering between them.** In practice: a PR that adds both a migration and
the code that depends on it should merge fine, because Postgres migrations
are additive-first by convention here (new nullable columns, new tables) —
old code doesn't break against a newer schema. A migration that *removes*
or *renames* something old code still reads is the dangerous case; for
those, land the migration and let it deploy fully before merging the code
that depends on its absence, as two separate merges.

### 5. Cron secret

`CRON_SECRET` (in `.env.example`) authorizes `/api/cron/publish-scheduled`.
Vercel automatically sends `Authorization: Bearer $CRON_SECRET` on every
scheduled invocation defined in `vercel.json` — just set the env var in
Vercel, no separate cron-platform configuration needed.

## Ongoing: day-to-day deploys

Once the above is done once:

- Every PR gets an isolated Vercel Preview deployment automatically.
- Merging to `main` deploys to production and (if migrations changed)
  applies them via `deploy-migrations.yml`.
- `ci.yml` (lint/typecheck/build) and `db-migrate-check.yml` (schema
  drift) gate every PR.
- Rollback: Vercel's dashboard → Deployments → pick a previous one →
  "Promote to Production." Instant, no rebuild. Database rollback is not
  instant the same way — migrations here are additive-first specifically
  so that a bad app deploy can roll back independently of the schema.

## What's explicitly not done, and why

- **Sentry** isn't wired in. `error.tsx` (Milestone 13) logs to the
  console, which is where a real Sentry SDK call would go — adding the
  SDK now, against no real Sentry project/DSN, would mean shipping
  integration code nobody can verify actually reports anywhere. Once a
  Sentry project exists: `npx @sentry/wizard@latest -i nextjs` from
  `apps/web`, set `NEXT_PUBLIC_SENTRY_DSN`/`SENTRY_AUTH_TOKEN` (already in
  `.env.example`), and replace the `console.error` in `error.tsx` with the
  SDK's capture call.
- **A staging Supabase project** for Preview deployments isn't created
  here — that's a real Supabase project the client needs to spin up the
  same way as production (step 1 above, a second time), which is outside
  what this handoff document can do on its own.
