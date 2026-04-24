import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerLocation } from '@/lib/analytics/serverLocation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics/event
 * Unified endpoint for Funnel Events and Live Sessions.
 */
export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const {
            eventName,
            sessionId,
            pageUrl,
            deviceType,
            browser,
            source,
            medium,
            campaign,
            metadata = {}
        } = payload;

        if (!eventName || !sessionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use service role to bypass RLS for inserts if needed, 
        // though our policy allows public insert.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get user if logged in
        const { data: { user } } = await supabaseAdmin.auth.getUser(
            req.headers.get('Authorization')?.split(' ')[1] || ''
        );

        // Get location info
        const location = getServerLocation();

        // 1. Insert into funnel_events
        const { error: eventError } = await supabaseAdmin
            .from('funnel_events')
            .insert({
                user_id: user?.id || null,
                session_id: sessionId,
                event_name: eventName,
                page_url: pageUrl,
                source,
                medium,
                campaign,
                device_type: deviceType,
                browser,
                country: location.country,
                region: location.region,
                city: location.city,
                metadata
            });

        if (eventError) console.error('Event Insert Error:', eventError);

        // 2. Upsert live_sessions
        await supabaseAdmin
            .from('live_sessions')
            .upsert({
                session_id: sessionId,
                user_id: user?.id || null,
                current_page: pageUrl,
                source,
                medium,
                campaign,
                device_type: deviceType,
                browser,
                country: location.country,
                region: location.region,
                city: location.city,
                last_seen_at: new Date().toISOString()
            }, { onConflict: 'session_id' });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error('Analytics Route Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
