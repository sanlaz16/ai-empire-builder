import Stripe from 'stripe';
import { BillingProvider, CheckoutConfig, NormalizedWebhookEvent } from './provider';

// Initialize Stripe (Server Side Only)
// We rely on STRIPE_SECRET_KEY in the environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
    // @ts-ignore - The installed @types/stripe version expects a specific string matching 2024 but older workspace SDK functions perfectly
    apiVersion: '2023-10-16',
});

export const StripeProvider: BillingProvider = {
    async createCheckout(config: CheckoutConfig): Promise<string> {
        if (!config.priceId) throw new Error("Stripe priceId is required");

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: config.customerId,
            customer_email: config.customerId ? undefined : config.email,
            client_reference_id: config.clientReferenceId,
            line_items: [
                {
                    price: config.priceId,
                    quantity: 1,
                },
            ],
            success_url: config.successUrl,
            cancel_url: config.cancelUrl,
            metadata: {
                planId: config.planId
            }
        });

        if (!session.url) throw new Error("Failed to create Stripe Checkout URL");
        return session.url;
    },

    async createPortal(customerId: string, returnUrl: string): Promise<string> {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return portalSession.url;
    },

    async handleWebhook(req: Request): Promise<NormalizedWebhookEvent | null> {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("Missing Stripe signature or webhook secret");
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err: any) {
            throw new Error(`Webhook Error: ${err.message}`);
        }

        // Normalize the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.mode !== 'subscription') return null;

                // We need the subscription details to normalize completely. 
                // However, subscription.created/updated will also fire immediately after this.
                // We'll let subscription.updated handle the DB change to keep it DRY.
                return null;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

                // Fetch the price/product from the subscription items to map back to our Plan ID natively
                // Usually stored in metadata on checkout

                return {
                    type: 'subscription.updated',
                    provider: 'stripe',
                    customerId: customerId,
                    subscriptionId: sub.id,
                    status: sub.status,
                    currentPeriodEnd: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000) : undefined,
                    clientReferenceId: sub.metadata?.userId || (sub as any).client_reference_id
                };
            }

            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

                return {
                    type: 'subscription.deleted',
                    provider: 'stripe',
                    customerId: customerId,
                    subscriptionId: sub.id,
                    status: sub.status, // Should be 'canceled'
                };
            }

            default:
                return null; // Ignore other events
        }
    }
};
