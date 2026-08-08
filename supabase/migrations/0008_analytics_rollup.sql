-- 0008_analytics_rollup.sql
--
-- Note on scope: article_events and article_daily_stats were created in
-- 0002_content.sql without RLS enabled — an oversight, not a deliberate
-- choice (every other table in that migration got policies). Fixed here:
-- writes stay open (anonymous readers must be able to log a view without
-- an account), reads are restricted to staff, since raw event data
-- shouldn't be publicly queryable even though the rollup it produces is
-- used to compute a public "views_7d" number.

alter table article_events enable row level security;
alter table article_daily_stats enable row level security;

create policy "Anyone can log an event" on article_events for insert with check (true);
create policy "Staff can read raw events" on article_events for select
  using (is_role(array['editor','admin']::user_role[]));

create policy "Staff can read daily stats" on article_daily_stats for select
  using (is_role(array['editor','admin']::user_role[]));
create policy "Authors can read stats for their own articles" on article_daily_stats for select
  using (exists (
    select 1 from articles
    where id = article_daily_stats.article_id and primary_author_id = auth.uid()
  ));
-- Writes to article_daily_stats happen only from the rollup function below
-- (security definer) and the admin client — never from a user request.

-- ============ NIGHTLY ROLLUP ============

create or replace function rollup_daily_stats(target_date date)
returns void as $$
begin
  insert into article_daily_stats (article_id, day, views, unique_sessions, avg_read_time_seconds)
  select
    article_id,
    target_date,
    count(*) filter (where event_type = 'view'),
    count(distinct session_id),
    null -- read-time derivation needs scroll-depth timing correlation;
         -- deferred until there's a concrete product need for it rather
         -- than computed speculatively against unused data
  from article_events
  where occurred_at >= target_date and occurred_at < target_date + interval '1 day'
  group by article_id
  on conflict (article_id, day) do update set
    views = excluded.views,
    unique_sessions = excluded.unique_sessions;
end;
$$ language plpgsql security definer;

select cron.schedule(
  'rollup-daily-stats',
  '15 0 * * *', -- 00:15 daily, after the day being rolled up has fully elapsed
  $$ select rollup_daily_stats((current_date - interval '1 day')::date) $$
);

-- ============ PARTITION ROLLFORWARD ============

create or replace function ensure_next_month_partition()
returns void as $$
declare
  next_month date := date_trunc('month', now() + interval '1 month');
  partition_name text := 'article_events_' || to_char(next_month, 'YYYY_MM');
begin
  if not exists (select 1 from pg_class where relname = partition_name) then
    execute format(
      'create table %I partition of article_events for values from (%L) to (%L)',
      partition_name, next_month, next_month + interval '1 month'
    );
  end if;
end;
$$ language plpgsql security definer;

select cron.schedule(
  'ensure-next-month-partition',
  '0 0 1 * *', -- first of every month
  $$ select ensure_next_month_partition() $$
);
