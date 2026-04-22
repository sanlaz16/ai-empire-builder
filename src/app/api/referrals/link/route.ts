import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { referralCode, newUserId } = body;

        if (!referralCode || !newUserId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const supabase = createClient();

        // 1. Find referrer by code
        const { data: codeData, error: codeError } = await supabase
            .from('referral_codes')
            .select('user_id')
            .eq('code', referralCode.trim().toUpperCase())
            .single();

        if (codeError || !codeData) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        const referrerId = codeData.user_id;

        // 2. Prevent self-referral (though unlikely in signup flow)
        if (referrerId === newUserId) {
            return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
        }

        // 3. Create referral link
        const { error: linkError } = await supabase
            .from('referrals')
            .insert({
                referrer_user_id: referrerId,
                referred_user_id: newUserId
            });

        if (linkError) {
            // Might already exist, ignore unique constraint error
            if (linkError.code === '23505') {
                return NextResponse.json({ success: true, message: 'Already linked' });
            }
            throw linkError;
        }

        // 4. Increment conversions in referral_codes
        await supabase.rpc('increment_conversions', { code_val: referralCode.trim().toUpperCase() });

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error('Link Referral Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
