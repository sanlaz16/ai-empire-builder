import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { error } = await supabase
            .from('shopify_connections')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Disconnect error:', error);
            return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('Disconnect server error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
