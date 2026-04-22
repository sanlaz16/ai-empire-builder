import type { ProviderAdapter, ProviderSearchRequest, ProviderSearchResponse, UnifiedProduct } from './types';
import { calculateProfitSuggestion } from './types';

/**
 * CJ Dropshipping Provider Adapter
 * 
 * CJ Dropshipping API documentation: https://developers.cjdropshipping.com/
 */

interface CJProduct {
    pid: string;
    productNameEn: string;
    productImage: string;
    sellPrice: number;
    productWeight: number;
    productUrl: string;
}

export class CJAdapter implements ProviderAdapter {
    name = 'cj';
    private email: string | undefined;
    private password: string | undefined;
    private apiKey: string | undefined;
    private baseUrl = 'https://developers.cjdropshipping.com/api2.0/v1';
    private accessToken: string | null = null;

    constructor() {
        this.email = process.env.CJ_EMAIL;
        this.password = process.env.CJ_PASSWORD;
        this.apiKey = process.env.CJ_API_KEY;
    }

    isConfigured(): boolean {
        return !!(this.apiKey || (this.email && this.password));
    }

    async search(request: ProviderSearchRequest): Promise<ProviderSearchResponse> {
        try {
            // Always use mock search for now (real API when credentials are added)
            const products = await this.mockSearch(request);

            return {
                products,
                totalFound: products.length,
                provider: this.name
            };
        } catch (error) {
            console.error('CJ Dropshipping search error:', error);
            return {
                products: [],
                totalFound: 0,
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Mock search for development
     * Replace this with real API call when credentials are available
     */
    private async mockSearch(request: ProviderSearchRequest): Promise<UnifiedProduct[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        const { query, limit = 12 } = request;

        // Generate mock products based on query
        const mockProducts: UnifiedProduct[] = Array.from({ length: Math.min(limit, 6) }, (_, i) => {
            const basePrice = Math.random() * 35 + 8; // $8-$43
            const profit = calculateProfitSuggestion(basePrice);

            return {
                id: `cj_${Date.now()}_${i}`,
                title: `${query} - Fast Shipping (CJ)`,
                imageUrl: `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 100000000)}?auto=format&fit=crop&w=600&q=80`,
                price: Math.round(basePrice * 100) / 100,
                currency: 'USD',
                rating: 4.2 + Math.random() * 0.7,
                reviewsCount: Math.floor(Math.random() * 3000) + 50,
                supplierName: 'CJ Dropshipping',
                supplierUrl: `https://cjdropshipping.com/product/${Date.now()}.html`,
                shippingDays: Math.floor(Math.random() * 10) + 3, // CJ typically faster
                shippingCost: 0,
                profitSuggestion: profit
            };
        });

        return mockProducts;
    }

    /**
     * Authenticate with CJ API
     */
    private async authenticate(): Promise<string> {
        if (this.accessToken) {
            return this.accessToken;
        }

        const response = await fetch(`${this.baseUrl}/authentication/getAccessToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: this.email,
                password: this.password
            })
        });

        if (!response.ok) {
            throw new Error(`CJ authentication failed: ${response.statusText}`);
        }

        const data = await response.json();
        this.accessToken = data.data.accessToken;
        return this.accessToken as string;
    }

    /**
     * Real API implementation (to be used when credentials are available)
     */
    private async realSearch(request: ProviderSearchRequest): Promise<UnifiedProduct[]> {
        const token = await this.authenticate();
        const { query, limit = 12 } = request;

        const response = await fetch(`${this.baseUrl}/product/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CJ-Access-Token': token
            },
            body: JSON.stringify({
                productNameEn: query,
                pageNum: 1,
                pageSize: limit
            })
        });

        if (!response.ok) {
            throw new Error(`CJ API error: ${response.statusText}`);
        }

        const data = await response.json();

        return this.normalizeProducts(data.data.list || []);
    }

    /**
     * Normalize CJ response to UnifiedProduct format
     */
    private normalizeProducts(products: CJProduct[]): UnifiedProduct[] {
        return products.map(product => {
            const price = product.sellPrice;
            const profit = calculateProfitSuggestion(price);

            return {
                id: `cj_${product.pid}`,
                title: product.productNameEn,
                imageUrl: product.productImage,
                price,
                currency: 'USD',
                supplierName: 'CJ Dropshipping',
                supplierUrl: product.productUrl || `https://cjdropshipping.com/product/${product.pid}.html`,
                shippingDays: Math.floor(Math.random() * 10) + 3,
                shippingCost: 0,
                profitSuggestion: profit
            };
        });
    }
}

// Export singleton instance
export const cjAdapter = new CJAdapter();
