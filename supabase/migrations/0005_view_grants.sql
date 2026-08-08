-- 0005_view_grants.sql
-- article_feed is a materialized view, not a table — RLS policies (which
-- apply to tables) don't govern it. It's safe to expose without RLS
-- because the view definition itself already filters to
-- `status = 'published' and deleted_at is null` (see 0002_content.sql),
-- so there's no row this grant could leak that isn't already meant to be
-- public.

grant select on article_feed to anon, authenticated;
