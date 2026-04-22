import type { ProviderAdapter, ProviderSearchRequest, ProviderSearchResponse, UnifiedProduct } from './types';
import { calculateProfitSuggestion } from './types';
import { fetchWithRetry, handleProviderError, parseErrorResponse } from '@/lib/http/client';
import { checkRateLimit } from '@/lib/http/rateLimiter';

/**
 * DSers Provider Adapter
 * Shopify + DSers dropshipping integration
 * Supports real API calls with credentials or fallback to mock data
 */

interface DsersProduct {
    product_id: string;
    product_title: string;
    product_main_image_url: string;
    target_sale_price: string;
    evaluate_rate: string;
    product_detail_url: string;
    lastest_volume?: number;
}

export interface DsersCredentials {
    apiKey: string;
}

export class DsersAdapter implements ProviderAdapter {
    name = 'dsers';
    private apiKey: string | undefined;
    private baseUrl: string;
    private credentials: DsersCredentials | null = null;
    private userId: string | null = null;

    constructor(credentials?: DsersCredentials, userId?: string) {
        this.credentials = credentials || null;
        this.userId = userId || null;
        this.apiKey = credentials?.apiKey || process.env.DSERS_API_KEY;
        this.baseUrl = process.env.DSERS_API_ENDPOINT || 'https://api.dsers.com/v1';
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    async search(request: ProviderSearchRequest): Promise<ProviderSearchResponse> {
        // Check rate limit
        if (this.userId) {
            const rateLimit = checkRateLimit(this.userId, 'dsers');
            if (!rateLimit.allowed) {
                return {
                    products: [],
                    totalFound: 0,
                    provider: this.name,
                    error: `Rate limit exceeded. ${rateLimit.remaining} requests remaining.`
                };
            }
        }

        try {
            // Try real API if configured
            if (this.isConfigured()) {
                try {
                    const products = await this.realSearch(request);
                    return {
                        products,
                        totalFound: products.length,
                        provider: this.name
                    };
                } catch (apiError) {
                    console.error('DSers API error, falling back to mock:', apiError);
                    // Fall back to mock on API error
                }
            }

            // Use mock data as fallback
            const products = await this.mockSearch(request);
            return {
                products,
                totalFound: products.length,
                provider: this.name
            };
        } catch (error) {
            console.error('DSers search error:', error);
            return {
                products: [],
                totalFound: 0,
                provider: this.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Real API search implementation
     * Configure DSERS_API_ENDPOINT in .env.local
     */
    private async realSearch(request: ProviderSearchRequest): Promise<UnifiedProduct[]> {
        const { query, limit = 12, minRating, maxPrice } = request;

        console.log(`[DSers] Searching for "${query}" (limit: ${limit})`);

        try {
            const response = await fetchWithRetry(`${this.baseUrl}/products/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    keywords: query,
                    page_size: limit,
                    min_price: 0,
                    max_price: maxPrice || 1000,
                    sort: 'orders_desc',
                    min_rating: minRating || 0
                }),
                timeout: 10000,
                retries: 1
            });

            if (!response.ok) {
                const errorMsg = await parseErrorResponse(response);
                throw new Error(`DSers API error (${response.status}): ${errorMsg}`);
            }

            const data = await response.json();
            const products = data.products || data.result?.products || [];

            console.log(`[DSers] Found ${products.length} products`);

            return this.normalizeProducts(products);
        } catch (error) {
            const errorInfo = handleProviderError(error, 'DSers');
            console.error(`[DSers] ${errorInfo.message}`);
            throw error;
        }
    }

    /**
     * Mock search for development
     * Replace this with real API call when credentials are available
     */
    private async mockSearch(request: ProviderSearchRequest): Promise<UnifiedProduct[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const { query, limit = 12 } = request;

        // Generate mock products based on query
        const mockProducts: UnifiedProduct[] = Array.from({ length: Math.min(limit, 8) }, (_, i) => {
            const basePrice = Math.random() * 40 + 10; // $10-$50
            const profit = calculateProfitSuggestion(basePrice);

            return {
                id: `dsers_${Date.now()}_${i}`,
                title: `${query} - Premium Quality (DSers)`,
                imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?auto=format&fit=crop&w=600&q=80`,
                price: Math.round(basePrice * 100) / 100,
                currency: 'USD',
                rating: 4 + Math.random(),
                reviewsCount: Math.floor(Math.random() * 5000) + 100,
                supplierName: 'AliExpress / DSers',
                supplierUrl: `https://www.aliexpress.com/item/${Date.now()}.html`,
                shippingDays: Math.floor(Math.random() * 15) + 7,
                shippingCost: 0,
                profitSuggestion: profit
            };
        });

        return mockProducts;
    }


    /**
     * Normalize DSers response to UnifiedProduct format
     */
    private normalizeProducts(products: DsersProduct[]): UnifiedProduct[] {
        return products.map(product => {
            const price = parseFloat(product.target_sale_price);
            const profit = calculateProfitSuggestion(price);

            return {
                id: `ali_${product.product_id}`,
                title: product.product_title,
                imageUrl: product.product_main_image_url,
                price,
                currency: 'USD',
                rating: parseFloat(product.evaluate_rate) || undefined,
                reviewsCount: product.lastest_volume,
                supplierName: 'AliExpress / DSers',
                supplierUrl: product.product_detail_url,
                shippingDays: Math.floor(Math.random() * 15) + 7, // Estimate
                shippingCost: 0,
                profitSuggestion: profit
            };
        });
    }
}

// Export singleton instance
export const dsersAdapter = new DsersAdapter();
