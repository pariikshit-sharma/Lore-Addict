-- 0002_content.sql
-- Content, taxonomy, engagement, analytics, and ads. Depends on
-- 0001_identity.sql (profiles, user_role, is_role(), set_updated_at()).

-- ============ TAXONOMY ============

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  parent_id uuid references categories(id),
  created_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- ============ CONTENT ============

create type article_status as enum ('draft', 'in_review', 'scheduled', 'published', 'archived');
create type article_type as enum ('news', 'review', 'theory', 'editorial', 'listicle', 'recap');

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  excerpt text,
  content_json jsonb not null,
  content_html text not null,
  cover_image_url text,
  cover_image_alt text,
  type article_type not null default 'news',
  status article_status not null default 'draft',
  primary_author_id uuid not null references profiles(id),
  category_id uuid references categories(id),
  contains_spoilers boolean not null default false,
  spoiler_scope text,
  reading_time_minutes integer,
  seo_title text,
  seo_description text,
  og_image_url text,
  canonical_url text,
  published_at timestamptz,
  scheduled_for timestamptz,
  is_featured boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger articles_set_updated_at
  before update on articles
  for each row execute function set_updated_at();

create table article_authors (
  article_id uuid references articles(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  primary key (article_id, author_id)
);

create table article_tags (
  article_id uuid references articles(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

create table article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  content_json jsonb not null,
  edited_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table related_articles (
  article_id uuid references articles(id) on delete cascade,
  related_article_id uuid references articles(id) on delete cascade,
  position integer not null default 0,
  primary key (article_id, related_article_id),
  constraint no_self_relation check (article_id <> related_article_id)
);

create table slug_redirects (
  old_slug text primary key,
  article_id uuid not null references articles(id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table slug_redirects is
  'Populated whenever an article slug changes post-publish, so old URLs '
  '301 instead of 404ing — see ARCHITECTURE.md Route Map section.';

-- ============ ENGAGEMENT ============

create table comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'visible' check (status in ('visible', 'pending', 'removed')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table bookmarks (
  user_id uuid references profiles(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table reading_history (
  user_id uuid references profiles(id) on delete cascade,
  article_id uuid references articles(id) on delete cascade,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_read_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  confirmed boolean not null default false,
  subscribed_categories uuid[] default '{}',
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- ============ ANALYTICS (append-only, high volume, partitioned) ============

create table article_events (
  id bigint generated always as identity,
  article_id uuid not null references articles(id),
  event_type text not null check (
    event_type in ('view', 'scroll_25', 'scroll_75', 'share', 'bookmark')
  ),
  session_id uuid not null,
  user_id uuid references profiles(id),
  country text,
  device text,
  referrer_source text,
  occurred_at timestamptz not null default now(),
  primary key (id, occurred_at)
) partition by range (occurred_at);

comment on table article_events is
  'Partitioned monthly so old partitions can be rolled up into '
  'article_daily_stats and dropped/archived without touching the hot '
  'partition. Un-partitioned, this table is the single biggest scale risk '
  'in the schema at "millions of page views" — see ARCHITECTURE.md Section 2.';

-- Current + next month partitions created at migration time; the ongoing
-- rollforward (creating next month's partition automatically) is a
-- pg_cron job added alongside the nightly rollup — see Milestone 10.
create table article_events_2026_07 partition of article_events
  for values from ('2026-07-01') to ('2026-08-01');
create table article_events_2026_08 partition of article_events
  for values from ('2026-08-01') to ('2026-09-01');

create table article_daily_stats (
  article_id uuid not null references articles(id),
  day date not null,
  views integer not null default 0,
  unique_sessions integer not null default 0,
  avg_read_time_seconds integer,
  primary key (article_id, day)
);

-- ============ ADS ============

create table ad_slots (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  provider text not null,
  config jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ad_slots_set_updated_at
  before update on ad_slots
  for each row execute function set_updated_at();

-- ============ MATERIALIZED READ VIEW ============

create materialized view article_feed as
select
  a.id, a.slug, a.title, a.excerpt, a.cover_image_url, a.type,
  a.published_at, a.reading_time_minutes, a.is_featured, a.contains_spoilers,
  c.name as category_name, c.slug as category_slug,
  p.display_name as author_name, p.username as author_username, p.avatar_url as author_avatar,
  coalesce(ds.views_7d, 0) as views_7d
from articles a
join profiles p on p.id = a.primary_author_id
left join categories c on c.id = a.category_id
left join lateral (
  select sum(views) as views_7d from article_daily_stats
  where article_id = a.id and day > current_date - interval '7 days'
) ds on true
where a.status = 'published' and a.deleted_at is null;

create unique index idx_article_feed_id on article_feed(id);

comment on materialized view article_feed is
  'Powers Home, Trending, and Category pages. Never query articles with a '
  'live join for these surfaces — refresh via pg_cron every 5 minutes plus '
  'an on-publish NOTIFY trigger (added in Milestone 6).';

-- ============ INDEXES ============

create index idx_articles_status_published on articles(status, published_at desc) where deleted_at is null;
create index idx_articles_slug on articles(slug);
create index idx_articles_category on articles(category_id) where deleted_at is null;
create index idx_article_events_article_time on article_events(article_id, occurred_at desc);
create index idx_comments_article on comments(article_id) where deleted_at is null;
create index idx_comments_pending on comments(status) where status = 'pending';
create index idx_articles_search on articles using gin(to_tsvector('english', title || ' ' || coalesce(excerpt, '')));
create index idx_reading_history_user on reading_history(user_id, last_read_at desc);

-- ============ RLS ============

alter table categories enable row level security;
alter table tags enable row level security;
alter table articles enable row level security;
alter table article_authors enable row level security;
alter table article_tags enable row level security;
alter table article_revisions enable row level security;
alter table related_articles enable row level security;
alter table slug_redirects enable row level security;
alter table comments enable row level security;
alter table bookmarks enable row level security;
alter table reading_history enable row level security;
alter table newsletter_subscribers enable row level security;
alter table ad_slots enable row level security;

-- Taxonomy: public read, editor+ write.
create policy "Categories are publicly readable" on categories for select using (true);
create policy "Editors manage categories" on categories for all
  using (is_role(array['editor','admin']::user_role[]));
create policy "Tags are publicly readable" on tags for select using (true);
create policy "Editors manage tags" on tags for all
  using (is_role(array['editor','admin']::user_role[]));

-- Articles: the core policy set described in ARCHITECTURE.md Section 2.
create policy "Published articles are public"
  on articles for select
  using (status = 'published' and deleted_at is null);

create policy "Authors see their own articles regardless of status"
  on articles for select
  using (auth.uid() = primary_author_id);

create policy "Editors and admins see everything"
  on articles for select
  using (is_role(array['editor','admin']::user_role[]));

create policy "Authors insert their own drafts"
  on articles for insert
  with check (auth.uid() = primary_author_id);

create policy "Authors update their own unpublished drafts"
  on articles for update
  using (auth.uid() = primary_author_id and status in ('draft', 'in_review'));

create policy "Editors and admins update any article"
  on articles for update
  using (is_role(array['editor','admin']::user_role[]));

create policy "Editors and admins soft-delete articles"
  on articles for delete
  using (is_role(array['editor','admin']::user_role[]));

-- Article join tables inherit visibility from the parent article.
create policy "Visible wherever the article is visible" on article_authors for select
  using (exists (select 1 from articles where id = article_id));
create policy "Editors manage article_authors" on article_authors for all
  using (is_role(array['editor','admin']::user_role[]));

create policy "Visible wherever the article is visible" on article_tags for select
  using (exists (select 1 from articles where id = article_id));
create policy "Authors and editors manage article_tags" on article_tags for all
  using (
    is_role(array['editor','admin']::user_role[])
    or exists (select 1 from articles where id = article_id and primary_author_id = auth.uid())
  );

create policy "Authors see revisions of their own articles" on article_revisions for select
  using (
    is_role(array['editor','admin']::user_role[])
    or exists (select 1 from articles where id = article_id and primary_author_id = auth.uid())
  );
create policy "Authors write revisions of their own articles" on article_revisions for insert
  with check (
    is_role(array['editor','admin']::user_role[])
    or exists (select 1 from articles where id = article_id and primary_author_id = auth.uid())
  );

create policy "Related articles visible wherever the article is" on related_articles for select
  using (true);
create policy "Editors curate related articles" on related_articles for all
  using (is_role(array['editor','admin']::user_role[]));

create policy "Redirects are publicly readable" on slug_redirects for select using (true);
create policy "Editors manage redirects" on slug_redirects for all
  using (is_role(array['editor','admin']::user_role[]));

-- Comments: visible comments are public; users manage their own; moderators see all.
create policy "Visible comments are public" on comments for select
  using (status = 'visible' and deleted_at is null);
create policy "Users see their own comments regardless of status" on comments for select
  using (auth.uid() = user_id);
create policy "Moderators see all comments" on comments for select
  using (is_role(array['moderator','editor','admin']::user_role[]));
create policy "Authenticated users create comments" on comments for insert
  with check (auth.uid() = user_id);
create policy "Users edit their own comments" on comments for update
  using (auth.uid() = user_id);
create policy "Moderators moderate any comment" on comments for update
  using (is_role(array['moderator','editor','admin']::user_role[]));

-- Bookmarks and reading history are strictly private to their owner.
create policy "Users manage their own bookmarks" on bookmarks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage their own reading history" on reading_history for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Newsletter: anyone can subscribe; only the subscriber (via unsubscribe
-- token, checked in application code, not auth.uid() — subscribers may not
-- have an account) can be found by email for confirm/unsubscribe flows.
-- No public select policy: this table is written to via the service-role
-- client from Route Handlers, never queried directly by an authenticated user.
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);
create policy "Admins manage subscribers" on newsletter_subscribers for select
  using (is_role(array['admin']::user_role[]));

create policy "Admins manage ad slots" on ad_slots for all
  using (is_role(array['admin']::user_role[]));
