import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';
import { rateLimit } from '@/lib/utils/rateLimit';
import { verifyPlan, planErrorResponse } from '@/lib/subscription/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product } = body;

        if (!product || !product.id) {
            return NextResponse.json({ error: 'Missing product data' }, { status: 400 });
        }

        const supabase = createClient();
        const { user, error, status } = await verifyPlan('optimize_ai');

        if (error || !user) {
            return planErrorResponse({ error, status });
        }

        const { data: { user: authUser } } = await supabase.auth.getUser(); // for rates if needed

        // NUCLEAR 25: Rate limit Optimization (3 per minute)
        const { success } = await rateLimit(user.id, 'optimize', 3, 60);
        if (!success) {
            return NextResponse.json({ error: 'Too many optimizations. Please wait.' }, { status: 429 });
        }

        // Trigger background job
        await inngest.send({
            name: "app/ai.optimize-product",
            data: { product }
        });

        return NextResponse.json({
            success: true,
            message: 'Optimization started in the background'
        });

    } catch (e: any) {
        console.error('Optimize API Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { productId, content } = body;

        // 1. Get user session
        const supabase = createClient();
        const { user, error, status } = await verifyPlan('optimize_ai');

        if (error || !user) {
            return planErrorResponse({ error, status });
        }

        // 2. Fetch Shopify credentials
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

        // Update Shopify Product
        const payload = {
            product: {
                id: productId,
                title: content.optimizedTitle,
                body_html: content.description,
                tags: content.keywords.join(', ')
            }
        };

        const response = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/products/${productId}.json`, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Shopify Update Failed: ${err}`);
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error('Apply Optimization Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
