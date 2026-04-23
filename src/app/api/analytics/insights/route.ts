import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Fetch a broad sample of recent events for AI analysis
        const { data: recentEvents } = await admin
            .from('analytics_events')
            .select('event, metadata, created_at')
            .order('created_at', { ascending: false })
            .limit(300);

        const { data: subscriptions } = await admin
            .from('subscriptions')
            .select('plan, status, price, created_at, ended_at');

        // Build context for AI
        const eventSummary: Record<string, number> = {};
        for (const e of (recentEvents ?? [])) {
            eventSummary[e.event] = (eventSummary[e.event] ?? 0) + 1;
        }

        const subStats = {
            active: (subscriptions ?? []).filter(s => s.status === 'active').length,
            canceled: (subscriptions ?? []).filter(s => s.status === 'canceled').length,
            plans: (subscriptions ?? []).reduce<Record<string, number>>((acc, s) => {
                acc[s.plan] = (acc[s.plan] ?? 0) + 1; return acc;
            }, {}),
        };

        const contextText = `
Analytics summary for EmpireBuilder SaaS:
- Event counts (last 300 events): ${JSON.stringify(eventSummary)}
- Subscription stats: ${JSON.stringify(subStats)}
`.trim();

        // AI Summary
        let insights = `AI insights require OPENAI_API_KEY to be configured.`;

        if (process.env.OPENAI_API_KEY) {
            try {
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
                                content: 'You are a SaaS growth analyst. Given platform analytics, provide 3–5 concise, actionable insights. Format as bullet points. Keep under 200 words.',
                            },
                            { role: 'user', content: contextText },
                        ],
                        max_tokens: 400,
                    }),
                });
                const aiData = await aiRes.json();
                insights = aiData.choices?.[0]?.message?.content ?? insights;
            } catch (e) {
                console.warn('[ANALYTICS/INSIGHTS] AI request failed:', e);
            }
        }

        return NextResponse.json({
            insights,
            rawContext: contextText,
            eventSummary,
            subStats,
        });

    } catch (e: any) {
        console.error('[ANALYTICS/INSIGHTS]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
