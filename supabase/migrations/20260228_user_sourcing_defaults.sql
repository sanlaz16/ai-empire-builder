-- ==========================================
-- Migration: User Sourcing & Profit Defaults
-- ==========================================

-- Add default sourcing and profit calculation variables to the profiles table
-- so that when products are imported from Shopify without native cost metrics,
-- the system can reliably calculate estimated margins.

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS default_cost_percentage numeric(5,2) DEFAULT 40.0,
  ADD COLUMN IF NOT EXISTS default_shipping_cost numeric(10,2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS default_processing_days integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS fee_percentage numeric(5,2) DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS fee_fixed numeric(10,2) DEFAULT 0.30;

-- Optional: Add a comment to columns
COMMENT ON COLUMN public.profiles.default_cost_percentage IS 'Percentage of sale price to estimate as base product cost (e.g., 40.0 for 40%)';
COMMENT ON COLUMN public.profiles.default_shipping_cost IS 'Fixed amount added to estimated cost for shipping';
COMMENT ON COLUMN public.profiles.fee_percentage IS 'Payment gateway fee percentage (e.g., 3.0 for Stripe/Pagar.me)';
COMMENT ON COLUMN public.profiles.fee_fixed IS 'Fixed transaction fee per order (e.g., 0.30)';
