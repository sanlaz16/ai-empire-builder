import { getSelectedProducts, Product } from './db';
import { supabase } from './supabaseClient';

export interface KPI {
    label: string;
    value: string;
    trend: number; // percentage
    trendDirection: 'up' | 'down';
}

export interface ChartPoint {
    date: string;
    revenue: number;
}

export interface ProductPerformance extends Product {
    unitsSold: number;
    revenue: number;
    trend: 'up' | 'down';
}

export interface AIInsight {
    id: string;
    category: 'timing' | 'product' | 'conversion' | 'viral';
    text: string;
    actionLabel?: string;
    actionLink?: string;
}

// 1. KPI Summary
export const getPerformanceSummary = async (userId: string): Promise<KPI[]> => {
    // In a real app, query `orders` table.
    // MVP: Return realistic mock data, potentially influenced by how many products they have selected.

    // Check if they have selected products to adjust scale
    const products = await getSelectedProducts(userId);
    const scale = Math.max(1, products.length);

    return [
        { label: 'Total Revenue', value: `$${(12500.50 * scale / 5).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, trend: 12.5, trendDirection: 'up' },
        { label: 'Total Orders', value: Math.floor(450 * scale / 5).toString(), trend: 8.2, trendDirection: 'up' },
        { label: 'Avg Order Value', value: '$42.50', trend: 2.1, trendDirection: 'up' },
        { label: 'Conversion Rate', value: '3.2%', trend: 0.5, trendDirection: 'down' }
    ];
};

// 2. Sales Chart
export const getRevenueSeries = async (userId: string, range: '7d' | '14d' | '30d'): Promise<ChartPoint[]> => {
    const points: ChartPoint[] = [];
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30;

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);

        // Random usage curve
        const base = 500;
        const random = Math.random() * 300 - 100;
        const trend = i * 20; // Slight upward trend

        points.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: Math.max(0, base + random + trend)
        });
    }
    return points;
};

// 3. Top Products
export const getTopProducts = async (userId: string): Promise<ProductPerformance[]> => {
    const products = await getSelectedProducts(userId);

    if (!products || products.length === 0) return [];

    // Augment with mock performance stats
    return products.map(p => {
        const units = Math.floor(Math.random() * 500) + 20;
        return {
            ...p,
            unitsSold: units,
            revenue: units * parseFloat(p.sellingPrice),
            trend: (Math.random() > 0.3 ? 'up' : 'down') as 'up' | 'down'
        };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
};

// 4. AI Insights
export const getAIInsights = async (userId: string): Promise<AIInsight[]> => {
    const products = await getSelectedProducts(userId);
    const hasTikTok = true; // simplified for mock

    const insights: AIInsight[] = [
        {
            id: '1',
            category: 'timing',
            text: 'Your pet products perform better in the evening. Try posting TikToks between 7–10 PM ET.',
            actionLabel: 'Schedule Post',
            actionLink: '/dashboard/product-finder'
        },
        {
            id: '2',
            category: 'conversion',
            text: 'TikTok-compatible products in your store are outperforming others by 42%. Focus on video content.',
            actionLabel: 'View Trends',
            actionLink: '/dashboard/trends'
        }
    ];

    if (products.length > 0) {
        insights.push({
            id: '3',
            category: 'product',
            text: `High engagement detected for "${products[0].name}". Consider creating a dedicated video series.`,
            actionLabel: 'Generate Video Script',
            actionLink: '/dashboard/product-finder' // or script tool later
        });
    }

    // Add generic if few products
    if (products.length < 3) {
        insights.push({
            id: '4',
            category: 'viral',
            text: 'You have few products in your store. Adding 3-5 more trending items can increase AOV by 20%.',
            actionLabel: 'Find Products',
            actionLink: '/dashboard/product-finder'
        });
    }

    return insights;
};
