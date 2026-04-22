import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { StripeProvider } from '@/lib/billing/stripe';

export async function POST(req: Request) {
    try {
        const event = await StripeProvider.handleWebhook(req);

        if (!event) {
            return NextResponse.json({ received: true, status: 'ignored' });
        }

        const supabase = createServiceClient();

        if (event.type === 'subscription.updated') {
            // Upsert subscription
            const { error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: event.clientReferenceId || '', // Stripe metadata or lookup
                    provider: 'stripe',
                    provider_customer_id: event.customerId,
                    provider_subscription_id: event.subscriptionId,
                    status: event.status,
                    current_period_end: event.currentPeriodEnd,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' }); // Simplified: usually we match by customer_id or metadata

            if (error) console.error('[STRIPE/WEBHOOK] DB Error:', error);
        }

        if (event.type === 'subscription.deleted') {
            await supabase
                .from('subscriptions')
                .update({
                    status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('provider_subscription_id', event.subscriptionId);
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[STRIPE/WEBHOOK] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
