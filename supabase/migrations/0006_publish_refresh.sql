-- 0006_publish_refresh.sql
-- Superseded plan note: 0003_scheduled_refresh.sql's comment mentioned a
-- NOTIFY-based trigger for immediate refresh. That approach needs an
-- external LISTEN process we don't run, and REFRESH MATERIALIZED VIEW
-- CONCURRENTLY can't execute inside a trigger's transaction anyway. This
-- function is the actual mechanism: called directly via RPC from
-- publishArticleAction right after the publish update commits, so it runs
-- as its own statement outside that transaction.

create or replace function refresh_article_feed()
returns void as $$
begin
  refresh materialized view concurrently article_feed;
end;
$$ language plpgsql security definer;

-- Callable by any authenticated CMS user who can reach publishArticleAction;
-- the function itself does nothing destructive and RLS on the underlying
-- tables is untouched by it, so this is safe to expose broadly rather than
-- restricting by role.
grant execute on function refresh_article_feed() to authenticated;
