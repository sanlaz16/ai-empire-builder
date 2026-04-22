import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, getProviderStatus } from '@/lib/providers';

/**
 * POST /api/products/recommend
 * Search for products across multiple providers
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { niche, limit = 24, providers } = body;

        // Get user ID from headers (or use dev-user as fallback)
        const userId = request.headers.get('x-user-id') || 'dev-user';

        // Validate niche
        if (!niche || typeof niche !== 'string') {
            return NextResponse.json(
                { error: 'Niche is required' },
                { status: 400 }
            );
        }

        // Search products with userId for credential lookup
        const result = await searchProducts({
            niche,
            limit,
            providers,
            userId
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Product recommendation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch products',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/products/recommend
 * Get provider status
 */
export async function GET() {
    try {
        const status = getProviderStatus();
        return NextResponse.json(status);
    } catch (error) {
        console.error('Provider status error:', error);
        return NextResponse.json(
            { error: 'Failed to get provider status' },
            { status: 500 }
        );
    }
}
