-- Create shopify_connections table
CREATE TABLE IF NOT EXISTS public.shopify_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_domain TEXT NOT NULL,
    access_token TEXT NOT NULL,
    scope TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_shop UNIQUE(user_id, shop_domain)
);

-- Enable RLS
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only see their own shopify connections"
    ON public.shopify_connections
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own shopify connections"
    ON public.shopify_connections
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own shopify connections"
    ON public.shopify_connections
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own shopify connections"
    ON public.shopify_connections
    FOR DELETE
    USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopify_connections_updated_at
    BEFORE UPDATE ON public.shopify_connections
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
