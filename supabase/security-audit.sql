-- ═══════════════════════════════════════════════════════════════════
-- EmpireBuilder Security Audit Queries
-- Run in Supabase SQL Editor to verify production security posture
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Verify RLS is enabled on all critical tables ───────────────
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'shopify_connections',
        'scanned_products',
        'user_profiles',
        'subscriptions'
    )
ORDER BY tablename;
-- ✅ All rows must show rls_enabled = true

-- ─── 2. List all RLS policies ──────────────────────────────────────
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- ✅ Every table should have SELECT/INSERT/UPDATE policies

-- ─── 3. Verify no table has open public access ─────────────────────
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
    AND grantee = 'public'
    AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE');
-- ✅ Should return 0 rows (no public grants)

-- ─── 4. Check cross-user data leakage (should return 0 if RLS works) ─
-- Replace 'USER_A_UUID' with a real user ID for testing
-- SELECT count(*) FROM scanned_products WHERE user_id != 'USER_A_UUID';
-- Run as that user — should return 0

-- ─── 5. Verify indexes exist ───────────────────────────────────────
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('scanned_products', 'subscriptions', 'user_profiles', 'shopify_connections')
ORDER BY tablename, indexname;
-- ✅ Should show indexes on user_id, shopify_product_id, etc.
