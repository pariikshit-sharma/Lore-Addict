-- 0007_search.sql
-- Replaces the expression index from 0002_content.sql with a generated,
-- stored tsvector column. supabase-js's `.textSearch()` needs to reference
-- an actual column, not an arbitrary expression — this is the standard
-- Postgres/Supabase full-text-search pattern, and it's also what makes
-- Section 8's "thin layer, swappable later" API design honest: the day
-- Postgres FTS isn't enough, only this column (and the two queries that
-- reference it) needs to change, not the schema shape callers depend on.

drop index if exists idx_articles_search;

alter table articles
  add column search_vector tsvector
  generated always as (
    to_tsvector(
      'english',
      title || ' ' || coalesce(subtitle, '') || ' ' || coalesce(excerpt, '')
    )
  ) stored;

create index idx_articles_search_vector on articles using gin(search_vector);
