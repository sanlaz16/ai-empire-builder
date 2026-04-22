export interface SubscriptionStatus {
    isActive: boolean;
    planId: string;
    status: string;
    currentPeriodEnd: Date | null;
}

export interface CheckoutConfig {
    priceId?: string; // e.g. Stripe Price ID
    planId: string;   // Internal ID like 'starter10k'
    customerId?: string; // If user already has a customer ID with the provider
    email?: string;
    successUrl: string;
    cancelUrl: string;
    clientReferenceId: string; // Typically User ID
}

export interface BillingProvider {
    /**
     * Creates a checkout session URL using the given configuration
     */
    createCheckout(config: CheckoutConfig): Promise<string>;

    /**
     * Creates a URL to a billing management portal
     */
    createPortal(customerId: string, returnUrl: string): Promise<string>;

    /**
     * Handles an incoming webhook request, validating signatures
     * and returning standard normalized events.
     */
    handleWebhook(req: Request): Promise<NormalizedWebhookEvent | null>;
}

export interface NormalizedWebhookEvent {
    type: 'checkout.completed' | 'subscription.updated' | 'subscription.deleted';
    provider: 'stripe' | 'pagarme';
    customerId: string;
    subscriptionId: string;
    status: string; // 'active', 'past_due', 'canceled', etc
    planId?: string; // Might need to map provider's internal ID back to our plan ID
    currentPeriodEnd?: Date;
    clientReferenceId?: string; // Internal User ID
}
