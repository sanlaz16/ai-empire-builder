-- Onboarding tracking fields for profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS selected_niche TEXT,
    ADD COLUMN IF NOT EXISTS store_name TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);
