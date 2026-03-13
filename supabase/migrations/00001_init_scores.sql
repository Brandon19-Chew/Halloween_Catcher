create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table scores enable row level security;

-- Policies
create policy "Public insert access" on scores for insert with check (true);
create policy "Public read access" on scores for select using (true);
