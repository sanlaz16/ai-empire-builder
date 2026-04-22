import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import { getCached, setCached, invalidateCache, redis } from '@/lib/utils/productCache';

// -------------------------------------------------------------------------------- //
// CONSTANTS
// -------------------------------------------------------------------------------- //

export type ActionKey = 'seed' | 'rescan' | 'optimize' | 'tiktok_export' | 'push_to_store' | 'api_requests';

// Default Fallback Quotas if the plan cannot be read (Matches Free Plan)
const FALLBACK_QUOTAS: Record<ActionKey, number> = {
    seed: 10,
    rescan: 5,
    optimize: 5,
    tiktok_export: 5,
    push_to_store: 3,
    api_requests: 30
};

// -------------------------------------------------------------------------------- //
// CORE GUARD LOGIC
// -------------------------------------------------------------------------------- //

/**
 * Validates if the user has enough quota for the specified action.
 * Daily limits are strictly enforced. Assumes 1 usage per call unless specified.
 */
export async function assertQuota(userId: string, action: ActionKey, incrementAmount: number = 1): Promise<void> {
    const supabaseService = createServiceClient();

    // 1. Get the User's Plan via Profile
    const { data: profile } = await supabaseService
        .from('profiles')
        .select('plan_id')
        .eq('id', userId)
        .single();

    const planId = profile?.plan_id || 'free';

    // 2. Load Plan Capabilities using the Service Role
    const { data: plan } = await supabaseService
        .from('plans')
        .select('features')
        .eq('id', planId)
        .single();

    const limit = plan?.features ? (plan.features[`${action}_daily`] || FALLBACK_QUOTAS[action]) : FALLBACK_QUOTAS[action];

    // 3. Check Today's Usage
    // We use UTC start of day for consistency
    const now = new Date();
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

    let { data: usageRecord } = await supabaseService
        .from('usage_counters')
        .select('count')
        .eq('user_id', userId)
        .eq('period', 'daily')
        .eq('key', action)
        .eq('window_start', windowStart)
        .maybeSingle();

    const currentUsage = usageRecord?.count || 0;

    // 4. Evaluate Limit
    if (currentUsage + incrementAmount > limit) {
        throw new Error(`Quota Exceeded: You have reached your daily limit for ${action}. Upgrade your plan in Settings.`);
    }
}

/**
 * Bumps the usage counter for a specific action.
 * Should be called *after* an action successfully executes.
 */
export async function bumpUsage(userId: string, action: ActionKey, incrementAmount: number = 1): Promise<void> {
    const supabaseService = createServiceClient();
    const now = new Date();
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

    // Use Postgres upsert to safely increment the counter atomically via RPC or direct insert
    const { error } = await supabaseService.rpc('increment_usage_counter', {
        p_user_id: userId,
        p_period: 'daily',
        p_key: action,
        p_window_start: windowStart,
        p_amount: incrementAmount
    });

    if (error) {
        // If RPC fails (not yet created), fallback to UPSERT logic
        const { data: usageRecord } = await supabaseService
            .from('usage_counters')
            .select('id, count')
            .eq('user_id', userId)
            .eq('period', 'daily')
            .eq('key', action)
            .eq('window_start', windowStart)
            .maybeSingle();

        if (usageRecord) {
            await supabaseService
                .from('usage_counters')
                .update({ count: usageRecord.count + incrementAmount })
                .eq('id', usageRecord.id);
        } else {
            await supabaseService
                .from('usage_counters')
                .insert([{
                    user_id: userId,
                    period: 'daily',
                    key: action,
                    window_start: windowStart,
                    count: incrementAmount
                }]);
        }
    }
}

/**
 * Asserts hard API rate limits specifically bound by the user's plan.
 * Used for /api/shopify/push-to-store, etc. Uses Redis.
 */
export async function assertRateLimit(userId: string): Promise<void> {
    if (!redis) return; // Degrade gracefully if Redis isn't configured in Dev

    const supabaseService = createServiceClient();
    const { data: profile } = await supabaseService
        .from('profiles')
        .select('plan_id')
        .eq('id', userId)
        .single();

    const planId = profile?.plan_id || 'free';

    // Cache the max limits to spare DB lookups on high RPM endpoints? Or fetch fast:
    const { data: plan } = await supabaseService
        .from('plans')
        .select('features')
        .eq('id', planId)
        .single();

    const maxRequestsPerMin = plan?.features ? (plan.features['api_requests_min'] || FALLBACK_QUOTAS.api_requests) : FALLBACK_QUOTAS.api_requests;

    const key = `ratelimit:plan_requests:${userId}`;
    const now = Date.now();
    const windowOneMinuteAgo = now - 60000;

    // Standard Redis Sliding Window
    const multi = redis.pipeline();
    multi.zremrangebyscore(key, 0, windowOneMinuteAgo);
    multi.zcard(key);
    multi.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    multi.expire(key, 60);

    const results = await multi.exec();
    const requestCount = results[1] as number;

    if (requestCount >= maxRequestsPerMin) {
        throw new Error(`Rate Limit Exceeded: You are making too many requests. Your plan limits you to ${maxRequestsPerMin} requests per minute.`);
    }
}
