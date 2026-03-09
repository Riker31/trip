-- Journal entries table
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  day_index integer not null,
  author text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Photos table
create table photos (
  id uuid default gen_random_uuid() primary key,
  day_index integer not null,
  author text not null,
  url text not null,
  caption text default '',
  created_at timestamptz default now()
);

-- Enable public read/write (trip is password-protected at app level)
alter table journal_entries enable row level security;
alter table photos enable row level security;

create policy "Allow all" on journal_entries for all using (true) with check (true);
create policy "Allow all" on photos for all using (true) with check (true);

-- Storage bucket for photos
insert into storage.buckets (id, name, public) values ('trip-photos', 'trip-photos', true);
create policy "Allow all uploads" on storage.objects for all using (bucket_id = 'trip-photos') with check (bucket_id = 'trip-photos');
