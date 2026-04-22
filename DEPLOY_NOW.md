# 🚀 DEPLOY NOW

Follow these exact steps to deploy your project to Vercel.

## 1. Open Terminal in the Correct Folder
Ensure your terminal is opened in the **REAL PROJECT ROOT**:
`c:\Users\sanla\Desktop\EmpireBuilder_Backup`

## 2. Run Deployment Commands

### First Time Setup / Link
Run this command to link the project and do a preview deploy:
```bash
npx vercel
```

### Production Deploy
Run this command to deploy to production:
```bash
npx vercel --prod
```

## 3. Recommended Prompts for `npx vercel`
When prompted by the Vercel CLI, use these answers for a guaranteed success:

- **Set up and deploy?** `Yes`
- **Which scope?** `[Your Personal Account]`
- **Link to existing project?** `No`
- **Project name?** `empire-builder` (or your preferred name)
- **In which directory is your code located?** `./`

## 4. Environment Variables
Remember to add your environment variables in the Vercel Dashboard if you haven't already:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- (and others from your `.env.local`)

---
**Status:** ✅ Project verified. Local build passes. Ready for Vercel.
