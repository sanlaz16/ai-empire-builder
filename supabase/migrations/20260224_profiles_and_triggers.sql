-- Align referrals table with requested schema
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referred_id)
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all referrals" ON public.referrals FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can view their own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    referrer_uuid UUID;
    ref_code TEXT;
BEGIN
    ref_code := new.raw_user_meta_data->>'referred_by';
    
    -- Find referrer_id if referral code exists
    IF ref_code IS NOT NULL AND ref_code != '' THEN
        SELECT user_id INTO referrer_uuid FROM public.profiles WHERE referral_code = ref_code LIMIT 1;
    END IF;

    INSERT INTO public.profiles (
        user_id,
        email,
        name,
        phone_br,
        address_line,
        city,
        state,
        postal_code,
        country,
        referred_by,
        referral_code,
        role
    )
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'phone_br',
        new.raw_user_meta_data->>'address_line',
        new.raw_user_meta_data->>'city',
        new.raw_user_meta_data->>'state',
        new.raw_user_meta_data->>'postal_code',
        new.raw_user_meta_data->>'country' || 'Brasil',
        ref_code,
        public.generate_referral_code(),
        'user'
    );

    -- If we found a valid referrer, link them in the referrals table
    IF referrer_uuid IS NOT NULL THEN
        INSERT INTO public.referrals (referrer_id, referred_id)
        VALUES (referrer_uuid, new.id)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_profile();

-- Grant access to service role for triggers
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO postgres;
