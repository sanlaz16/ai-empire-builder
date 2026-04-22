-- NUCLEAR 33: Enhance scanned_products for Supplier Tracking
-- Add supplier_product_id for idempotency
-- Ensure status allows 'imported'
ALTER TABLE public.scanned_products 
    ADD COLUMN IF NOT EXISTS supplier_product_id TEXT,
    ADD COLUMN IF NOT EXISTS cost NUMERIC(10, 2);

-- Add unique constraint for idempotency: user + supplier + supplier_product_id
-- This prevents a user from importing the same DSers/CJ product twice as different Shopify products
CREATE UNIQUE INDEX IF NOT EXISTS idx_scanned_products_supplier_id 
    ON public.scanned_products (user_id, supplier_source, supplier_product_id) 
    WHERE supplier_product_id IS NOT NULL;

-- Update status constraint if any (existing schema just had DEFAULT 'active')
-- No hard check constraint on status was found in previous migration, so we're good.
