import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Plan price lookup (cents → dollars for MRR calculation)
const PLAN_PRICES: Record<string, number> = {
    free: 0,
    pro: 49,
    elite: 99,
    enterprise: 299,
    // Legacy names
    starter: 29,
    growth: 49,
    scale: 99,
};

function getPlanPrice(plan: string, storedPrice?: number): number {
    if (storedPrice && storedPrice > 0) return storedPrice;
    return PLAN_PRICES[plan?.toLowerCase()] ?? 0;
}

export async function GET(req: Request) {
    try {
        // Admin check: must be authenticated
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') ?? '30d';

        // Calculate date cutoff
        const now = new Date();
        const cutoff = new Date(now);
        if (range === 'today') { cutoff.setHours(0, 0, 0, 0); }
        else if (range === '7d') { cutoff.setDate(now.getDate() - 7); }
        else { cutoff.setDate(now.getDate() - 30); }        // default 30d
        const cutoffISO = cutoff.toISOString();

        // Use service role for cross-user reads
        const admin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ── Parallel queries ──────────────────────────────────────────────
        const [
            { count: totalUsers },
            { data: activeUserRows },
            { data: subscriptions },
            { data: eventCounts },
        ] = await Promise.all([
            // Total registered users (all time)
            admin.from('profiles').select('id', { count: 'exact', head: true }),

            // Distinct users who fired any event in the time range
            admin
                .from('analytics_events')
                .select('user_id')
                .gte('created_at', cutoffISO),

            // All subscriptions for MRR + churn + plan distribution
            admin
                .from('subscriptions')
                .select('user_id, plan, status, price, started_at, ended_at'),

            // Event counts per event name in range
            admin
                .from('analytics_events')
                .select('event')
                .gte('created_at', cutoffISO),
        ]);

        // ── Active users: unique user_ids in event window ─────────────────
        const activeUserSet = new Set((activeUserRows ?? []).map((r) => r.user_id));
        const activeUsers = activeUserSet.size;

        // ── Subscriptions analysis ────────────────────────────────────────
        const subs = subscriptions ?? [];
        const activeSubs = subs.filter((s) => s.status === 'active' || s.status === 'trialing');
        const canceledSubs = subs.filter((s) => s.status === 'canceled');

        // MRR: sum of price of all active subscriptions
        const mrr = activeSubs.reduce((acc, s) => acc + getPlanPrice(s.plan, s.price), 0);

        // Churn rate: canceled / total subscriptions (if any)
        const churnRate = subs.length > 0 ? Math.round((canceledSubs.length / subs.length) * 100) : 0;

        // Plan distribution
        const planDist: Record<string, number> = {};
        for (const s of subs) {
            const p = s.plan?.toLowerCase() ?? 'free';
            planDist[p] = (planDist[p] ?? 0) + 1;
        }

        // ── Event counts ──────────────────────────────────────────────────
        const events = eventCounts ?? [];
        const eventMap: Record<string, number> = {};
        for (const e of events) {
            eventMap[e.event] = (eventMap[e.event] ?? 0) + 1;
        }

        // Top feature: event with most occurrences
        const topFeature = Object.entries(eventMap).sort((a, b) => b[1] - a[1])[0] ?? ['none', 0];

        return NextResponse.json({
            range,
            cutoff: cutoffISO,
            users: {
                total: totalUsers ?? 0,
                active: activeUsers,
            },
            revenue: {
                mrr,
                activeSubscriptions: activeSubs.length,
                canceledSubscriptions: canceledSubs.length,
                churnRate,
            },
            planDistribution: planDist,
            usage: {
                eventMap,
                topFeature: topFeature[0],
                topFeatureCount: topFeature[1],
                searches: eventMap['search_performed'] ?? 0,
                productsAdded: (eventMap['product_added'] ?? 0) + (eventMap['product_imported'] ?? 0),
                storesCreated: eventMap['store_created'] ?? 0,
                aiOptimizations: eventMap['ai_optimize_used'] ?? 0,
                tiktokExports: eventMap['tiktok_export_used'] ?? 0,
            },
        });

    } catch (e: any) {
        console.error('[ANALYTICS/METRICS]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
