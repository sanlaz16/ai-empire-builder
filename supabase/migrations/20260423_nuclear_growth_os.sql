-- ==========================================
-- Nuclear Beta Growth OS Migration
-- ==========================================

-- 1. Add role to profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Waitlist Entries
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    full_name TEXT,
    interested_plan TEXT,
    source TEXT,
    campaign TEXT,
    medium TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    marketing_opt_in BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Funnel Events
CREATE TABLE IF NOT EXISTS public.funnel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    step_name TEXT,
    page_url TEXT NOT NULL,
    source TEXT,
    campaign TEXT,
    medium TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Checkout Recovery
CREATE TABLE IF NOT EXISTS public.checkout_recovery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    plan_selected TEXT,
    displayed_price NUMERIC,
    checkout_step TEXT,
    source TEXT,
    campaign TEXT,
    medium TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    abandoned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recovered BOOLEAN DEFAULT FALSE,
    recovery_stage TEXT,
    last_email_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Objection Feedback
CREATE TABLE IF NOT EXISTS public.objection_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,
    reason_type TEXT NOT NULL,
    reason_text TEXT,
    missing_feature TEXT,
    would_signup_if_built BOOLEAN,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Live Sessions
CREATE TABLE IF NOT EXISTS public.live_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL UNIQUE,
    current_page TEXT NOT NULL,
    source TEXT,
    campaign TEXT,
    medium TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_recovery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objection_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Anonymous Inserts (Public can track data)
CREATE POLICY "Public can insert waitlist" ON public.waitlist_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert funnel events" ON public.funnel_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert checkout recovery" ON public.checkout_recovery FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert feedback" ON public.objection_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert sessions" ON public.live_sessions FOR INSERT WITH CHECK (true);

-- Session Owner can update their live session
CREATE POLICY "Users can update their own session" ON public.live_sessions 
FOR UPDATE USING (true) WITH CHECK (true);

-- Admin Access (Read All)
-- We use a function to check if the user is an admin to avoid circular references in policies
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admin can read waitlist" ON public.waitlist_entries FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can read funnel events" ON public.funnel_events FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can read checkout recovery" ON public.checkout_recovery FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can read feedback" ON public.objection_feedback FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin can read sessions" ON public.live_sessions FOR SELECT USING (public.is_admin());

-- Also allow service_role for everything (internal tools)
CREATE POLICY "Service role full access waitlist" ON public.waitlist_entries FOR ALL USING (true);
CREATE POLICY "Service role full access funnel" ON public.funnel_events FOR ALL USING (true);
CREATE POLICY "Service role full access recovery" ON public.checkout_recovery FOR ALL USING (true);
CREATE POLICY "Service role full access feedback" ON public.objection_feedback FOR ALL USING (true);
CREATE POLICY "Service role full access sessions" ON public.live_sessions FOR ALL USING (true);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_funnel_session ON public.funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_event ON public.funnel_events(event_name);
CREATE INDEX IF NOT EXISTS idx_live_last_seen ON public.live_sessions(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist_entries(email);
