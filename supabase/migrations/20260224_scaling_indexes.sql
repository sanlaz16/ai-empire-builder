-- Nuclear 25: Scaling Indexes for 250k Users
-- Target: Performance-critical columns for filtering, sorting, and relations

-- 1. Scanned Products (Core discovery table)
CREATE INDEX IF NOT EXISTS idx_scanned_products_user_id ON public.scanned_products(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_product_id ON public.scanned_products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_created_at ON public.scanned_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanned_products_updated_at ON public.scanned_products(updated_at DESC);

-- 2. AI Product Scores (Join table for ranking)
CREATE INDEX IF NOT EXISTS idx_ai_product_scores_user_id ON public.ai_product_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_product_scores_product_id ON public.ai_product_scores(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_product_scores_overall ON public.ai_product_scores(overall_score DESC);

-- 3. AI Creatives (Marketing content)
CREATE INDEX IF NOT EXISTS idx_ai_creatives_user_id ON public.ai_creatives(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_creatives_product_id ON public.ai_creatives(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_creatives_type ON public.ai_creatives(type);

-- 4. Supplier Connections
CREATE INDEX IF NOT EXISTS idx_supplier_connections_user_id ON public.supplier_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_connections_supplier ON public.supplier_connections(supplier_name);

-- 5. Subscriptions (Auth gate performance)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
