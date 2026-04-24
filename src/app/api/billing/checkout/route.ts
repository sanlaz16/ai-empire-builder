import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBillingProvider } from '@/lib/billing';
import { getPlan, PlanId } from '@/lib/plans';
import { getServerLocation } from '@/lib/analytics/serverLocation';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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

        // Get location and UA info from headers
        const location = getServerLocation();
        const ua = req.headers.get('user-agent') || '';
        
        // Simple device/browser detection from UA (backend version)
        const deviceType = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop';
        const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Other';

        // 1. Get current subscription/customer details
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('provider_customer_id')
            .eq('user_id', user.id)
            .single();

        // 2. Record checkout started for recovery system
        const supabaseAdmin = createSupabaseAdmin(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabaseAdmin.from('checkout_recovery').insert({
            user_id: user.id,
            email: user.email,
            plan_selected: plan.id,
            displayed_price: plan.priceMonthly,
            checkout_step: 'started',
            device_type: deviceType,
            browser: browser,
            country: location.country,
            region: location.region,
            city: location.city,
            recovery_stage: 'initial'
        });

        // 3. Determine correct Price ID for the provider
        const billingProvider = getBillingProvider();
        const providerData = await billingProvider.createCheckout({
            planId: plan.id,
            priceId: plan.stripePriceId, // StripeProvider uses this
            email: user.email,
            customerId: subscription?.provider_customer_id,
            clientReferenceId: user.id,
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
            cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?checkout=cancel`,
        });

        return NextResponse.json({ url: providerData });

    } catch (error: any) {
        console.error('[BILLING/CHECKOUT] Error:', error);
        return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
    }
}
