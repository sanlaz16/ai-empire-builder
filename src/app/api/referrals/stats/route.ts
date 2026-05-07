import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/referrals/stats
 * Returns the current user's referral code and metrics.
 */
export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Load profile (referral_code + stats)
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('referral_code, referral_count')
            .eq('id', user.id)
            .single();

        if (profileErr) throw profileErr;

        // If no referral code yet, generate one server-side
        let code = profile?.referral_code;
        if (!code) {
            code = `EMPIRE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id);
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

        // Calculate credits based on referral count if needed, or just return basic stats
        // E.g., every 5 referrals = some credit, or just UI handling it.

        return NextResponse.json({
            code,
            shareUrl: `${siteUrl}/signup?ref=${code}`,
            conversions: profile?.referral_count ?? 0,
            clicks: 0, // Simplified out
            earnings: 0, // Simplified out
        });

    } catch (e: any) {
        console.error('[REFERRALS/STATS]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
