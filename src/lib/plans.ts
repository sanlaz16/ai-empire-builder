/**
 * Plan definitions for EmpireBuilder SaaS
 * Single source of truth for pricing, limits, and features.
 */

export type PlanId = 'free' | 'pro' | 'elite';

export interface Plan {
    id: PlanId;
    name: string;
    description?: string;
    priceMonthly: number;      // USD
    stripePriceId: string;     // from env
    pagarmePlanId?: string;    // from env
    maxProducts?: number;      // legacy/soft limit
    features: string[];
    highlighted?: boolean;
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Free / Starter',
        description: 'For exploring the platform',
        priceMonthly: 0,
        stripePriceId: '',
        features: [
            'Browse products',
            'Limited tools',
            'Beta access',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Best for launching stores',
        priceMonthly: 49,
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        pagarmePlanId: process.env.PAGARME_PRO_PLAN_ID || '',
        highlighted: true,
        features: [
            'AI product tools',
            'Optimization',
            'Full import flow',
            'Better support',
        ],
    },
    {
        id: 'elite',
        name: 'Enterprise / Elite',
        description: 'For scaling operations',
        priceMonthly: 99,
        stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || '',
        pagarmePlanId: process.env.PAGARME_ELITE_PLAN_ID || '',
        features: [
            'Everything in Pro',
            'Advanced features',
            'Priority support',
            'Growth tools',
        ],
    },
];

export function getPlan(planId: PlanId | string): Plan {
    return PLANS.find(p => p.id === planId) ?? PLANS[0];
}

export function getMaxProducts(planId: PlanId | string): number {
    return getPlan(planId).maxProducts ?? -1;
}

/** Returns true if the user can import more products given their current count */
export function canAddProduct(planId: PlanId | string, currentCount: number): boolean {
    const max = getMaxProducts(planId);
    return max === -1 || currentCount < max;
}
