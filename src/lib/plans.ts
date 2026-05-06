/**
 * Plan definitions — single source of truth for EmpireBuilder SaaS.
 * 
 * Beta launch pricing (BRL):
 *   Inicial   → R$ 19,99/mês  (beta entry)
 *   Crescimento → R$ 49,99/mês (most popular)
 *   Império   → R$ 149,99/mês (full power)
 */

export type PlanId = 'free' | 'pro' | 'elite';

export interface Plan {
    id: PlanId;
    name: string;
    description?: string;
    priceMonthly: number;
    priceDisplay: string;
    stripePriceId: string;
    highlighted?: boolean;
    features: string[];
    limits: {
        adsPerSession: number;
        aiBuildsPerDay: number;
        productsImport: number | 'unlimited';
    };
}

export const PLANS: Plan[] = [
    {
        id: 'free',
        name: 'Inicial',
        description: 'Para explorar a plataforma durante o beta',
        priceMonthly: 19.99,
        priceDisplay: 'R$ 19,99',
        stripePriceId: '',
        features: [
            '3 anúncios por geração',
            '2 análises de loja por dia',
            'Acesso ao Construtor de Loja IA',
            'Busca de produtos básica',
            'Acesso beta completo',
        ],
        limits: {
            adsPerSession: 3,
            aiBuildsPerDay: 2,
            productsImport: 10,
        },
    },
    {
        id: 'pro',
        name: 'Crescimento',
        description: 'Para quem quer lançar e escalar',
        priceMonthly: 49.99,
        priceDisplay: 'R$ 49,99',
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        highlighted: true,
        features: [
            '10 anúncios por geração',
            '20 análises de loja por dia',
            'Construtor de Loja IA avançado',
            'Importação Shopify',
            'Otimização com IA',
            'Suporte prioritário',
        ],
        limits: {
            adsPerSession: 10,
            aiBuildsPerDay: 20,
            productsImport: 100,
        },
    },
    {
        id: 'elite',
        name: 'Império',
        description: 'Tudo desbloqueado para escalar',
        priceMonthly: 149.99,
        priceDisplay: 'R$ 149,99',
        stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || '',
        features: [
            'Tudo no plano Crescimento',
            'Anúncios ilimitados',
            'Análises ilimitadas',
            'Export TikTok Shop',
            'Bônus de indicação',
            'Suporte VIP',
            'Badge Império exclusivo',
        ],
        limits: {
            adsPerSession: 10,
            aiBuildsPerDay: -1,
            productsImport: 'unlimited',
        },
    },
];

export function getPlan(planId: PlanId | string): Plan {
    return PLANS.find(p => p.id === planId) ?? PLANS[0];
}

export function getMaxProducts(planId: PlanId | string): number | 'unlimited' {
    return getPlan(planId).limits.productsImport;
}

export function canAddProduct(planId: PlanId | string, currentCount: number): boolean {
    const max = getPlan(planId).limits.productsImport;
    if (max === 'unlimited') return true;
    return currentCount < max;
}
