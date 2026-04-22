-- AI Product Scores table to store winning product intelligence
CREATE TABLE IF NOT EXISTS public.ai_product_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.scanned_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Scores (0-100)
    trend_score INTEGER DEFAULT 0,
    margin_score INTEGER DEFAULT 0,
    virality_score INTEGER DEFAULT 0,
    competition_score INTEGER DEFAULT 0,
    overall_score INTEGER DEFAULT 0,
    
    -- Insights
    niche TEXT,
    audience TEXT,
    angle TEXT,
    pain_point TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(product_id) -- One score record per product
);

-- Enable RLS
ALTER TABLE public.ai_product_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all AI scores"
    ON public.ai_product_scores FOR SELECT
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_scores_overall ON public.ai_product_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_scores_niche ON public.ai_product_scores(niche);
