-- Step 1: Ensure profiles table has 'plan' column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Keep 'plan' in sync with 'plan_id' if billing logic uses plan_id
-- We already have a sync trigger from subscriptions to profiles.
-- Let's update the sync function to also populate 'plan'.

CREATE OR REPLACE FUNCTION sync_profile_subscription()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles SET
        plan_id = NEW.plan_id,
        plan = NEW.plan_id, -- Sync 'plan' column with 'plan_id'
        subscription_status = NEW.status,
        billing_provider = NEW.provider,
        subscription_period_end = NEW.current_period_end
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Backfill 'plan' from 'plan_id' if it exists
UPDATE public.profiles SET plan = COALESCE(plan_id, 'free') WHERE plan IS NULL OR plan = 'free';
