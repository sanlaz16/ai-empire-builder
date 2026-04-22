export type SupplierType = 'DSers' | 'CJ' | 'Temu';

export interface SupplierProduct {
    id: string;
    title: string;
    image: string;
    cost: number;
    price_suggestion: number;
    supplier: SupplierType;
    shipping_time?: string;
    url?: string;
    niche?: string;
    description?: string;
}

export interface SupplierSearchResult {
    products: SupplierProduct[];
    total: number;
}
