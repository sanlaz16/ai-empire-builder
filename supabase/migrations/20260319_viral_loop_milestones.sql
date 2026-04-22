-- Viral Loop Milestones Tracking
CREATE TABLE IF NOT EXISTS referral_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    milestone INT NOT NULL, -- 5 or 10
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup of recent milestones
CREATE INDEX IF NOT EXISTS idx_referral_milestones_user_time 
ON referral_milestones(user_id, milestone, granted_at);
