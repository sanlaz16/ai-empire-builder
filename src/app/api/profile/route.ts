import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/profile — fetch current user profile
export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
            return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
        }

        return NextResponse.json({
            profile: profile || null,
            email: user.email,
            userId: user.id,
        });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/profile — update editable profile fields
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const {
            name, phone_br, address_line, city, state, postal_code, company_name, twofa_enabled,
            default_cost_percentage, default_shipping_cost, default_processing_days,
            fee_percentage, fee_fixed, push_enabled
        } = body;

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                name,
                phone_br,
                address_line,
                city,
                state,
                postal_code,
                company_name,
                twofa_enabled,
                default_cost_percentage,
                default_shipping_cost,
                default_processing_days,
                fee_percentage,
                fee_fixed,
                push_enabled,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (updateError) {
            console.error('[PROFILE/PATCH]', updateError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
