// ─── Existing types ────────────────────────────────────────────────────────
export interface SupplierProduct {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    sourcePrice: number;
    shippingCost: number;
    currency: string;
    supplierUrl?: string;
    supplierName: string;
    status: 'active' | 'imported' | 'archived';
}

export interface CSVRow {
    title: string;
    image_url?: string;
    image?: string;
    price: string | number;
    shipping?: string | number;
    currency?: string;
    url?: string;
    supplier?: string;
}

// ─── Provider types ────────────────────────────────────────────────────────

export interface ProfitSuggestion {
    suggestedPrice: number;
    estimatedProfit: number;
    marginPercent: number;
}

export interface UnifiedProduct {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    images?: string[];
    price: number;
    shippingCost: number;
    currency: string;
    supplierUrl?: string;
    supplierName: string;
    rating?: number;
    reviewsCount?: number;
    shippingDays?: number;
    profitSuggestion: ProfitSuggestion;
    category?: string;
    tags?: string[];
    inStock?: boolean;
}

export interface ProviderSearchRequest {
    query: string;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
}

export interface ProviderSearchResponse {
    products: UnifiedProduct[];
    totalFound: number;
    provider: string;
    error?: string;
}

export interface ProviderAdapter {
    name: string;
    isConfigured(): boolean;
    search(request: ProviderSearchRequest): Promise<ProviderSearchResponse>;
}

// ─── Profit calculation helper ──────────────────────────────────────────────

export function calculateProfitSuggestion(
    sourcePrice: number,
    shippingCost: number = 0,
    markup = 2.5
): ProfitSuggestion {
    const totalCost = sourcePrice + shippingCost;
    const suggestedPrice = parseFloat((totalCost * markup).toFixed(2));
    const estimatedProfit = parseFloat((suggestedPrice - totalCost).toFixed(2));
    const marginPercent = parseFloat(((estimatedProfit / suggestedPrice) * 100).toFixed(1));
    return { suggestedPrice, estimatedProfit, marginPercent };
}

// ─── Niche keywords ─────────────────────────────────────────────────────────

export const NICHE_KEYWORDS: Record<string, string[]> = {
    'Pets': ['pet supplies', 'dog accessories', 'cat toys', 'pet grooming'],
    'Fitness & Health': ['gym equipment', 'resistance bands', 'yoga mat', 'fitness tracker'],
    'Kitchen': ['kitchen gadgets', 'cooking tools', 'food storage', 'coffee accessories'],
    'Beauty': ['skincare', 'makeup brushes', 'hair care', 'nail art'],
    'Electronics': ['phone accessories', 'wireless earbuds', 'smart home', 'charging cable'],
    'Home & Garden': ['home decor', 'garden tools', 'storage organizer', 'lighting'],
    'Baby & Kids': ['baby toys', 'kids clothing', 'baby monitor', 'educational toys'],
    'Sports': ['outdoor sports', 'cycling gear', 'swimming accessories', 'hiking'],
    'Fashion': ['jewelry', 'watches', 'bags', 'sunglasses'],
    'Custom': ['trending products', 'best sellers', 'new arrivals'],
};
