import { dsersAdapter } from './dsers';
import { cjAdapter } from './cj';
import { amazonAdapter } from './amazon';
import type { UnifiedProduct, ProviderSearchRequest } from './types';
import { NICHE_KEYWORDS } from './types';
import { getProviderCredentials } from '@/lib/integrations/credentials';

/**
 * Provider Orchestrator
 * Coordinates searches across multiple providers and aggregates results
 */

export interface SearchProductsRequest {
    niche: string;
    limit?: number;
    providers?: ('dsers' | 'cj' | 'amazon')[];
    userId?: string; // For fetching Supabase credentials
}

export interface SearchProductsResponse {
    products: UnifiedProduct[];
    totalFound: number;
    providersUsed: string[];
    warnings: string[];
}

import { searchProductIndex } from '@/lib/productIndex';

/**
 * Search products across multiple providers
 * Now uses productIndex as primary source with real product data
 */
export async function searchProducts(request: SearchProductsRequest): Promise<SearchProductsResponse> {
    const { niche, limit = 24, providers = ['dsers', 'cj'], userId = 'dev-user' } = request;

    console.log(`[searchProducts] Searching for niche: ${niche}, limit: ${limit}`);

    try {
        // Search from product index (real data)
        const indexProducts = await searchProductIndex({
            niche,
            limit,
            sortBy: 'popularity'
        });

        console.log(`[searchProducts] Found ${indexProducts.length} products from index`);

        // If we have products from index, return them
        if (indexProducts.length > 0) {
            return {
                products: indexProducts,
                totalFound: indexProducts.length,
                providersUsed: ['product-index'],
                warnings: []
            };
        }
    } catch (err) {
        console.error('[searchProducts] Error searching index:', err);
    }

    // Fallback: if no products in index for this niche, try providers
    console.log('[searchProducts] No products in index, falling back to providers');

    // Get search keywords for this niche
    const keywords = NICHE_KEYWORDS[niche] || NICHE_KEYWORDS['Custom'];
    const primaryKeyword = keywords[0];

    // Prepare provider search request
    const searchRequest: ProviderSearchRequest = {
        query: primaryKeyword,
        limit: Math.ceil(limit / providers.length)
    };

    // Check credentials from Supabase
    const [dsersCreds, cjCreds] = await Promise.all([
        providers.includes('dsers') ? getProviderCredentials(userId, 'dsers') : null,
        providers.includes('cj') ? getProviderCredentials(userId, 'cj') : null
    ]);

    // Get enabled providers
    const enabledProviders = [];
    const warnings: string[] = [];

    if (providers.includes('dsers')) {
        if (dsersCreds || dsersAdapter.isConfigured()) {
            enabledProviders.push(dsersAdapter);
        }
    }

    if (providers.includes('cj')) {
        if (cjCreds || cjAdapter.isConfigured()) {
            enabledProviders.push(cjAdapter);
        }
    }

    if (providers.includes('amazon') && amazonAdapter.isConfigured()) {
        enabledProviders.push(amazonAdapter);
    }

    // If no providers are configured, use mock data for testing
    if (enabledProviders.length === 0) {
        console.log('No API credentials found, using mock data for development');
        enabledProviders.push(dsersAdapter, cjAdapter);
        warnings.push('Using mock data - Add more products to product index or configure API credentials');
    }

    // Search all providers in parallel
    const searchPromises = enabledProviders.map(provider =>
        provider.search(searchRequest).catch(error => {
            console.error(`Provider ${provider.name} failed:`, error);
            return {
                products: [],
                totalFound: 0,
                provider: provider.name,
                error: error.message
            };
        })
    );

    const results = await Promise.all(searchPromises);

    // Aggregate products from all providers
    let allProducts: UnifiedProduct[] = [];
    const providersUsed: string[] = [];

    for (const result of results) {
        if (result.error) {
            warnings.push(`${result.provider}: ${result.error}`);
        } else {
            allProducts = allProducts.concat(result.products);
            if (result.products.length > 0) {
                providersUsed.push(result.provider);
            }
        }
    }

    // Rank and sort products
    const rankedProducts = rankProducts(allProducts);

    // Limit to requested amount
    const limitedProducts = rankedProducts.slice(0, limit);

    return {
        products: limitedProducts,
        totalFound: allProducts.length,
        providersUsed,
        warnings
    };
}

/**
 * Rank products using scoring algorithm
 * Factors: rating, reviews, price competitiveness, profit margin
 */
function rankProducts(products: UnifiedProduct[]): UnifiedProduct[] {
    return products
        .map(product => ({
            product,
            score: calculateProductScore(product)
        }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
}

/**
 * Calculate product score for ranking
 */
function calculateProductScore(product: UnifiedProduct): number {
    let score = 0;

    // Rating score (0-50 points)
    if (product.rating) {
        score += (product.rating / 5) * 50;
    }

    // Reviews score (0-30 points)
    if (product.reviewsCount) {
        const reviewScore = Math.min(product.reviewsCount / 1000, 1) * 30;
        score += reviewScore;
    }

    // Profit margin score (0-20 points)
    const marginPercent = product.profitSuggestion.marginPercent;
    score += Math.min(marginPercent / 5, 20);

    // Shipping speed bonus (0-10 points)
    if (product.shippingDays) {
        const shippingScore = Math.max(0, 10 - (product.shippingDays / 3));
        score += shippingScore;
    }

    // Price competitiveness (prefer mid-range products)
    if (product.price >= 15 && product.price <= 60) {
        score += 10;
    }

    return score;
}

/**
 * Get provider status
 */
export function getProviderStatus() {
    return {
        dsers: {
            configured: dsersAdapter.isConfigured(),
            name: 'DSers'
        },
        cj: {
            configured: cjAdapter.isConfigured(),
            name: 'CJ Dropshipping'
        },
        amazon: {
            configured: amazonAdapter.isConfigured(),
            name: 'Amazon Affiliate'
        }
    };
}
