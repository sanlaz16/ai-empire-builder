import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest';
import { rateLimit } from '@/lib/utils/rateLimit';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { supplier } = body;

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // NUCLEAR 25: Rate limit Sync (2 per minute)
        const { success } = await rateLimit(user.id, 'supplier-sync', 2, 60);
        if (!success) {
            return NextResponse.json({ error: 'Sync already in progress or too many requests.' }, { status: 429 });
        }

        // Trigger background job via Inngest
        await inngest.send({
            name: "app/supplier.sync",
            data: {
                userId: user.id,
                supplier: supplier || 'DSers'
            }
        });

        return NextResponse.json({
            success: true,
            message: `Background sync triggered for ${supplier || 'DSers'}`
        });

    } catch (e: any) {
        console.error('[SUPPLIER/SYNC] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
