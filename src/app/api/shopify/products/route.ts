import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCached, setCached, productCacheKey } from '@/lib/utils/productCache';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query')?.toLowerCase() || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- NUCLEAR 13 PART 3: Check cache ---
        const cacheKey = productCacheKey(user.id, `${query}:${page}`);
        const cached = await getCached<any[]>(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // --- Serve from scanned_products (DB) with AI scores ---
        let dbQuery = supabase
            .from('scanned_products')
            .select(`
                *,
                ai_product_scores (
                    trend_score,
                    margin_score,
                    virality_score,
                    competition_score,
                    overall_score,
                    niche,
                    audience,
                    angle,
                    pain_point
                )
            `)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply text search filter if provided
        if (query) {
            dbQuery = dbQuery.or(
                `title.ilike.%${query}%,tags.ilike.%${query}%,vendor.ilike.%${query}%,product_type.ilike.%${query}%`
            );
        }

        const { data: products, error: dbError } = await dbQuery;

        if (dbError) {
            console.error('[PRODUCTS] DB Error:', dbError);
            return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
        }

        if (!products || products.length === 0) {
            return NextResponse.json([]);
        }

        // Normalize to frontend Product shape
        const normalized = products.map((p: any) => ({
            id: p.shopify_product_id,
            title: p.title,
            imageUrl: p.image_url,
            price: parseFloat(p.price || 0).toFixed(2),
            compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price).toFixed(2) : null,
            estimatedCost: p.estimated_cost ? parseFloat(p.estimated_cost).toFixed(2) : null,
            profit: p.profit ? parseFloat(p.profit).toFixed(2) : null,
            margin: p.margin_percent ? parseFloat(p.margin_percent).toFixed(1) : null,
            status: p.status,
            vendor: p.vendor,
            productType: p.product_type,
            tags: p.tags,
            source: 'scanned',
            detectedSupplier: p.supplier_source,
            supplierConfidence: p.supplier_confidence,
            supplier_price: p.supplier_price,
            shipping_cost: p.shipping_cost,
            supplier_stock: p.supplier_stock,
            supplier_rating: p.supplier_rating,
            supplier_orders: p.supplier_orders,
            supplier_url: p.supplier_url,
            isAiOptimized: false,
            aiScore: p.ai_product_scores?.[0] || p.ai_product_scores || null
        }));

        // Store in cache
        await setCached(cacheKey, normalized);

        return NextResponse.json(normalized);

    } catch (error) {
        console.error('[PRODUCTS] Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
