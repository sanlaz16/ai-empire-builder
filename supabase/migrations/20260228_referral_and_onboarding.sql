-- ==========================================
-- Migration: Profile Updates & Referral Generation
-- ==========================================

-- 1. Ensure Profiles table has all necessary onboarding fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone_br text,
  ADD COLUMN IF NOT EXISTS address_line text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS referral_code text unique,
  ADD COLUMN IF NOT EXISTS referred_by text,
  ADD COLUMN IF NOT EXISTS twofa_enabled boolean default false;

-- 2. Create a secure function to generate random EMPIRE-XXXX referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 6-character alphanumeric code prepended with EMPIRE-
    new_code := 'EMPIRE-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Ensure uniqueness
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 3. Update the handle_new_user trigger to populate the referral_code on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, referral_code)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    public.generate_referral_code()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
