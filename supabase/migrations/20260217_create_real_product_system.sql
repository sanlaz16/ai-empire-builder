-- Create Product Index Table
CREATE TABLE IF NOT EXISTS product_index (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    source text NOT NULL DEFAULT 'manual', -- enum-like: 'manual', 'aliexpress', 'cj', 'dsers'
    source_product_id text,
    title text NOT NULL,
    description text,
    images jsonb DEFAULT '[]'::jsonb,
    url text, -- valid URL check can be added
    price_cost numeric,
    shipping_cost numeric DEFAULT 0,
    price_suggested numeric,
    profit numeric GENERATED ALWAYS AS (price_suggested - price_cost - shipping_cost) STORED,
    margin numeric GENERATED ALWAYS AS (
        CASE WHEN price_suggested > 0 THEN ((price_suggested - price_cost - shipping_cost) / price_suggested) * 100 ELSE 0 END
    ) STORED,
    currency text DEFAULT 'USD',
    country text DEFAULT 'US',
    category text, -- niche
    niche_tags text[], -- Array of text
    vendor text,
    rating numeric DEFAULT 0,
    reviews_count int DEFAULT 0,
    monthly_sales_est int DEFAULT 0,
    trend_score numeric DEFAULT 0, -- 0-100
    inventory_status text DEFAULT 'in_stock', -- 'in_stock', 'out_of_stock'
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_product_index_category ON product_index(category);
CREATE INDEX IF NOT EXISTS idx_product_index_price_cost ON product_index(price_cost);
CREATE INDEX IF NOT EXISTS idx_product_index_rating ON product_index(rating);
CREATE INDEX IF NOT EXISTS idx_product_index_trend_score ON product_index(trend_score);
CREATE INDEX IF NOT EXISTS idx_product_index_monthly_sales ON product_index(monthly_sales_est);
CREATE INDEX IF NOT EXISTS idx_product_index_niche_tags ON product_index USING GIN(niche_tags);

-- RLS for Product Index
ALTER TABLE product_index ENABLE ROW LEVEL SECURITY;

-- Everyone can read stats (Public Catalog)
CREATE POLICY "Public read access" ON product_index FOR SELECT USING (true);

-- Only authenticated admins/importers can insert/update (For now, allow authenticated)
CREATE POLICY "Authenticated insert access" ON product_index FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update access" ON product_index FOR UPDATE TO authenticated USING (true);


-- Create Store Table
CREATE TABLE IF NOT EXISTS store (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    niche text,
    created_at timestamptz DEFAULT now()
);

-- RLS for Store
ALTER TABLE store ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own store
CREATE POLICY "Users can view own store" ON store FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can insert own store" ON store FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Users can update own store" ON store FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can delete own store" ON store FOR DELETE TO authenticated USING (auth.uid() = owner_user_id);


-- Create Store Product Table (Link between Store and Product Index)
CREATE TABLE IF NOT EXISTS store_product (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id uuid REFERENCES store(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES product_index(id) ON DELETE CASCADE NOT NULL,
    status text DEFAULT 'draft', -- 'draft', 'active', 'paused'
    override_price numeric, -- User can set their own price
    created_at timestamptz DEFAULT now(),
    
    UNIQUE(store_id, product_id) -- Prevent duplicate adds
);

-- RLS for Store Product
ALTER TABLE store_product ENABLE ROW LEVEL SECURITY;

-- Users can manage products in their own store
-- (Requires a join or subquery check against store table)
CREATE POLICY "Users can view own store products" ON store_product FOR SELECT TO authenticated 
USING (
    EXISTS (SELECT 1 FROM store WHERE store.id = store_product.store_id AND store.owner_user_id = auth.uid())
);

CREATE POLICY "Users can insert own store products" ON store_product FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (SELECT 1 FROM store WHERE store.id = store_product.store_id AND store.owner_user_id = auth.uid())
);

CREATE POLICY "Users can update own store products" ON store_product FOR UPDATE TO authenticated 
USING (
    EXISTS (SELECT 1 FROM store WHERE store.id = store_product.store_id AND store.owner_user_id = auth.uid())
);

CREATE POLICY "Users can delete own store products" ON store_product FOR DELETE TO authenticated 
USING (
    EXISTS (SELECT 1 FROM store WHERE store.id = store_product.store_id AND store.owner_user_id = auth.uid())
);


-- Create Product Events Table (Analytics)
CREATE TABLE IF NOT EXISTS product_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES product_index(id) ON DELETE CASCADE NOT NULL,
    event_type text NOT NULL, -- 'view', 'add_to_store', 'click'
    payload jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- RLS for Product Events
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert events
CREATE POLICY "Users can insert events" ON product_events FOR INSERT TO authenticated WITH CHECK (true);
-- Only admins can read events (or aggregated views) - simplified here
CREATE POLICY "Admins can view events" ON product_events FOR SELECT TO service_role USING (true);
