import { SupplierProduct, SupplierSearchResult } from './types';

const MOCK_PRODUCTS: SupplierProduct[] = [
    {
        id: 'ds-1',
        title: 'Smart Pet Feeder with Camera',
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=400&h=400&auto=format&fit=crop',
        cost: 45.90,
        price_suggestion: 129.99,
        supplier: 'DSers',
        shipping_time: '7-12 days',
        niche: 'Pets',
        url: 'https://aliexpress.com/item/mock-1'
    },
    {
        id: 'ds-2',
        title: 'Orthopedic Dog Bed with Removable Cover',
        image: 'https://images.unsplash.com/photo-1591768793355-74d7c514c40e?q=80&w=400&h=400&auto=format&fit=crop',
        cost: 18.50,
        price_suggestion: 54.99,
        supplier: 'DSers',
        shipping_time: '10-15 days',
        niche: 'Pets'
    },
    // Add more as needed
];

export async function searchDSers(query?: string, niche?: string): Promise<SupplierSearchResult> {
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
