import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const supabase = createClient();
        
        // Ensure user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Get top 10 profiles by referral_conversions
        const { data: topReferrers, error } = await supabase
            .from('profiles')
            .select('id, name, referral_conversions')
            .gt('referral_conversions', 0)
            .order('referral_conversions', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Mask names for privacy (e.g. "João S." or "J*** S.")
        const maskedLeaderboard = topReferrers.map(r => {
            const parts = (r.name || 'Usuário Anônimo').split(' ');
            const firstName = parts[0];
            const lastNameInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : '';
            return {
                id: r.id,
                name: `${firstName} ${lastNameInitial}`,
                conversions: r.referral_conversions,
                isCurrentUser: r.id === user.id
            };
        });

        return NextResponse.json({ leaderboard: maskedLeaderboard });

    } catch (e: any) {
        console.error('[LEADERBOARD]', e);
        return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
    }
}
