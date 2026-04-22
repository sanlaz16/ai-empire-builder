import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getBillingProvider } from '@/lib/billing';

export async function POST(req: Request) {
    try {
        const provider = getBillingProvider();

        // 1. Let the provider adapter parse the webhook securely, and return a clean, normalized event.
        // It handles parsing the raw body & validating signatures internally.
        const event = await provider.handleWebhook(req);

        if (!event) {
            // Unhandled event type, or ignored by provider. That's fine! 
            return NextResponse.json({ received: true });
        }

        console.log(`[WEBHOOK] Normalized Event:`, event);

        // 2. Use the Service Client (bypass RLS) to update database
        const supabase = createServiceClient();

        if (event.type === 'subscription.updated' || event.type === 'subscription.deleted') {

            // Upsert the subscription record
            const { data: subscriptionRecord, error: subError } = await supabase
                .from('subscriptions')
                .upsert(
                    {
                        user_id: event.customerId, // NOTE: this only works if customerId actually matches user_id via config.clientReferenceId on checkout creation
                        provider: event.provider,
                        provider_customer_id: event.customerId,
                        provider_subscription_id: event.subscriptionId,
                        status: event.status,
                        plan_id: event.planId || 'free', // We need this planId mapped by provider if present
                        current_period_end: event.currentPeriodEnd ? event.currentPeriodEnd.toISOString() : null
                    },
                    { onConflict: 'provider_subscription_id' }
                )
                .select('user_id')
                .single();

            if (subError) {
                console.error('[WEBHOOK] Failed to update subscriptions table:', subError);
                throw subError;
            }

            // Denormalize onto user's profile for quick access in UI / middleware
            if (subscriptionRecord && subscriptionRecord.user_id) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        plan_id: event.planId || 'free',
                        subscription_status: event.status,
                        billing_provider: event.provider
                    })
                    .eq('id', subscriptionRecord.user_id);

                if (profileError) {
                    console.error('[WEBHOOK] Failed to update profiles table:', profileError);
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (err: any) {
        console.error('[WEBHOOK_ERROR]', err);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
