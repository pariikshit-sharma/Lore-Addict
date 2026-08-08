-- 0004_storage.sql
-- Buckets backing the CMS media library (ARCHITECTURE.md Section 4).
-- Public read (images are served straight into article pages), write
-- restricted to author-and-above so anonymous/user-role accounts can
-- never use storage as a public upload host.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers', 'covers', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('inline', 'inline', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "Public read on covers" on storage.objects for select
  using (bucket_id = 'covers');
create policy "Public read on inline" on storage.objects for select
  using (bucket_id = 'inline');
create policy "Public read on avatars" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authors upload covers" on storage.objects for insert
  with check (bucket_id = 'covers' and is_role(array['author','editor','admin']::user_role[]));
create policy "Authors upload inline images" on storage.objects for insert
  with check (bucket_id = 'inline' and is_role(array['author','editor','admin']::user_role[]));
create policy "Users upload their own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and owner = auth.uid());

create policy "Authors manage their own cover uploads" on storage.objects for update
  using (bucket_id = 'covers' and owner = auth.uid());
create policy "Authors manage their own inline uploads" on storage.objects for update
  using (bucket_id = 'inline' and owner = auth.uid());
create policy "Editors manage any covers" on storage.objects for all
  using (bucket_id = 'covers' and is_role(array['editor','admin']::user_role[]));
create policy "Editors manage any inline images" on storage.objects for all
  using (bucket_id = 'inline' and is_role(array['editor','admin']::user_role[]));
