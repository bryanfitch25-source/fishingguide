-- Storage bucket for tackle/catch photos. Public bucket (so plain public URLs work
-- directly in <img> tags without signed-URL plumbing) but writes are restricted to the
-- owner via a folder-prefix convention: every uploaded path starts with the uploader's
-- auth.uid(), e.g. "<user_id>/tackle/<uuid>.jpg" or "<user_id>/catches/<uuid>.jpg".

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Owner can upload own photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner can update own photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owner can delete own photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public can view photos"
  on storage.objects for select
  to public
  using (bucket_id = 'photos');
