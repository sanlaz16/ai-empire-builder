-- =========================
-- EXTENSIONS
-- =========================
create extension if not exists "pgcrypto";

-- =========================
-- PROFILES TABLE
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by owner"
on public.profiles
for select
using (auth.uid() = id);

create policy "Profiles are updatable by owner"
on public.profiles
for update
using (auth.uid() = id);

-- =========================
-- SELECTED PRODUCTS
-- =========================
create table if not exists public.selected_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_json jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.selected_products enable row level security;

create policy "Users manage their products"
on public.selected_products
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- INTEGRATIONS STATUS
-- =========================
create table if not exists public.integrations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  shopify_active boolean default false,
  shopify_config jsonb, -- Retained for app functionality
  amazon_active boolean default false,
  amazon_config jsonb, -- Retained for app functionality
  tiktok_active boolean default false,
  tiktok_config jsonb, -- Retained for app functionality
  updated_at timestamp with time zone default now()
);

alter table public.integrations enable row level security;

create policy "Users manage their integrations"
on public.integrations
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- TIKTOK SCHEDULED POSTS
-- =========================
create table if not exists public.tiktok_scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_json jsonb not null,
  scheduled_at timestamp with time zone,
  region text,
  status text check (status in ('draft','scheduled','published')) default 'scheduled',
  created_at timestamp with time zone default now()
);

alter table public.tiktok_scheduled_posts enable row level security;

create policy "Users manage their TikTok posts"
on public.tiktok_scheduled_posts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- TIKTOK VIDEO SCRIPTS (NEW)
-- =========================
create table if not exists public.tiktok_video_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id text,
  script_json jsonb not null,
  created_at timestamp with time zone default now()
);

alter table public.tiktok_video_scripts enable row level security;

create policy "Users manage their video scripts"
on public.tiktok_video_scripts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
-- Dropping first to avoid conflicts if recreating
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
