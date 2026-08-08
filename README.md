# Lore Addict

Anime, movies, TV, manga, and pop-culture media platform. Full architecture
lives in `ARCHITECTURE.md` at the repo this was delivered alongside — this
README covers day-to-day setup only.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui ·
Framer Motion · Supabase (Auth/Postgres/Storage) · Vercel · Turborepo · pnpm

## Structure

```
apps/web/          The Next.js application (public site + CMS)
packages/ui/        Shared design system components
packages/config/     Shared ESLint + TypeScript presets
packages/types/      Shared TypeScript types, including generated DB types
supabase/            Migrations, seed data, local CLI config
```

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template and fill in real values
cp .env.example apps/web/.env.local

# 3. Start Supabase locally (requires Supabase CLI + Docker)
supabase start

# 4. Run migrations against the local instance
pnpm db:migrate

# 5. Generate types from the local schema
pnpm db:types

# 6. Start the dev server
pnpm dev
```

The app runs at `http://localhost:3000`, Supabase Studio at
`http://localhost:54323`.

## Conventions

- **No TODOs, no placeholder implementations** — enforced by
  `no-warning-comments` in the shared ESLint config. If something isn't
  ready, it isn't merged.
- **Schema changes only via `supabase/migrations/`** — never edit the
  production database through the dashboard directly.
- **`SUPABASE_SERVICE_ROLE_KEY` may only be imported in
  `lib/supabase/admin.ts`** — this is checked in CI, not just convention.
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, etc.)

## Milestones

This project is being built milestone by milestone. Current status is
tracked in `MILESTONES.md`.

## Deploying

See `DEPLOYMENT.md` for the actual production setup runbook.
