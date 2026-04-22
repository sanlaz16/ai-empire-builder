import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

/**
 * POST /api/referrals/track-click
 * Called server-side when a /?ref=CODE URL is visited.
 * Increments the click counter on the referrer's profile.
 */
export async function POST(req: Request) {
    try {
        const { code } = await req.json();
        if (!code || typeof code !== 'string') {
            return NextResponse.json({ error: 'code required' }, { status: 400 });
        }

        const admin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Increment click — uses the DB function we created in migration
        await admin.rpc('increment_referral_click', { p_code: code });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
