import { SupplierProduct, SupplierSearchResult } from './types';

const MOCK_PRODUCTS: SupplierProduct[] = [
    {
        id: 'cj-1',
        title: 'Electric Facial Cleansing Brush',
        image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?q=80&w=400&h=400&auto=format&fit=crop',
        cost: 8.20,
        price_suggestion: 29.99,
        supplier: 'CJ',
        shipping_time: '5-10 days',
        niche: 'Beauty'
    },
    {
        id: 'cj-2',
        title: 'Resistance Bands Set for Home Workout',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&h=400&auto=format&fit=crop',
        cost: 12.50,
        price_suggestion: 34.99,
        supplier: 'CJ',
        shipping_time: '6-9 days',
        niche: 'Fitness'
    }
];

export async function searchCJ(query?: string, niche?: string): Promise<SupplierSearchResult> {
    let filtered = MOCK_PRODUCTS;
    if (niche && niche !== 'All') {
        filtered = filtered.filter(p => p.niche === niche);
    }
    if (query) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
    }

    return {
        products: filtered,
        total: filtered.length
    };
}
