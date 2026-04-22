import { BillingProvider } from './provider';
import { StripeProvider } from './stripe';
import { PagarmeProvider } from './pagarme';

/**
 * Returns the currently active billing provider based on the environment configuration.
 * BILLING_PROVIDER can be set to 'stripe' or 'pagarme'.
 * Falls back to Stripe by default.
 */
export function getBillingProvider(): BillingProvider {
    const providerName = process.env.BILLING_PROVIDER?.toLowerCase() || 'stripe';

    if (providerName === 'pagarme') {
        if (!process.env.PAGARME_SECRET_KEY) {
            console.warn("PAGARME_SECRET_KEY is missing. Pagar.me is enabled but improperly configured.");
        }
        return PagarmeProvider;
    }

    // Default to Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
        console.warn("STRIPE_SECRET_KEY is missing from environment. Billing checkout will fail.");
    }

    return StripeProvider;
}

export function getActiveProviderName(): 'stripe' | 'pagarme' {
    return (process.env.BILLING_PROVIDER?.toLowerCase() === 'pagarme') ? 'pagarme' : 'stripe';
}
