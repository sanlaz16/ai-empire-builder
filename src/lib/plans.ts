/**
 * Plan definitions — single source of truth for EmpireBuilder SaaS.
 * 
 * Beta launch pricing (BRL):
 *   Inicial   → R$ 19/mês
 *   Crescimento → R$ 49/mês
 *   Império   → R$ 177/mês
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
        description: 'Constrói sua loja e escolhe produtos para o seu nicho',
        priceMonthly: 19,
        priceDisplay: 'R$ 19',
        stripePriceId: '',
        features: [
            'Construtor de Loja IA',
            'Escolha de produtos para seu nicho',
            '3 anúncios por geração',
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
        description: 'Cria sua loja com mais poder de IA e anúncios para até 3 produtos da página',
        priceMonthly: 49,
        priceDisplay: 'R$ 49',
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
        highlighted: true,
        features: [
            'Tudo no plano Inicial',
            'Mais poder de IA (Gerações mais rápidas)',
            'Anúncios com IA para até 3 produtos',
            'Construtor de Loja IA avançado',
            'Importação Shopify',
            'Suporte prioritário',
        ],
        limits: {
            adsPerSession: 3,
            aiBuildsPerDay: 20,
            productsImport: 100,
        },
    },
    {
        id: 'elite',
        name: 'Império',
        description: 'Páginas ultra premium, velocidade máxima e comercial com IA para até 10 produtos',
        priceMonthly: 177,
        priceDisplay: 'R$ 177',
        stripePriceId: process.env.STRIPE_ELITE_PRICE_ID || '',
        features: [
            'Tudo no plano Crescimento',
            'Páginas com design Ultra Premium',
            'Processamento e carregamento mais rápidos',
            'Comercial com IA para até 10 produtos',
            'Anúncios ilimitados',
            'Exportação TikTok Shop',
            'Suporte VIP',
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
