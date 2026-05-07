-- =========================
-- REFERRAL SYSTEM FIELDS
-- =========================
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by text;
alter table public.profiles add column if not exists referral_count integer default 0;

-- Optional: Create an index to quickly lookup referrers
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);

-- Update the new user trigger to include referral metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, referred_by)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'referred_by'
  );

  -- If referred_by exists, we increment the referrer's referral_count
  if (new.raw_user_meta_data ->> 'referred_by') is not null then
    update public.profiles
    set referral_count = referral_count + 1
    where referral_code = new.raw_user_meta_data ->> 'referred_by';
  end if;

  return new;
end;
$$ language plpgsql security definer;
