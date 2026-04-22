import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { withRetry } from '@/lib/net/retry';
import { verifyPlan, planErrorResponse } from '@/lib/subscription/server';
import { trackServerEvent } from '@/lib/analytics/track';

const importSchema = z.object({
    supplierSource: z.enum(['DSERS', 'CJ', 'TEMU']),
    supplierProduct: z.object({
        id: z.string(),
        title: z.string(),
        imageUrl: z.string().url(),
        cost: z.number().min(0),
        suggestedPrice: z.number().min(0),
        compareAtPrice: z.number().optional().nullable(),
        tags: z.string().optional().nullable(),
        vendor: z.string().optional().nullable(),
        description: z.string().optional().nullable()
    })
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parse = importSchema.safeParse(body);

        if (!parse.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parse.error.format() }, { status: 400 });
        }

        const { supplierSource, supplierProduct } = parse.data;

        const supabase = createClient();
        const { user, error, status, plan } = await verifyPlan('import_shopify');

        if (error || !user) {
            return planErrorResponse({ error, status });
        }

        // 1. Load Shopify connection for the user (MULTI-TENANT SAFETY)
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

        // 2. IDEMPOTENCY CHECK: Check if already imported
        const { data: existing } = await supabase
            .from('scanned_products')
            .select('id, shopify_product_id')
            .eq('user_id', user.id)
            .eq('supplier_source', supplierSource)
            .eq('supplier_product_id', supplierProduct.id)
            .single();

        if (existing) {
            return NextResponse.json({
                success: true,
                alreadyImported: true,
                message: 'Already imported to your store.',
                shopifyId: existing.shopify_product_id
            });
        }

        // 3. Prepare Shopify Product Payload
        const shopifyPayload = {
            product: {
                title: supplierProduct.title,
                body_html: supplierProduct.description || `<strong>Supplier Source:</strong> ${supplierSource}`,
                vendor: supplierProduct.vendor || supplierSource,
                product_type: 'Dropshipping',
                status: 'active',
                images: [
                    { src: supplierProduct.imageUrl }
                ],
                variants: [
                    {
                        price: supplierProduct.suggestedPrice.toString(),
                        compare_at_price: supplierProduct.compareAtPrice?.toString() || null,
                        sku: `${supplierSource}-${supplierProduct.id}`,
                        inventory_management: 'shopify',
                        option1: 'Default Title'
                    }
                ],
                tags: `EmpireBuilder, ${supplierSource}, ${supplierProduct.tags || ''}`
            }
        };

        // 4. Create Product in Shopify with RETRY logic
        const url = `https://${shopDomain}/admin/api/${apiVersion}/products.json`;

        const responseData = await withRetry(async () => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shopifyPayload)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw { status: res.status, message: errorText };
            }

            return res.json();
        });

        const createdProduct = responseData.product;
        const variant = createdProduct.variants?.[0] || {};

        // 5. Calculate Profit & Margin
        const profit = supplierProduct.suggestedPrice - supplierProduct.cost;
        const margin = supplierProduct.suggestedPrice > 0 ? (profit / supplierProduct.suggestedPrice) * 100 : 0;

        // 6. Persist to scanned_products
        const { data: savedProduct, error: dbError } = await supabase
            .from('scanned_products')
            .insert({
                user_id: user.id,
                shopify_product_id: String(createdProduct.id),
                title: createdProduct.title,
                image_url: supplierProduct.imageUrl,
                price: supplierProduct.suggestedPrice,
                compare_at_price: supplierProduct.compareAtPrice,
                estimated_cost: supplierProduct.cost,
                profit: profit,
                margin_percent: margin,
                status: 'imported', // customized status for imports
                supplier_source: supplierSource,
                supplier_product_id: supplierProduct.id,
                vendor: createdProduct.vendor,
                tags: createdProduct.tags,
                shopify_variant_id: variant.id ? String(variant.id) : null
            })
            .select()
            .single();

        if (dbError) {
            console.error('[IMPORT] DB Error:', dbError);
            // We created it in Shopify but failed to save it locally. 
            // The user will see it next rescan anyway, but we return some info.
        }

        console.log(`[IMPORT] Success: ${createdProduct.title} for user ${user.id}`);

        // Track analytics event
        await trackServerEvent(user.id, 'product_imported', {
            supplier: supplierSource,
            shopifyProductId: String(createdProduct.id),
        });

        return NextResponse.json({
            success: true,
            message: `Product "${createdProduct.title}" imported successfully! 🚀`,
            scannedProduct: savedProduct || { shopify_product_id: String(createdProduct.id) }
        });

    } catch (error: any) {
        console.error('[IMPORT] Pipeline error:', error);
        return NextResponse.json({
            error: error.message || 'Import failed',
            details: error.details || String(error)
        }, { status: 500 });
    }
}
