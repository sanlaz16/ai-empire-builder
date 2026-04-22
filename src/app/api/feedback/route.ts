import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackServerEvent } from '@/lib/analytics/track';

const RATE_LIMIT_PER_HOUR = 10;

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limit: max 10 submissions per hour per user
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabase
            .from('beta_feedback')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', oneHourAgo);

        if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
            return NextResponse.json(
                { error: 'Too many submissions. Please wait before sending more feedback.' },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { type, message, rating, page } = body;

        // Validate
        if (!type || !message) {
            return NextResponse.json({ error: 'type and message are required' }, { status: 400 });
        }
        if (!['bug', 'suggestion', 'improvement', 'complaint'].includes(type)) {
            return NextResponse.json({ error: 'Invalid feedback type' }, { status: 400 });
        }
        if (message.trim().length < 5) {
            return NextResponse.json({ error: 'Message is too short' }, { status: 400 });
        }
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Insert — priority is set automatically by DB trigger
        const { data, error } = await supabase
            .from('beta_feedback')
            .insert({
                user_id: user.id,
                type,
                message: message.trim().slice(0, 2000), // cap at 2000 chars
                rating: rating ?? null,
                page: page ?? null,
            })
            .select('id, priority')
            .single();

        if (error) {
            console.error('[FEEDBACK] DB insert error:', error);
            return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
        }

        // Fire analytics event (non-blocking)
        await trackServerEvent(user.id, 'feedback_submitted', { type, rating: rating ?? null });

        return NextResponse.json({
            success: true,
            id: data.id,
            priority: data.priority,
            message: 'Thanks — this helps us improve the platform.',
        });

    } catch (e: any) {
        console.error('[FEEDBACK] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
