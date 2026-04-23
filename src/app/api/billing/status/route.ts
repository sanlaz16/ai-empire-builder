import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We use the denormalized fields on the profile for fast access
        const { data: profile } = await supabase
            .from('profiles')
            .select('plan_id, subscription_status, billing_provider')
            .eq('user_id', user.id)
            .single();

        return NextResponse.json({
            plan: profile?.plan_id || 'free',
            status: profile?.subscription_status || 'inactive',
            provider: profile?.billing_provider || 'stripe'
        });

    } catch (e: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
