-- Nuclear Growth Engine: Referral System
-- Builds on existing profiles.referral_code column

-- 1. referrals: tracks every referred signup
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rewarded')),
    reward_type TEXT DEFAULT NULL, -- 'free_month' | 'credit' | 'plan_upgrade'
    reward_value NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    activated_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    UNIQUE (referred_user_id) -- each user can only be referred once
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own referrals"
    ON public.referrals FOR SELECT
    USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Service role full access"
    ON public.referrals FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- 2. referral_rewards: audit log of every reward issued
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_id UUID REFERENCES public.referrals(id),
    type TEXT NOT NULL, -- 'free_month' | 'credit' | 'bonus_plan'
    value NUMERIC DEFAULT 0,
    description TEXT,
    applied BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rewards"
    ON public.referral_rewards FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Service role full access to rewards"
    ON public.referral_rewards FOR ALL USING (true);

-- 3. Add click tracking + reward credit to profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS referral_clicks INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS referral_conversions INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reward_credits NUMERIC DEFAULT 0;

-- 4. Function to increment click counter when a referral link is visited
CREATE OR REPLACE FUNCTION public.increment_referral_click(p_code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET referral_clicks = COALESCE(referral_clicks, 0) + 1
    WHERE referral_code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to activate a referral (called when referred user first logs in / subscribes)
CREATE OR REPLACE FUNCTION public.activate_referral(p_referred_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.referrals SET
        status = 'active',
        activated_at = now()
    WHERE referred_user_id = p_referred_user_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
