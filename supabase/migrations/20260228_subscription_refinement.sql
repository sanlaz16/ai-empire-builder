-- Nuclear 34: Subscription Tier Refinement
-- Move from starter/growth/scale to free/pro/elite

-- 1. Insert/Update user requested tiers
INSERT INTO public.plans (id, name, price_monthly_cents, features) VALUES
(
    'free', 
    'Free', 
    0, 
    '{"can_view_suppliers": true, "can_view_store": true, "supplier_limit": 10, "store_limit": 10}'::jsonb
),
(
    'pro', 
    'Pro', 
    4900, 
    '{"can_import_shopify": true, "can_optimize_ai": true, "seed_daily": 100, "rescan_daily": 50, "optimize_daily": 50}'::jsonb
),
(
    'elite', 
    'Elite', 
    9900, 
    '{"can_export_tiktok": true, "referral_bonuses": true, "seed_daily": 500, "rescan_daily": 200, "optimize_daily": 200}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    price_monthly_cents = EXCLUDED.price_monthly_cents,
    features = EXCLUDED.features;

-- 2. Ensure profiles table has all necessary fields
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- 3. Update existing subscriptions if any (optional/best effort mapping)
-- UPDATE public.subscriptions SET plan_id = 'pro' WHERE plan_id IN ('starter10k', 'growth25k');
-- UPDATE public.subscriptions SET plan_id = 'elite' WHERE plan_id = 'scale50k';

-- Ensure denormalized fields on profiles match subscriptions
CREATE OR REPLACE FUNCTION sync_profile_subscription()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles SET
        plan_id = NEW.plan_id,
        subscription_status = NEW.status,
        billing_provider = NEW.provider,
        subscription_period_end = NEW.current_period_end
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_profile_subscription ON public.subscriptions;
CREATE TRIGGER tr_sync_profile_subscription
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE sync_profile_subscription();
