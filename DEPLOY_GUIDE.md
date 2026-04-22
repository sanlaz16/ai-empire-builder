# Quick Deploy Guide

## Deploy to Vercel (2 minutes)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
cd c:\Users\sanla\Desktop\EmpireBuilder_Backup
vercel
```

3. **Follow prompts:**
   - Login with email or GitHub
   - Confirm project settings (just press Enter for defaults)
   - Wait ~1 minute for build

4. **Get your URL:**
   - Vercel will give you a URL like: `https://empire-builder-xyz.vercel.app`
   - Share this with your sister!

## How Your Sister Can Access:

1. Open the URL you send
2. Click **"Sign In"**
3. Click **"🛠️ Dev Login (Bypass)"** button
4. She's in the dashboard! No password needed.

## Features She Can See:
- ✅ Product Finder (search for products)
- ✅ Store Blueprint
- ✅ Integrations page
- ✅ All dashboard features

## Note:
- Dev Login bypasses authentication completely
- No Supabase configuration needed
- Perfect for demos and sharing!

## Alternative: Use ngrok (Instant)

If you want to share immediately without deploying:

```bash
# Install ngrok
npm i -g ngrok

# Create tunnel (while dev server is running)
ngrok http 3000
```

This gives you a URL like: `https://abc123.ngrok.io`
- Works instantly
- No deployment needed
- Temporary (good for today only)
