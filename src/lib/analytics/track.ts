/**
 * Analytics Event Tracker
 * Server-side: uses service role for reliable inserts (not dependent on user session cookie)
 * Client-side: fire-and-forget fetch to /api/analytics/event
 */

export type AnalyticsEventName =
    | 'user_signup'
    | 'user_login'
    | 'store_created'
    | 'product_added'
    | 'product_imported'
    | 'search_performed'
    | 'checkout_started'
    | 'subscription_started'
    | 'subscription_canceled'
    | 'shopify_connected'
    | 'ai_optimize_used'
    | 'tiktok_export_used'
    | 'feedback_submitted';

export type EventMetadata = Record<string, string | number | boolean | null | undefined>;

/**
 * Server-side event tracking (use inside API routes / server components).
 * Uses service role key — never call from the browser.
 */
export async function trackServerEvent(
    userId: string | null,
    event: AnalyticsEventName | string,
    metadata: EventMetadata = {}
): Promise<void> {
    try {
        // Lazy-import to keep this server-only
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabaseAdmin.from('analytics_events').insert({
            user_id: userId ?? null,
            event,
            metadata,
        });
    } catch (e) {
        // Analytics should never crash the main flow
        if (process.env.NODE_ENV === 'development') {
            console.warn('[ANALYTICS] Failed to track event:', event, e);
        }
    }
}

/**
 * Client-side event tracking (use inside React components / client code).
 * Fire-and-forget — won't block the UI.
 */
export function trackEvent(
    event: AnalyticsEventName | string,
    metadata: EventMetadata = {}
): void {
    // Best-effort: do not await, do not crash
    fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, metadata }),
    }).catch(() => { /* silent */ });
}
