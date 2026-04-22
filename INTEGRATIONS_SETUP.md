# Secure Integrations Setup Guide

## Step 1: Run SQL Migration

Execute the SQL migration in your Supabase dashboard:

**File:** `supabase/migrations/20260116_create_integration_secrets.sql`

Or run via Supabase CLI:
```bash
supabase db push
```

## Step 2: Generate Encryption Key

Run this Node.js script to generate a secure encryption key:

```javascript
const crypto = require('crypto');
const key = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + key);
```

Or use this one-liner in your terminal:
```bash
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Add to .env.local

Add the generated key to your `.env.local` file:

```env
# Encryption key for provider credentials (32 bytes = 64 hex chars)
ENCRYPTION_KEY=<paste-your-generated-key-here>

# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Fallback provider credentials (if not in Supabase)
ALIEXPRESS_API_KEY=optional
CJ_EMAIL=optional
CJ_PASSWORD=optional
```

## Step 4: Restart Dev Server

```bash
npm run dev
```

## Step 5: Test the Integration

1. Navigate to `http://localhost:3000/dashboard/providers`
2. Enter AliExpress API key
3. Enter CJ email and password
4. Click "Save Credentials"
5. Click the test button to validate

## Step 6: Verify Product Finder

1. Go to `http://localhost:3000/dashboard/product-finder`
2. Select a niche and search
3. The warning banner should now say "Using mock data" (if no real API keys)
4. Or show real products if you entered valid credentials

## Security Notes

- **Encryption**: AES-256-GCM with unique IV per secret
- **Storage**: Supabase with Row Level Security
- **Access**: Server-only routes, never exposed to client
- **Fallback**: Env vars → Supabase → Mock mode

## Troubleshooting

### "ENCRYPTION_KEY not set" error
- Make sure you added the key to `.env.local`
- Restart the dev server after adding

### "Failed to decrypt" error
- The encryption key may have changed
- Delete old credentials and re-save them

### Credentials not saving
- Check Supabase connection
- Verify RLS policies are enabled
- Check browser console for errors

## API Endpoints

- `GET /api/integrations/status` - Get provider status
- `POST /api/integrations/save` - Save credentials
- `POST /api/integrations/test` - Test credentials
