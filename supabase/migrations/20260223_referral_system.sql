-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create referrals table to track who referred whom
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referred_user_id) -- A user can only be referred once
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
    ON public.referral_codes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral codes"
    ON public.referral_codes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes"
    ON public.referral_codes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies for referrals
CREATE POLICY "Users can see referrals they made"
    ON public.referrals
    FOR SELECT
    USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can see who referred them"
    ON public.referrals
    FOR SELECT
    USING (auth.uid() = referred_user_id);

-- Updated_at trigger for referral_codes
CREATE TRIGGER update_referral_codes_updated_at
    BEFORE UPDATE ON public.referral_codes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Atomic increment function
CREATE OR REPLACE FUNCTION public.increment_conversions(code_val TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.referral_codes
    SET conversions = conversions + 1
    WHERE code = code_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
