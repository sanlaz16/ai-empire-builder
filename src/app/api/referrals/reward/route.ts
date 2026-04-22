import { NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { trackServerEvent } from '@/lib/analytics/track';

const REWARD_PER_REFERRAL = 25; // R$ credit per activated referral

/**
 * POST /api/referrals/reward
 * Called after a referred user activates their subscription.
 * - Marks the referral as 'rewarded'
 * - Issues a credit to the referrer
 * - Checks Viral Loop Milestones (5 referrals = 1 week premium, 10 = 1 month premium)
 */
export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { referralId } = await req.json();
        if (!referralId) return NextResponse.json({ error: 'referralId required' }, { status: 400 });

        const admin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Load referral
        const { data: referral, error: refErr } = await admin
            .from('referrals')
            .select('*')
            .eq('id', referralId)
            .eq('status', 'active') // must be active to reward
            .single();

        if (refErr || !referral) {
            return NextResponse.json({ error: 'Referral not found or not yet active' }, { status: 404 });
        }

        // Mark referral as rewarded
        await admin
            .from('referrals')
            .update({ status: 'rewarded', rewarded_at: new Date().toISOString(), reward_value: REWARD_PER_REFERRAL, reward_type: 'credit' })
            .eq('id', referralId);

        // Add reward credit to referrer's profile
        await admin.rpc('increment_referral_credits', {
            p_user_id: referral.referrer_user_id,
            p_amount: REWARD_PER_REFERRAL
        });

        // Update conversion counter
        const referrerId = referral.referrer_user_id;
        await admin
            .from('profiles')
            .update({ referral_conversions: admin.rpc('coalesce_plus_one', { col: 'referral_conversions', uid: referrerId }) })
            .eq('id', referrerId);

        // Log base reward
        await admin.from('referral_rewards').insert({
            user_id: referrerId,
            referral_id: referralId,
            type: 'credit',
            value: REWARD_PER_REFERRAL,
            description: `Recompensa por indicação ativa — R$ ${REWARD_PER_REFERRAL} crédito`,
            applied: false,
        });

        const { data: profile } = await admin.from('profiles').select('referral_conversions').eq('id', referrerId).single();
        const conversions = (profile?.referral_conversions || 0) + 1;

        // --- VIRAL LOOP MILESTONES PROCESSOR ---
        const checkMilestone = async (milestone: number, daysToAdd: number, description: string) => {
            if (conversions >= milestone) {
                // Check if claimed in last 6 months
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                const { data: recentMilestone } = await admin
                    .from('referral_milestones')
                    .select('id')
                    .eq('user_id', referrerId)
                    .eq('milestone', milestone)
                    .gte('granted_at', sixMonthsAgo.toISOString())
                    .limit(1);

                if (!recentMilestone || recentMilestone.length === 0) {
                    // Grant Milestone
                    await admin.from('referral_milestones').insert({ user_id: referrerId, milestone });
                    
                    // Add days to subscription
                    const { data: sub } = await admin
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', referrerId)
                        .single();

                    const currentEnd = sub && sub.current_period_end ? new Date(sub.current_period_end) : new Date();
                    const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()));
                    newEnd.setDate(newEnd.getDate() + daysToAdd);

                    if (sub) {
                        await admin.from('subscriptions').update({ 
                            current_period_end: newEnd.toISOString(),
                            status: sub.status === 'canceled' ? 'active' : sub.status,
                            plan: sub.plan === 'free' ? 'pro' : sub.plan
                        }).eq('id', sub.id);
                    } else {
                        await admin.from('subscriptions').insert({
                            user_id: referrerId,
                            plan: 'pro',
                            status: 'trialing',
                            started_at: new Date().toISOString(),
                            current_period_end: newEnd.toISOString()
                        });
                    }

                    // Log Premium grant
                    await admin.from('referral_rewards').insert({
                        user_id: referrerId,
                        referral_id: referralId,
                        type: 'premium_days',
                        value: daysToAdd,
                        description: description,
                        applied: true,
                    });
                }
            }
        };

        // Check milestones descending (10 then 5)
        await checkMilestone(10, 30, 'Milestone 10 Indicações: +1 Mês de Premium');
        await checkMilestone(5, 7, 'Milestone 5 Indicações: +1 Semana de Premium');

        await trackServerEvent(referrerId, 'referral_rewarded', { referralId, amount: REWARD_PER_REFERRAL, totalConversions: conversions });

        return NextResponse.json({ success: true, creditAdded: REWARD_PER_REFERRAL });
    } catch (e: any) {
        console.error('[REFERRALS/REWARD]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
