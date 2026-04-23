import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { getBillingProvider } from '@/lib/billing';

export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('provider_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!subscription?.provider_customer_id) {
            return NextResponse.json({ error: 'No active billing profile found' }, { status: 400 });
        }

        const billingProvider = getBillingProvider();
        const portalUrl = await billingProvider.createPortal(
            subscription.provider_customer_id,
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`
        );

        return NextResponse.json({ url: portalUrl });

    } catch (error: any) {
        console.error('[BILLING/PORTAL] Error:', error);
        return NextResponse.json({ error: 'Portal access failed' }, { status: 500 });
    }
}
