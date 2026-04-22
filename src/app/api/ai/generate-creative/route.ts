import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ConversionBrain } from '@/lib/ai/conversion';
import { rateLimit } from '@/lib/utils/rateLimit';

/**
 * /api/ai/generate-creative
 * Generates marketing creatives and stores them in DB.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, type, productData } = body;

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // NUCLEAR 25: Rate limit AI calls (5 per minute)
        const { success, remaining } = await rateLimit(user.id, 'ai-generate', 5, 60);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
        }

        let content;
        switch (type) {
            case 'hook':
                content = await ConversionBrain.generateHooks(productData);
                break;
            case 'ad_copy':
                content = await ConversionBrain.generateAdCopy(productData);
                break;
            case 'ugc_script':
                content = await ConversionBrain.generateUGCScript(productData);
                break;
            default:
                throw new Error('Invalid creative type');
        }

        // Store in DB
        const { data, error } = await supabase
            .from('ai_creatives')
            .insert({
                product_id: productId,
                user_id: user.id,
                type,
                content
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (e: any) {
        console.error('[CREATIVE/GEN] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
