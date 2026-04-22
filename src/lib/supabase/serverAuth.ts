import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Shared auth guard for API routes.
 * Returns { user, supabase } on success, or a NextResponse 401 on failure.
 *
 * Usage:
 *   const authResult = await requireAuth();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { user, supabase } = authResult;
 */
export async function requireAuth(): Promise<
    { user: User; supabase: ReturnType<typeof createClient> } | NextResponse
> {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    return { user, supabase };
}
