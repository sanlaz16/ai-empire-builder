import { Product } from '@/lib/db';

export interface TrendData {
    trendScore: number;
    trendLabel: 'Cold' | 'Rising' | 'Hot' | 'Exploding';
    reason: string;
}

export const calculateTrendScore = (product: Product): TrendData => {
    // Deterministic pseudo-random based on product ID/Name to allow consistent refreshing
    const hashString = product.name + product.niche;
    let hash = 0;
    for (let i = 0; i < hashString.length; i++) {
        hash = (hash << 5) - hash + hashString.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash) % 100;

    // Base score on seed but boost certain niches
    let score = seed;

    // Niche modifiers
    if (product.niche.toLowerCase().includes('tech') || product.niche.toLowerCase().includes('gadget')) score += 10;
    if (product.niche.toLowerCase().includes('beauty') || product.niche.toLowerCase().includes('cosmetic')) score += 15;
    if (product.niche.toLowerCase().includes('home') || product.niche.toLowerCase().includes('decor')) score += 5;

    // Cap at 100, min at 0
    score = Math.max(0, Math.min(100, score));

    let label: TrendData['trendLabel'];
    if (score >= 80) label = 'Exploding';
    else if (score >= 60) label = 'Hot';
    else if (score >= 40) label = 'Rising';
    else label = 'Cold';

    const reasons = [
        "High engagement on recent hashtags",
        "Competitors running low on stock",
        "Spiking search volume in region",
        "Viral potential due to visual appeal",
        "Influencer favorites list mentions",
        "Rapidly growing organic reach",
        "Strong impulse buy indicators"
    ];

    // pseudo-random reason
    const reasonIndex = (score + product.id.toString().length) % reasons.length;

    return {
        trendScore: score,
        trendLabel: label,
        reason: reasons[reasonIndex]
    };
};
