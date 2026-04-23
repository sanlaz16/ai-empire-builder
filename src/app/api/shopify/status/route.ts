import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ connected: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('shopify_connections')
            .select('shop_domain, scope, created_at')
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            return NextResponse.json({ connected: false });
        }

        return NextResponse.json({
            connected: true,
            shopDomain: data.shop_domain,
            scope: data.scope,
            connectedAt: data.created_at
        });

    } catch (err) {
        console.error('Status check error:', err);
        return NextResponse.json({ connected: false, error: 'Internal server error' }, { status: 500 });
    }
}
