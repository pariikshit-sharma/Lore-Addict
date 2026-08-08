-- 0003_scheduled_refresh.sql
-- Keeps article_feed from going stale without requiring a live join on
-- every homepage/category/trending request. The on-publish immediate
-- refresh (via NOTIFY, so a just-published article doesn't wait 5 minutes)
-- is added in Milestone 6 alongside the publish flow it triggers from.

create extension if not exists pg_cron;

select cron.schedule(
  'refresh-article-feed',
  '*/5 * * * *',
  $$ refresh materialized view concurrently article_feed $$
);

comment on extension pg_cron is
  'Also used in Milestone 5 (scheduled-publish flip) and Milestone 10 '
  '(nightly article_daily_stats rollup) — one scheduler for all recurring '
  'database jobs rather than mixing in an external cron service.';
