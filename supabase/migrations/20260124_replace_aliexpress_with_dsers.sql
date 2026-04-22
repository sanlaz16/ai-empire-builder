-- Migration: Replace AliExpress with DSers
-- This migration updates the integration_secrets table constraint to use 'dsers' instead of 'aliexpress'

-- Step 1: Drop the old constraint
ALTER TABLE integration_secrets 
DROP CONSTRAINT IF EXISTS integration_secrets_provider_check;

-- Step 2: Add new constraint with 'dsers'
ALTER TABLE integration_secrets 
ADD CONSTRAINT integration_secrets_provider_check 
CHECK (provider IN ('dsers', 'cj', 'amazon'));

-- Step 3: Update any existing 'aliexpress' records to 'dsers' (if any exist)
UPDATE integration_secrets 
SET provider = 'dsers' 
WHERE provider = 'aliexpress';

-- Note: This migration is safe to run multiple times (idempotent)
-- If the constraint doesn't exist, the DROP will be ignored
-- If no 'aliexpress' records exist, the UPDATE will affect 0 rows
