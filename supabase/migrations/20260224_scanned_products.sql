-- scanned_products: persists all products synced from Shopify for each user
CREATE TABLE IF NOT EXISTS public.scanned_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shopify_product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price NUMERIC(10, 2) DEFAULT 0,
    compare_at_price NUMERIC(10, 2),
    estimated_cost NUMERIC(10, 2),
    profit NUMERIC(10, 2),
    margin_percent NUMERIC(5, 2),
    status TEXT DEFAULT 'active', -- active | draft
    supplier_source TEXT DEFAULT 'Shopify', -- DSers | CJ | Temu | Shopify
    supplier_confidence TEXT DEFAULT 'low', -- high | medium | low
    vendor TEXT,
    tags TEXT,
    product_type TEXT,
    shopify_variant_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, shopify_product_id)
);

-- Enable RLS
ALTER TABLE public.scanned_products ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own scanned products
CREATE POLICY "Users read own products"
    ON public.scanned_products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users insert own products"
    ON public.scanned_products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own products"
    ON public.scanned_products FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users delete own products"
    ON public.scanned_products FOR DELETE
    USING (auth.uid() = user_id);

-- Performance indexes (NUCLEAR 13 DB Indexing)
CREATE INDEX IF NOT EXISTS idx_scanned_products_user_id    ON public.scanned_products(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_shopify_id ON public.scanned_products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_updated_at ON public.scanned_products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanned_products_status     ON public.scanned_products(user_id, status);

-- Auto-update updated_at
CREATE TRIGGER update_scanned_products_updated_at
    BEFORE UPDATE ON public.scanned_products
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Add last_scan_at to shopify_connections for delta scanning
ALTER TABLE public.shopify_connections
    ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMPTZ;
