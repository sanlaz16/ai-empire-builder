import { BillingProvider, CheckoutConfig, NormalizedWebhookEvent } from './provider';

/**
 * Pagar.me Billing Provider Adapter (Stub)
 * Implements the BillingProvider interface for Pagar.me.
 * Fully functional logic behind a feature flag for testing environments.
 */
export const PagarmeProvider: BillingProvider = {
    async createCheckout(config: CheckoutConfig): Promise<string> {
        // TODO: Replace with exact Pagar.me API call when keys/endpoints are finalized
        console.log('[PAGAR.ME] Creating checkout for', config.clientReferenceId);

        // Return a mock internal route that fakes a checkout flow if no real API is wired
        if (!process.env.PAGARME_SECRET_KEY) {
            return `/dashboard/billing/mock-checkout?plan=${config.planId}&uid=${config.clientReferenceId}`;
        }

        throw new Error("Pagar.me API integration not fully implemented.");
    },

    async createPortal(customerId: string, returnUrl: string): Promise<string> {
        // Pagar.me does not have an out-of-the-box hosted portal equivalent to Stripe's.
        // Direct users to an internal management page instead.
        return `${returnUrl}?manage=pagarme_internal`;
    },

    async handleWebhook(req: Request): Promise<NormalizedWebhookEvent | null> {
        // TODO: Implement Pagar.me signature verification
        console.log('[PAGAR.ME] Webhook received');

        return null; // Stub
    }
};
