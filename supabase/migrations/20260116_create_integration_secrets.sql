-- Create integration_secrets table for storing encrypted provider credentials
CREATE TABLE IF NOT EXISTS integration_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('aliexpress', 'cj', 'amazon')),
  secrets jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable Row Level Security
ALTER TABLE integration_secrets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view only their own integration secrets
CREATE POLICY "Users can view own integration secrets"
  ON integration_secrets
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own integration secrets
CREATE POLICY "Users can insert own integration secrets"
  ON integration_secrets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own integration secrets
CREATE POLICY "Users can update own integration secrets"
  ON integration_secrets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own integration secrets
CREATE POLICY "Users can delete own integration secrets"
  ON integration_secrets
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_integration_secrets_user_provider 
  ON integration_secrets(user_id, provider);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_integration_secrets_updated_at
  BEFORE UPDATE ON integration_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
