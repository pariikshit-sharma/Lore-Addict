-- seed.sql — local development only. Never run against production;
-- production content is entered through the CMS (Milestone 5).

insert into categories (name, slug, description) values
  ('Anime', 'anime', 'News, reviews, and theories from the anime world.'),
  ('Movies', 'movies', 'Film news, reviews, and box office coverage.'),
  ('TV', 'tv', 'Television series news and recaps.'),
  ('Manga', 'manga', 'Manga releases, chapter breakdowns, and news.'),
  ('Pop Culture', 'pop-culture', 'Memes, fandom trends, and general pop culture.')
on conflict (slug) do nothing;

insert into categories (name, slug, description, parent_id) values
  ('Shonen', 'shonen', 'Shonen anime and manga.', (select id from categories where slug = 'anime'))
on conflict (slug) do nothing;

insert into tags (name, slug) values
  ('Leaks', 'leaks'),
  ('Season Finale', 'season-finale'),
  ('Trailer', 'trailer'),
  ('Fan Theory', 'fan-theory'),
  ('Box Office', 'box-office')
on conflict (slug) do nothing;
