import { SupplierProduct, SupplierSearchResult } from './types';

const MOCK_PRODUCTS: SupplierProduct[] = [
    {
        id: 'temu-1',
        title: 'Portable Vacuum Cleaner for Car',
        image: 'https://images.unsplash.com/photo-1563132337-f159f484226c?q=80&w=400&h=400&auto=format&fit=crop',
        cost: 15.00,
        price_suggestion: 49.99,
        supplier: 'Temu',
        shipping_time: '7-10 days',
        niche: 'Automotive'
    },
    {
        id: 'temu-2',
        title: 'LED Sunset Lamp with App Control',
        image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=400&h=400&auto=format&fit=crop',
        cost: 6.50,
        price_suggestion: 24.99,
        supplier: 'Temu',
        shipping_time: '8-12 days',
        niche: 'Home Decor'
    }
];

export async function searchTemu(query?: string, niche?: string): Promise<SupplierSearchResult> {
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
