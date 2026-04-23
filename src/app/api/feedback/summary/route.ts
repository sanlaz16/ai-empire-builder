import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch recent feedback for summarization (last 200 items)
        const { data: feedbackItems, error } = await supabase
            .from('beta_feedback')
            .select('type, message, rating, priority, created_at')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw error;
        if (!feedbackItems || feedbackItems.length === 0) {
            return NextResponse.json({ summary: 'No feedback available yet.', stats: {} });
        }

        // Compute stats
        const stats = {
            total: feedbackItems.length,
            byType: {} as Record<string, number>,
            byPriority: {} as Record<string, number>,
            avgRating: 0,
            highPriority: 0,
        };

        let ratingSum = 0;
        let ratingCount = 0;

        for (const item of feedbackItems) {
            stats.byType[item.type] = (stats.byType[item.type] ?? 0) + 1;
            stats.byPriority[item.priority] = (stats.byPriority[item.priority] ?? 0) + 1;
            if (item.rating) { ratingSum += item.rating; ratingCount++; }
            if (item.priority === 'high' || item.priority === 'critical') stats.highPriority++;
        }

        stats.avgRating = ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0;

        // AI Summary (only if OpenAI key is configured)
        let aiSummary: string | null = null;
        if (process.env.OPENAI_API_KEY) {
            try {
                const messagesList = feedbackItems
                    .slice(0, 50)
                    .map((f) => `[${f.type.toUpperCase()}] ${f.message}`)
                    .join('\n');

                const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a product analyst. Analyze user feedback and produce a concise summary with: 1) Top 3 bugs/complaints, 2) Top 3 feature requests, 3) Overall sentiment. Keep it under 200 words.',
                            },
                            { role: 'user', content: messagesList },
                        ],
                        max_tokens: 400,
                    }),
                });

                const aiData = await aiRes.json();
                aiSummary = aiData.choices?.[0]?.message?.content ?? null;
            } catch (e) {
                console.warn('[FEEDBACK/SUMMARY] AI request failed:', e);
            }
        }

        return NextResponse.json({
            stats,
            aiSummary: aiSummary ?? 'Set OPENAI_API_KEY to enable AI summaries.',
        });

    } catch (e: any) {
        console.error('[FEEDBACK/SUMMARY] Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
