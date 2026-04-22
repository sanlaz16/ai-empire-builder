-- Create product_ai_content table
CREATE TABLE IF NOT EXISTS public.product_ai_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id BIGINT UNIQUE NOT NULL,
    optimized_title TEXT NOT NULL,
    seo_title TEXT NOT NULL,
    description TEXT NOT NULL,
    bullets JSONB NOT NULL DEFAULT '[]',
    keywords JSONB NOT NULL DEFAULT '[]',
    tiktok_hook TEXT,
    angle TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_ai_content ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write for now (can be tightened later per store)
CREATE POLICY "Allow authenticated users to manage AI content" 
ON public.product_ai_content 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
