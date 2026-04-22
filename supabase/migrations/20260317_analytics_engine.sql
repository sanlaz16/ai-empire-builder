-- Nuclear Analytics Engine
-- analytics_events: lightweight event log for all user actions

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own events
CREATE POLICY "Users can read own events"
    ON public.analytics_events FOR SELECT
    USING (auth.uid() = user_id);

-- Service role has full access (for admin analytics)
CREATE POLICY "Service role full access to events"
    ON public.analytics_events FOR ALL
    USING (true);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON public.analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_created ON public.analytics_events(event, created_at DESC);

-- Patch subscriptions table: add price + provider if missing
ALTER TABLE public.subscriptions
    ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe',
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Ensure plan column uses our standard names
-- (existing rows won't break; this maps them on read in app logic)
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
