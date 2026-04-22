import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user profile to get niche
        const { data: profile } = await supabase
            .from('profiles')
            .select('city, state, country')
            .eq('user_id', user.id)
            .single();

        // Fetch user's current products
        const { data: storeProducts } = await supabase
            .from('scanned_products')
            .select('title, niche')
            .eq('user_id', user.id)
            .limit(10);

        // Fetch high-score products that user DOESN'T have yet
        // In a real spy tool, this would be a global "winning products" pool.
        // For now, we simulate this by fetching from scanned_products of OTHER users or a fixed pool.
        const { data: globalWinners } = await supabase
            .from('ai_product_scores')
            .select(`
                overall_score,
                niche,
                scanned_products (*)
            `)
            .gt('overall_score', 80)
            .order('overall_score', { ascending: false })
            .limit(5);

        const prompt = `
            You are an expert e-commerce consultant.
            Based on the user's location (${profile?.city}, ${profile?.country}) and current store products,
            recommend the top 3 niches or products they should import next.
            Return ONLY a JSON array of recommendation objects.

            Example Output:
            [
              { "title": "Pet Hair Remover", "niche": "Pets", "reason": "High virality on TikTok and fits your store.", "estimated_margin": "75%" }
            ]

            CURRENT STORE PRODUCTS:
            ${storeProducts?.map(p => p.title).join(', ') || 'None'}
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use 3.5 for quick recommendations
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        return NextResponse.json(JSON.parse(content || '{"recommendations": []}'));

    } catch (e: any) {
        console.error('[AI/RECOMMEND]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
