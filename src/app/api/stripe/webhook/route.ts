import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS for webhook updates
function getServiceSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function mapStripePlanToPlanId(priceId: string): string {
    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter';
    if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return 'growth';
    if (priceId === process.env.STRIPE_EMPIRE_PRICE_ID) return 'empire';
    return 'free';
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const stripe = await import('stripe').then(m => new m.default(process.env.STRIPE_SECRET_KEY!));
    const supabase = getServiceSupabase();

    let event: any;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('[WEBHOOK] Signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[WEBHOOK] Received event: ${event.type}`);

    try {
        switch (event.type) {

            // --- 1. Checkout session completed (new subscription) ---
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.user_id;
                const planId = session.metadata?.plan;
                if (!userId || !planId) break;

                // Fetch full subscription details
                const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
                const priceId = stripeSub.items.data[0]?.price.id;
                const resolvedPlan = mapStripePlanToPlanId(priceId);

                await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        plan: resolvedPlan,
                        status: stripeSub.status,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id' });

                console.log(`[WEBHOOK] Activated ${resolvedPlan} for user ${userId}`);
                break;
            }

            // --- 2. Invoice paid (renewal) ---
            case 'invoice.paid': {
                const invoice = event.data.object;
                const subId = invoice.subscription as string;
                if (!subId) break;

                const stripeSub = await stripe.subscriptions.retrieve(subId);
                const priceId = stripeSub.items.data[0]?.price.id;
                const planId = mapStripePlanToPlanId(priceId);

                await supabase
                    .from('subscriptions')
                    .update({
                        plan: planId,
                        status: 'active',
                        current_period_end: new Date((stripeSub as any).current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subId);

                console.log(`[WEBHOOK] Renewed ${planId} sub ${subId}`);
                break;
            }

            // --- 3. Subscription deleted/canceled ---
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        plan: 'free',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', sub.id);

                console.log(`[WEBHOOK] Canceled sub ${sub.id}`);
                break;
            }

            // --- 4. Subscription updated (plan change) ---
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const priceId = sub.items?.data[0]?.price?.id;
                const planId = mapStripePlanToPlanId(priceId);

                await supabase
                    .from('subscriptions')
                    .update({
                        plan: planId,
                        status: sub.status,
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: sub.cancel_at_period_end,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', sub.id);

                console.log(`[WEBHOOK] Updated sub ${sub.id} → ${planId} (${sub.status})`);
                break;
            }

            default:
                console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error('[WEBHOOK] Handler error:', err);
        return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
    }
}
