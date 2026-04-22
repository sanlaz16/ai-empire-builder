import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const { planId } = await request.json();

        if (!planId || planId === 'free') {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Map planId to Stripe price IDs from env
        const priceMap: Record<string, string | undefined> = {
            starter: process.env.STRIPE_STARTER_PRICE_ID,
            growth: process.env.STRIPE_GROWTH_PRICE_ID,
            empire: process.env.STRIPE_EMPIRE_PRICE_ID,
        };

        const priceId = priceMap[planId];
        if (!priceId) {
            return NextResponse.json({ error: `Price ID for ${planId} not configured` }, { status: 500 });
        }

        // Get or create Stripe customer
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        let customerId = subscription?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                metadata: { user_id: user.id },
            });
            customerId = customer.id;

            // Proactively save customer ID to subscription table
            await supabase
                .from('subscriptions')
                .upsert({
                    user_id: user.id,
                    stripe_customer_id: customerId,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${siteUrl}/dashboard/billing?success=1`,
            cancel_url: `${siteUrl}/dashboard/billing?canceled=1`,
            metadata: { user_id: user.id, plan: planId },
            subscription_data: {
                trial_period_days: 7,
                metadata: { user_id: user.id, plan: planId },
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (e: any) {
        console.error('[STRIPE/CHECKOUT]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
