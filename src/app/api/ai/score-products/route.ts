import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';
import { assertQuota, bumpUsage, assertRateLimit } from '@/lib/usage/guard';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Apply Quotas & Rate limits mapping to User's SaaS Plan
        await assertRateLimit(user.id);
        await assertQuota(user.id, 'optimize'); // AI Scoring technically falls under Optimize usage

        // Fetch user's scanned products that haven't been scored yet (or a batch)
        const { data: products, error: productError } = await supabase
            .from('scanned_products')
            .select('id')
            .limit(20);

        if (productError) throw productError;
        if (!products || products.length === 0) {
            return NextResponse.json({ message: 'No products to score' });
        }

        const productIds = products.map(p => p.id);

        // Trigger background job via Inngest
        await inngest.send({
            name: "app/ai.score-products",
            data: {
                userId: user.id,
                productIds
            }
        });

        // Increment the optimize quota by the number of items successfully queued
        await bumpUsage(user.id, 'optimize', productIds.length);

        return NextResponse.json({
            success: true,
            message: `Background scoring triggered for ${productIds.length} products`,
            count: productIds.length
        });

    } catch (e: any) {
        console.error('[AI/SCORE-PRODUCTS]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
