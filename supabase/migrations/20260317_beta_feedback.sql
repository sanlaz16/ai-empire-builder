-- Nuclear Beta: Feedback & Issue Tracking System
-- Creates beta_feedback table with RLS

CREATE TABLE IF NOT EXISTS public.beta_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'improvement', 'complaint')),
    message TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    page TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'wont_fix')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert feedback"
    ON public.beta_feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can read their own feedback
CREATE POLICY "Users can read own feedback"
    ON public.beta_feedback FOR SELECT
    USING (auth.uid() = user_id);

-- Service role has full access (for admin dashboard + webhooks)
CREATE POLICY "Service role full access"
    ON public.beta_feedback FOR ALL
    USING (true);

-- Auto-set priority based on rating and type
CREATE OR REPLACE FUNCTION set_feedback_priority()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'bug' OR (NEW.rating IS NOT NULL AND NEW.rating <= 2) THEN
        NEW.priority = 'high';
    ELSIF NEW.rating IS NOT NULL AND NEW.rating >= 5 THEN
        NEW.priority = 'low';
    ELSE
        NEW.priority = 'normal';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_set_feedback_priority
    BEFORE INSERT ON public.beta_feedback
    FOR EACH ROW EXECUTE FUNCTION set_feedback_priority();

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER update_beta_feedback_updated_at
    BEFORE UPDATE ON public.beta_feedback
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON public.beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON public.beta_feedback(type);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_priority ON public.beta_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON public.beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON public.beta_feedback(created_at DESC);
