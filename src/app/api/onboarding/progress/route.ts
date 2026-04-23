import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/** PATCH /api/onboarding/progress — save current step + data */
export async function PATCH(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { step, selected_niche, store_name, onboarding_completed } = body;

        const updates: Record<string, unknown> = {};
        if (step !== undefined) updates.onboarding_step = step;
        if (selected_niche !== undefined) updates.selected_niche = selected_niche;
        if (store_name !== undefined) updates.store_name = store_name;
        if (onboarding_completed !== undefined) updates.onboarding_completed = onboarding_completed;

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

/** GET /api/onboarding/progress — load saved progress */
export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('onboarding_completed, onboarding_step, selected_niche, store_name, full_name')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return NextResponse.json(profile ?? {});
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
