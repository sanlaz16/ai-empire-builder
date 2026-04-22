# EmpireBuilder — Vercel Deployment Guide

## 1. Prerequisites

Before deploying, ensure you have:
- [ ] Vercel account at vercel.com
- [ ] Stripe live keys + 3 price IDs created
- [ ] Supabase production project with all migrations run
- [ ] Domain DNS configured (A record → Vercel)

---

## 2. Migrations to Run (in order)

In your **Supabase Dashboard → SQL Editor**, run:

```
supabase/migrations/20260224_scanned_products.sql
supabase/migrations/20260224_user_profiles.sql
supabase/migrations/20260224_subscriptions.sql
```

---

## 3. Vercel Environment Variables

Go to **Vercel → Project → Settings → Environment Variables** and add ALL variables from `.env.production.example`.

Key variables:
| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | After step 5 below |
| `STRIPE_STARTER_PRICE_ID` | Stripe → Products |
| `STRIPE_GROWTH_PRICE_ID` | Stripe → Products |
| `STRIPE_EMPIRE_PRICE_ID` | Stripe → Products |
| `NEXT_PUBLIC_SITE_URL` | `https://empirebuilder.ai` |
| `SHOPIFY_CLIENT_ID` | Shopify Partner Dashboard |
| `SHOPIFY_CLIENT_SECRET` | Shopify Partner Dashboard |

---

## 4. Deploy Command

```bash
# Connect to Vercel
npx vercel --prod

# Or via Git (recommended)
git push origin main
# Vercel auto-deploys on push if connected to GitHub
```

---

## 5. Stripe Webhook Setup

After first deployment:
1. Go to **Stripe → Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://empirebuilder.ai/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 6. Supabase Auth Settings

In Supabase → Auth → URL Configuration:
- **Site URL**: `https://empirebuilder.ai`
- **Redirect URLs**: `https://empirebuilder.ai/**`

---

## 7. Security Audit

Run `supabase/security-audit.sql` in Supabase SQL Editor. All checks should pass before going live.

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| Initial page load | < 2s |
| API responses | < 3s |
| Rescan (50 products) | < 15s |
| Stripe webhook | < 5s |
