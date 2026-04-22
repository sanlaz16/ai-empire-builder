-- Nuclear 23: Conversion AI - Storing marketing creatives

CREATE TABLE IF NOT EXISTS public.ai_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL, -- shopify_product_id or scanned_product id
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'hook', 'ad_copy', 'ugc_script', 'tiktok_angle', 'creative_brief'
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI creatives"
    ON public.ai_creatives FOR ALL
    USING (auth.uid() = user_id);

-- Index for fast lookup per product
CREATE INDEX IF NOT EXISTS idx_ai_creatives_product_user ON public.ai_creatives(product_id, user_id);
