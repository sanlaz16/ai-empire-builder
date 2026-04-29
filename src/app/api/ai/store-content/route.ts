import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StoreContentAI } from '@/lib/ai/storeContent';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { product } = body;

        if (!product || product.trim().length < 3) {
            return NextResponse.json({ error: 'Descreva o produto para continuar.' }, { status: 400 });
        }

        // Allow dev bypass without UUID validation
        const authHeader = request.headers.get('cookie') || '';
        const isDevBypass = authHeader.includes('sb-dev-bypass=true');

        if (!isDevBypass) {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const result = await StoreContentAI.generate({ product: product.trim() });
        return NextResponse.json({ success: true, data: result });

    } catch (e: any) {
        console.error('[AI/STORE-CONTENT] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
