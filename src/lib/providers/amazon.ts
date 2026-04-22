import type { ProviderAdapter, ProviderSearchRequest, ProviderSearchResponse } from './types';

/**
 * Amazon Affiliate Provider Adapter
 * 
 * Currently DISABLED via feature flag
 * Will be enabled in future phase
 */

export class AmazonAdapter implements ProviderAdapter {
    name = 'amazon';
    private enabled: boolean;

    constructor() {
        this.enabled = process.env.AMAZON_ENABLED === 'true';
    }

    isConfigured(): boolean {
        return false; // Always disabled for now
    }

    async search(request: ProviderSearchRequest): Promise<ProviderSearchResponse> {
        return {
            products: [],
            totalFound: 0,
            provider: this.name,
            error: 'Amazon provider is currently disabled'
        };
    }
}

// Export singleton instance
export const amazonAdapter = new AmazonAdapter();
