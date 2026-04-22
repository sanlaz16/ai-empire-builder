import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { supplierProductId } = body;

        if (!supplierProductId) {
            return NextResponse.json({ error: 'Missing supplierProductId' }, { status: 400 });
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get Product
        const { data: product, error: fetchError } = await supabase
            .from('supplier_products')
            .select('*')
            .eq('id', supplierProductId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Prepare Shopify Payload
        const { data: connection, error: connError } = await supabase
            .from('shopify_connections')
            .select('shop_domain, access_token')
            .eq('user_id', user.id)
            .single();

        if (connError || !connection) {
            return NextResponse.json({ error: 'Shopify Not Connected' }, { status: 400 });
        }

        const { shop_domain: shopDomain, access_token: accessToken } = connection;
        const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

        // Calculate Price (Simple Logic: Cost + Shipping * 2.5 or fixed margin)
        const cost = Number(product.source_price) + Number(product.shipping_cost);
        const sellingPrice = (cost * 2.5).toFixed(2);

        const payload = {
            product: {
                title: product.title,
                body_html: product.description || `Imported from ${product.supplier_name}`,
                vendor: product.supplier_name,
                product_type: "Imported",
                tags: `imported, ${product.supplier_name}`,
                variants: [
                    {
                        price: sellingPrice,
                        compare_at_price: (cost * 4).toFixed(2), // Fake discount
                        cost: cost.toFixed(2), // Track cost
                        inventory_management: null // Drop shipping usually
                    }
                ],
                images: product.image_url ? [{ src: product.image_url }] : []
            }
        };

        // 3. Send to Shopify
        const shopifyRes = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/products.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!shopifyRes.ok) {
            const errText = await shopifyRes.text();
            console.error('Shopify Import Failed:', errText);
            return NextResponse.json({ error: 'Failed to create product in Shopify' }, { status: 500 });
        }

        const shopifyData = await shopifyRes.json();

        // 4. Update Status
        await supabase
            .from('supplier_products')
            .update({ status: 'imported' })
            .eq('id', supplierProductId);

        return NextResponse.json({ success: true, shopifyId: shopifyData.product.id });

    } catch (e: any) {
        console.error('Import API Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
