import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/referrals/stats
 * Returns the current user's referral code, click count,
 * conversion count, active referrals, and reward credits.
 */
export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Load profile (referral_code + stats)
        const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('referral_code, referral_clicks, referral_conversions, reward_credits, full_name')
            .eq('id', user.id)
            .single();

        if (profileErr) throw profileErr;

        // If no referral code yet, generate one server-side
        let code = profile?.referral_code;
        if (!code) {
            code = `EMPIRE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id);
        }

        // Referral breakdown by status
        const { data: referrals } = await supabase
            .from('referrals')
            .select('id, status, referred_user_id, created_at, activated_at, rewarded_at')
            .eq('referrer_user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        const statusCount = { pending: 0, active: 0, rewarded: 0 };
        for (const r of (referrals ?? [])) {
            statusCount[r.status as keyof typeof statusCount]++;
        }

        // Latest rewards earned
        const { data: rewards } = await supabase
            .from('referral_rewards')
            .select('type, value, description, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

        return NextResponse.json({
            code,
            shareUrl: `${siteUrl}/?ref=${code}`,
            clicks: profile?.referral_clicks ?? 0,
            conversions: profile?.referral_conversions ?? 0,
            credits: profile?.reward_credits ?? 0,
            referrals: referrals ?? [],
            referralsByStatus: statusCount,
            rewards: rewards ?? [],
        });

    } catch (e: any) {
        console.error('[REFERRALS/STATS]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
