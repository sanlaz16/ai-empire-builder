import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const supabase = createClient();

        // Sign out from Supabase (server-side, clears cookies)
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('API Logout error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Unexpected logout error:', e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
