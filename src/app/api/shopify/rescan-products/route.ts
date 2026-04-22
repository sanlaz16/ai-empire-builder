import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { detectSupplier } from '@/lib/utils/supplierDetect';
import { calculateMargins } from '@/lib/utils/margins';
import { invalidateCache } from '@/lib/utils/productCache';
import { acquireShopifySlot } from '@/lib/utils/shopifyRateLimit';
import { rateLimit } from '@/lib/utils/rateLimit';
import { assertQuota, bumpUsage, assertRateLimit } from '@/lib/usage/guard';
import { getJson, setJson, getShopifyScanKey } from '@/lib/cache';
import { withRetry } from '@/lib/net/retry';

export async function POST() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Apply Quotas & Rate limits mapping to User's SaaS Plan
        await assertRateLimit(user.id);
        await assertQuota(user.id, 'rescan');

        // NUCLEAR 25: Rate limit Rescan (1 per minute local barrier)
        const { success } = await rateLimit(user.id, 'rescan', 1, 60);
        if (!success) {
            return NextResponse.json({ error: 'Rescan already in progress. Please wait a minute.' }, { status: 429 });
        }

        // Fetch user's Shopify connection (includes last_scan_at for delta scan)
        const { data: connection, error: connError } = await supabase
            .from('shopify_connections')
            .select('shop_domain, access_token, last_scan_at')
            .eq('user_id', user.id)
            .single();

        if (connError || !connection) {
            return NextResponse.json({ error: 'Shopify not connected' }, { status: 400 });
        }

        const { shop_domain: shopDomain, access_token: accessToken, last_scan_at: lastScanAt } = connection;
        const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

        // --- PHASE B: Attempt Cache Read ---
        const cacheKey = getShopifyScanKey(user.id, shopDomain, 'rescan');
        const cachedResults = await getJson<any>(cacheKey);
        if (cachedResults) {
            console.log(`[RESCAN] Cache Hit for ${user.id} on ${shopDomain}`);
            return NextResponse.json({
                ...cachedResults,
                cached: true
            });
        }

        // --- Fetch User Profit Defaults ---
        const { data: profile } = await supabase
            .from('profiles')
            .select('default_cost_percentage, default_shipping_cost, fee_percentage, fee_fixed')
            .eq('id', user.id)
            .single();

        const defaults = {
            costPct: parseFloat(profile?.default_cost_percentage ?? '40.0') / 100,
            shipping: parseFloat(profile?.default_shipping_cost ?? '0.0'),
            feePct: parseFloat(profile?.fee_percentage ?? '3.0') / 100,
            feeFixed: parseFloat(profile?.fee_fixed ?? '0.30')
        };

        // --- NUCLEAR 13 PART 1: Rate limit Shopify call ---
        await acquireShopifySlot(user.id);

        // --- NUCLEAR 13 PART 2: Delta scan — only fetch products updated since last scan ---
        let url = `https://${shopDomain}/admin/api/${apiVersion}/products.json?limit=250&status=any`;
        if (lastScanAt) {
            const sinceDate = new Date(lastScanAt).toISOString();
            url += `&updated_at_min=${encodeURIComponent(sinceDate)}`;
        }

        // --- PHASE D: Fetch with Retry ---
        const data = await withRetry(async () => {
            const res = await fetch(url, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw { status: res.status, message: errorText };
            }
            return res.json();
        });

        const shopifyProducts: any[] = data.products || [];

        if (shopifyProducts.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: 'Store is up to date.',
                newProducts: []
            });
        }

        // --- Build upsert rows ---
        const rows = shopifyProducts.map((p: any) => {
            const { supplier, confidence } = detectSupplier({
                vendor: p.vendor,
                tags: p.tags,
                title: p.title,
                product_type: p.product_type
            });

            const variant = p.variants?.[0] || {};
            const price = parseFloat(variant.price || '0');
            const compareAtPrice = variant.compare_at_price ? parseFloat(variant.compare_at_price) : null;

            // Calculate dynamic costs
            const estimatedCost = compareAtPrice ? compareAtPrice * (defaults.costPct * 1.5) : price * defaults.costPct;
            const gatewayFees = (price * defaults.feePct) + defaults.feeFixed;

            const { profit, margin } = calculateMargins(estimatedCost, defaults.shipping, price, gatewayFees);

            return {
                user_id: user.id,
                shopify_product_id: String(p.id),
                title: p.title,
                description: p.body_html || null,
                image_url: p.image?.src || p.images?.[0]?.src || null,
                price: price,
                compare_at_price: compareAtPrice,
                estimated_cost: estimatedCost,
                profit: parseFloat(profit),
                margin_percent: parseFloat(margin),
                status: p.status || 'active',
                supplier_source: supplier,
                supplier_confidence: confidence,
                vendor: p.vendor || null,
                tags: p.tags || null,
                product_type: p.product_type || null,
                shopify_variant_id: variant.id ? String(variant.id) : null,
                updated_at: new Date().toISOString()
            };
        });

        // --- Upsert to scanned_products ---
        const { error: upsertError } = await supabase
            .from('scanned_products')
            .upsert(rows, { onConflict: 'user_id,shopify_product_id' });

        if (upsertError) {
            console.error('[RESCAN] Upsert error:', upsertError);
            return NextResponse.json({ error: 'Failed to store products' }, { status: 500 });
        }

        // --- Update last_scan_at on connection ---
        await supabase
            .from('shopify_connections')
            .update({ last_scan_at: new Date().toISOString() })
            .eq('user_id', user.id);

        // --- NUCLEAR 13 PART 3: Invalidate product cache for this user ---
        await invalidateCache(user.id);

        console.log(`[RESCAN] Upserted ${rows.length} products for user ${user.id}`);

        const responseData = {
            success: true,
            count: rows.length,
            message: `${rows.length} products synced 🚀`,
            newProducts: rows.slice(0, 5) // Return first 5 for UI feedback
        };

        // --- Store in Cache (5 min TTL) ---
        await setJson(cacheKey, responseData, 300);

        return NextResponse.json({
            ...responseData,
            cached: false
        });

    } catch (error) {
        console.error('[RESCAN] Internal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
