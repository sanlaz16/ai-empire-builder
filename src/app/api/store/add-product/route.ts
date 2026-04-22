import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { storeId, productId, shopifyProductId, title, imageUrl, price, source } = body;

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let targetProductId = productId;

        // Handle External Product (Shopify) - upsert into product_index
        if (!targetProductId && shopifyProductId && source === 'shopify') {
            // 1. Check if exists
            const { data: existing } = await supabase
                .from('product_index')
                .select('id')
                .eq('source', 'shopify')
                .eq('source_product_id', String(shopifyProductId))
                .single();

            if (existing) {
                targetProductId = existing.id;
            } else {
                // 2. Create new
                // We try to handle price safely
                const safePrice = parseFloat(price) || 0;

                const { data: newProd, error: insertError } = await supabase
                    .from('product_index')
                    .insert({
                        title: title || 'Shopify Product',
                        description: 'Imported from Shopify',
                        source: 'shopify',
                        source_product_id: String(shopifyProductId),
                        price_suggested: safePrice,
                        price_cost: safePrice * 0.4, // Estimate
                        images: imageUrl ? [imageUrl] : [],
                        image_url: imageUrl,
                        category: 'Shopify Import',
                        inventory_status: 'in_stock'
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.error('Failed to create product index for shopify item:', insertError);
                    return NextResponse.json({ error: 'Failed to import product' }, { status: 500 });
                }
                targetProductId = newProd.id;
            }
        }

        if (!storeId || !targetProductId) {
            return NextResponse.json({ error: 'storeId and productId (or shopifyProductId) are required' }, { status: 400 });
        }

        // 3. Link to Store
        const { error } = await supabase
            .from('store_product')
            .insert({
                store_id: storeId,
                product_id: targetProductId,
                status: 'active'
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Product is already in this store' }, { status: 409 });
            }
            console.error('Add to Store Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, productId: targetProductId });

    } catch (e) {
        console.error('Add Store Product Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
