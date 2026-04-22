import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBillingProvider } from '@/lib/billing';
import { getPlan, PlanId } from '@/lib/plans';

export async function POST(req: Request) {
    try {
        const { planId } = await req.json();

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        const plan = getPlan(planId as PlanId);
        if (!plan || plan.id === 'free') {
            return NextResponse.json({ error: 'Invalid plan for checkout' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get current subscription/customer details
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('provider_customer_id')
            .eq('user_id', user.id)
            .single();

        // 2. Determine correct Price ID for the provider
        const billingProvider = getBillingProvider();
        const providerData = await billingProvider.createCheckout({
            planId: plan.id,
            priceId: plan.stripePriceId, // StripeProvider uses this
            email: user.email,
            customerId: subscription?.provider_customer_id,
            clientReferenceId: user.id,
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pricing?checkout=cancel`,
        });

        return NextResponse.json({ url: providerData });

    } catch (error: any) {
        console.error('[BILLING/CHECKOUT] Error:', error);
        return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
    }
}
