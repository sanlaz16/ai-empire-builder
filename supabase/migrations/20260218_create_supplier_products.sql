-- Create Supplier Products Table (Staging for CSV Imports)
CREATE TABLE IF NOT EXISTS supplier_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    title text NOT NULL,
    image_url text,
    description text,
    
    source_price numeric NOT NULL,
    shipping_cost numeric DEFAULT 0,
    currency text DEFAULT 'USD',
    
    supplier_url text,
    supplier_name text DEFAULT 'Unknown', -- e.g. 'AliExpress', 'DSers'
    
    status text DEFAULT 'active', -- active, imported, archived
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_supplier_products_user ON supplier_products(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_title ON supplier_products USING gin(to_tsvector('english', title));

-- RLS
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own supplier products"
ON supplier_products
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
