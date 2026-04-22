import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackServerEvent } from '@/lib/analytics/track';

/**
 * POST /api/analytics/event
 * Client-side fire-and-forget endpoint.
 * Reads user from session cookie, then inserts to analytics_events.
 */
export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { event, metadata = {} } = await req.json();
        if (!event || typeof event !== 'string') {
            return NextResponse.json({ error: 'event is required' }, { status: 400 });
        }

        await trackServerEvent(user.id, event, metadata);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
