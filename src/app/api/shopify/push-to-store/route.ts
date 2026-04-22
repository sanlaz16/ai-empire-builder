import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { acquireShopifySlot } from '@/lib/utils/shopifyRateLimit';
import { invalidateCache } from '@/lib/utils/productCache';
import { assertQuota, bumpUsage, assertRateLimit } from '@/lib/usage/guard';
import { verifyPlan, planErrorResponse } from '@/lib/subscription/server';

export async function POST(request: Request) {
    try {
        const { shopifyProductId } = await request.json();

        if (!shopifyProductId) {
            return NextResponse.json({ error: 'Missing shopifyProductId' }, { status: 400 });
        }

        const supabase = createClient();
        const { user, error, status } = await verifyPlan('import_shopify');

        if (error || !user) {
            return planErrorResponse({ error, status });
        }

        // Quotas & Rate Limits
        await assertRateLimit(user.id);
        await assertQuota(user.id, 'push_to_store');

        // Get Shopify connection
        const { data: connection, error: connError } = await supabase
            .from('shopify_connections')
            .select('shop_domain, access_token')
            .eq('user_id', user.id)
            .single();

        if (connError || !connection) {
            return NextResponse.json({ error: 'Shopify not connected' }, { status: 400 });
        }

        const { shop_domain: shopDomain, access_token: accessToken } = connection;
        const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

        // Rate limit
        await acquireShopifySlot(user.id);

        // Push to Shopify Admin API
        const shopifyRes = await fetch(
            `https://${shopDomain}/admin/api/${apiVersion}/products/${shopifyProductId}.json`,
            {
                method: 'PUT',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ product: { id: shopifyProductId, status: 'active' } })
            }
        );

        if (!shopifyRes.ok) {
            const errText = await shopifyRes.text();
            console.error('[PUSH] Shopify error:', errText);
            return NextResponse.json({ error: 'Failed to publish on Shopify' }, { status: 500 });
        }

        // Increment successful push usage
        await bumpUsage(user.id, 'push_to_store');

        // Update status in our DB
        const { error: updateError } = await supabase
            .from('scanned_products')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('shopify_product_id', String(shopifyProductId));

        if (updateError) {
            console.error('[PUSH] DB update error:', updateError);
        }

        // Invalidate cache
        await invalidateCache(user.id);

        return NextResponse.json({ success: true, message: 'Product published to Shopify store!' });

    } catch (e: any) {
        console.error('[PUSH] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
