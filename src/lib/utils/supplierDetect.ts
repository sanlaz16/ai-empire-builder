/**
 * Supplier Detection Engine
 * Infers supplier from Shopify product metadata.
 * Returns supplier name and confidence level.
 */

export type SupplierName = 'DSers' | 'CJ' | 'Temu' | 'Shopify';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SupplierDetectionResult {
    supplier: SupplierName;
    confidence: ConfidenceLevel;
}

export function detectSupplier(product: {
    vendor?: string;
    tags?: string;
    title?: string;
    product_type?: string;
}): SupplierDetectionResult {
    const vendor = product.vendor?.toLowerCase() || '';
    const tags = product.tags?.toLowerCase() || '';
    const title = product.title?.toLowerCase() || '';
    const type = product.product_type?.toLowerCase() || '';

    // --- HIGH CONFIDENCE: DSers / AliExpress ---
    if (
        vendor.includes('dsers') ||
        vendor.includes('aliexpress') ||
        vendor.includes('ali express')
    ) {
        return { supplier: 'DSers', confidence: 'high' };
    }

    // --- HIGH CONFIDENCE: CJ Dropshipping ---
    if (
        vendor.includes('cj') ||
        vendor.includes('cjdropshipping') ||
        vendor.includes('cj dropshipping')
    ) {
        return { supplier: 'CJ', confidence: 'high' };
    }

    // --- MEDIUM CONFIDENCE: Temu (usually via DSers) ---
    if (
        vendor.includes('temu') ||
        tags.includes('temu') ||
        title.includes('temu')
    ) {
        return { supplier: 'Temu', confidence: 'medium' };
    }

    // --- MEDIUM CONFIDENCE: DSers by tag pattern ---
    if (
        tags.includes('dsers') ||
        tags.includes('aliexpress') ||
        type.includes('dropship')
    ) {
        return { supplier: 'DSers', confidence: 'medium' };
    }

    // --- LOW CONFIDENCE: CJ by tag ---
    if (tags.includes('cj')) {
        return { supplier: 'CJ', confidence: 'low' };
    }

    // Fallback
    return { supplier: 'Shopify', confidence: 'low' };
}
