-- Add push notification preferences
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT true;

-- Notice: OneSignal handles device/player IDs automatically, 
-- but we could also store the onesignal_player_id if needed.
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onesignal_id TEXT;
