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
    priceDisplay?: string;     // BRL formatted string
    stripePriceId: string;     // from env
    pagarmePlanId?: string;    // from env
    maxProducts?: number;      // legacy/soft limit
    features: string[];
    highlighted?: boolean;
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Inicial',
        description: 'Para explorar a plataforma',
        priceMonthly: 19.99,
        priceDisplay: 'R$ 19,99',
        stripePriceId: '',
        features: [
            'Navegar por produtos',
            'Ferramentas limitadas',
            'Acesso beta',
        ],
    },
    {
        id: 'pro',
        name: 'Crescimento',
        description: 'Melhor para lançar lojas',
        priceMonthly: 49.99,
        priceDisplay: 'R$ 49,99',
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        pagarmePlanId: process.env.PAGARME_PRO_PLAN_ID || '',
        highlighted: true,
        features: [
            'Ferramentas de IA para produtos',
            'Otimização avançada',
            'Fluxo de importação completo',
            'Suporte prioritário',
        ],
    },
    {
        id: 'elite',
        name: 'Império',
        description: 'Para escalar operações',
        priceMonthly: 149.99,
        priceDisplay: 'R$ 149,99',
        stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || '',
        pagarmePlanId: process.env.PAGARME_ELITE_PLAN_ID || '',
        features: [
            'Tudo no plano Crescimento',
            'Recursos avançados',
            'Suporte VIP',
            'Ferramentas de crescimento',
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
