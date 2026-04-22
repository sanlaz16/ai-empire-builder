import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY is missing. Stripe functionality will be disabled.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
    // @ts-ignore - Stripe version mismatch in environment types
    apiVersion: '2024-06-20',
    typescript: true,
});

export const isStripeConfigured = () => {
    return !!process.env.STRIPE_SECRET_KEY;
};
