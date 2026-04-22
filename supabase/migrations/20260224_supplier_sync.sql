-- Nuclear 22: Supplier Sync Database Updates

-- 1. Create supplier_connections table
CREATE TABLE IF NOT EXISTS public.supplier_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier TEXT NOT NULL, -- 'dsers', 'cj', 'temu'
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, supplier)
);

-- 2. Add supplier meta columns to scanned_products
ALTER TABLE public.scanned_products 
ADD COLUMN IF NOT EXISTS supplier_product_id TEXT,
ADD COLUMN IF NOT EXISTS supplier_url TEXT,
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS supplier_compare_at DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS supplier_stock INTEGER,
ADD COLUMN IF NOT EXISTS supplier_rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS supplier_orders INTEGER;

-- Enable RLS
ALTER TABLE public.supplier_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own supplier connections"
    ON public.supplier_connections FOR ALL
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scanned_products_supplier_id ON public.scanned_products(supplier_product_id);
