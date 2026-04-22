export type PlanLevel = 'free' | 'pro' | 'elite';

export type FeatureKey =
    | 'import_shopify'
    | 'optimize_ai'
    | 'tiktok_export'
    | 'referral_bonuses'
    | 'supplier_discovery_full'
    | 'store_scan_full'
    | 'elite_badge';

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
        case 'tiktok_export':
            return p === 'elite';
        case 'referral_bonuses':
            return p === 'elite';
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
