-- Migration: Nuclear 26+27 - Billing, Subscriptions, and Usage Counters

-- 1. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY, -- 'free', 'starter10k', 'growth25k', 'scale50k'
    name TEXT NOT NULL,
    price_monthly_cents INTEGER NOT NULL,
    billing_provider_price_id TEXT, -- Optional, used for Stripe Price ID
    features JSONB NOT NULL DEFAULT '{}'::jsonb, -- Limits: { seed_daily: 10, rescan_daily: 5, ... }
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
-- Everyone can read plans
CREATE POLICY "Public can read plans" ON plans FOR SELECT USING (true);
-- Only service role can write plans (handled by default if no policy is created for INSERT/UPDATE)

-- 2. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'pagarme')),
    status TEXT NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled', 'incomplete'
    current_period_end TIMESTAMPTZ,
    provider_customer_id TEXT,
    provider_subscription_id TEXT,
    plan_id TEXT NOT NULL REFERENCES plans(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Denormalize onto profiles for easier querying in middleware/app
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS plan_id TEXT REFERENCES plans(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS billing_provider TEXT;

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub_id ON subscriptions(provider_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
-- Only service role can modify subscriptions via webhooks

-- 3. Usage Counters Table
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('daily', 'monthly')),
    key TEXT NOT NULL, -- 'seed', 'rescan', 'optimize', 'tiktok_export', 'push_to_store', 'api_requests'
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, period, key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_usage_counters_user_id ON usage_counters(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_window ON usage_counters(window_start);

ALTER TABLE usage_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own usage" ON usage_counters FOR SELECT USING (user_id = auth.uid());
-- Server will increment usage via service role

-- Function to handle `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plans_modtime BEFORE UPDATE ON plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_modtime BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_usage_counters_modtime BEFORE UPDATE ON usage_counters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Initial Seed for Plans
INSERT INTO plans (id, name, price_monthly_cents, features) VALUES
(
    'free', 
    'Free', 
    0, 
    '{"seed_daily": 10, "rescan_daily": 5, "optimize_daily": 5, "tiktok_export_daily": 5, "push_daily": 3, "api_requests_min": 30}'::jsonb
),
(
    'starter10k', 
    'Starter (10k)', 
    3900, 
    '{"seed_daily": 50, "rescan_daily": 30, "optimize_daily": 50, "tiktok_export_daily": 50, "push_daily": 25, "api_requests_min": 120}'::jsonb
),
(
    'growth25k', 
    'Growth (25k)', 
    9900, 
    '{"seed_daily": 200, "rescan_daily": 120, "optimize_daily": 200, "tiktok_export_daily": 200, "push_daily": 100, "api_requests_min": 240}'::jsonb
),
(
    'scale50k', 
    'Scale (50k)', 
    24900, 
    '{"seed_daily": 500, "rescan_daily": 300, "optimize_daily": 500, "tiktok_export_daily": 500, "push_daily": 250, "api_requests_min": 600}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET 
    features = EXCLUDED.features,
    price_monthly_cents = EXCLUDED.price_monthly_cents;
