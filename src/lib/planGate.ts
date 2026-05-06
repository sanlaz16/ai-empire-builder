/**
 * Plan Gate — single source of truth for feature access control.
 * Maps plan levels to features and limits.
 * 
 * Plans (BRL):
 *   free   → R$ 0      (beta access, limited)
 *   pro    → R$ 49,99  (advanced AI, 10 ads/day)
 *   elite  → R$ 149,99 (full unlock, unlimited)
 */

export type PlanLevel = 'free' | 'pro' | 'elite';

export type FeatureKey =
    | 'import_shopify'
    | 'optimize_ai'
    | 'tiktok_export'
    | 'referral_bonuses'
    | 'supplier_discovery_full'
    | 'store_scan_full'
    | 'elite_badge'
    | 'ai_store_builder_full'
    | 'ai_ad_generator'
    | 'ai_ad_generator_pro';

/** How many AI ads a plan can generate per session */
export const AD_LIMIT: Record<PlanLevel, number> = {
    free: 3,
    pro: 10,
    elite: 10,
};

/** How many AI store builds a plan can do per day (soft limit, not enforced yet) */
export const BUILDER_LIMIT: Record<PlanLevel, number> = {
    free: 2,
    pro: 20,
    elite: -1, // unlimited
};

export const canUseFeature = (plan: PlanLevel | string, feature: FeatureKey): boolean => {
    const p = (plan || 'free').toLowerCase() as PlanLevel;

    switch (feature) {
        case 'import_shopify':
            return p === 'pro' || p === 'elite';
        case 'optimize_ai':
            return p === 'pro' || p === 'elite';
        case 'supplier_discovery_full':
            return p === 'pro' || p === 'elite';
        case 'store_scan_full':
            return p === 'pro' || p === 'elite';
        case 'ai_store_builder_full':
            return p === 'pro' || p === 'elite';
        case 'ai_ad_generator':
            return true; // all plans, but limited to 3 for free
        case 'ai_ad_generator_pro':
            return p === 'pro' || p === 'elite';
        case 'tiktok_export':
            return p === 'elite';
        case 'referral_bonuses':
            return p === 'pro' || p === 'elite';
        case 'elite_badge':
            return p === 'elite';
        default:
            return false;
    }
};

export const getPlanBadgeColor = (plan: PlanLevel | string) => {
    const p = (plan || 'free').toLowerCase() as PlanLevel;
    switch (p) {
        case 'elite': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
        case 'pro': return 'text-[#00f2ea] border-[#00f2ea]/50 bg-[#00f2ea]/10';
        default: return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
    }
};

export const getPlanLabel = (plan: PlanLevel | string): string => {
    const p = (plan || 'free').toLowerCase() as PlanLevel;
    switch (p) {
        case 'elite': return 'Império';
        case 'pro': return 'Crescimento';
        default: return 'Gratuito';
    }
};
