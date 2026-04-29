import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProductResearchAI } from '@/lib/ai/productResearch';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { niche, audience } = body;

        if (!niche || !audience) {
            return NextResponse.json({ error: 'niche and audience are required' }, { status: 400 });
        }

        // Allow dev bypass (dev-user token) without UUID validation
        const authHeader = request.headers.get('cookie') || '';
        const isDevBypass = authHeader.includes('sb-dev-bypass=true');

        if (!isDevBypass) {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const result = await ProductResearchAI.generateWinningProducts({ niche, audience });
        return NextResponse.json({ success: true, data: result });

    } catch (e: any) {
        console.error('[AI/PRODUCT-RESEARCH] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

