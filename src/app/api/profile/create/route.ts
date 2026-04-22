import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Generate a unique EMP-XXXXXX referral code */
function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'EMP-';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// POST /api/profile/create — called after Supabase signup
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            phone_br,
            address_line,
            city,
            state,
            postal_code,
            referred_by,
            twofa_enabled = false,
        } = body;

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if profile already exists
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ success: true, message: 'Profile already exists' });
        }

        // Generate unique referral code
        let referralCode = generateReferralCode();

        // Ensure uniqueness (retry up to 5 times)
        for (let i = 0; i < 5; i++) {
            const { data: clash } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('referral_code', referralCode)
                .single();

            if (!clash) break;
            referralCode = generateReferralCode();
        }

        // Validate referred_by code if provided
        let validReferredBy: string | null = null;
        if (referred_by) {
            const { data: referrer } = await supabase
                .from('user_profiles')
                .select('user_id')
                .eq('referral_code', referred_by.trim().toUpperCase())
                .single();

            if (referrer && referrer.user_id !== user.id) {
                validReferredBy = referred_by.trim().toUpperCase();
            }
        }

        const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: user.id,
                name: name || null,
                phone_br: phone_br || null,
                address_line: address_line || null,
                city: city || null,
                state: state || null,
                postal_code: postal_code || null,
                referral_code: referralCode,
                referred_by: validReferredBy,
                twofa_enabled,
            });

        if (insertError) {
            console.error('[PROFILE/CREATE]', insertError);
            return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true, referralCode });

    } catch (e: any) {
        console.error('[PROFILE/CREATE] Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
