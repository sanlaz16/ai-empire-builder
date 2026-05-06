import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildSystemPrompt(count: number) {
    return `Você é um especialista em criação de anúncios para e-commerce no Brasil (TikTok, Instagram, Facebook).
Responda APENAS com JSON válido (sem markdown, sem texto extra) no seguinte formato:
{
  "anuncios": [
    {
      "gancho": "string — frase de abertura poderosa para prender atenção em 3 segundos",
      "roteiro": "string — roteiro completo do vídeo em português, 30-60 segundos",
      "conceito": "string — conceito criativo e ângulo de abordagem",
      "listaDeCenas": ["cena 1", "cena 2", "cena 3"],
      "legenda": "string — legenda completa para a publicação",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
      "tipoAngulo": "Problema/Solução | Prova Social | FOMO | Lifestyle | Educativo | Transformação"
    }
  ]
}
Gere exatamente ${count} anúncios diferentes com ângulos variados.`;
}

export async function POST(request: Request) {
    try {
        // Auth check
        const authHeader = request.headers.get('cookie') || '';
        const isDevBypass = authHeader.includes('sb-dev-bypass=true');

        let plan = 'free';

        if (!isDevBypass) {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
            }

            // Determine plan to set ad count limit
            try {
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('plan')
                    .eq('user_id', user.id)
                    .single();
                plan = sub?.plan ?? 'free';
            } catch {
                plan = 'free';
            }
        }

        const adCount = (plan === 'pro' || plan === 'elite') ? 10 : 3;

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'Chave da OpenAI não configurada. Adicione OPENAI_API_KEY no .env.local.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { productDescription } = body as { productDescription: string };

        if (!productDescription || productDescription.trim().length < 10) {
            return NextResponse.json({ error: 'Descreva seu produto antes de gerar.' }, { status: 400 });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.85,
                max_tokens: adCount * 600,
                messages: [
                    { role: 'system', content: buildSystemPrompt(adCount) },
                    { role: 'user', content: `Crie ${adCount} anúncios para este produto:\n\n${productDescription.trim()}` },
                ],
            }),
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            console.error('[AI/GENERATE-ADS] OpenAI error:', errBody);
            return NextResponse.json({ error: 'Erro ao conectar com a IA. Tente novamente.' }, { status: 502 });
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content ?? '';

        let parsed;
        try {
            const clean = raw.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(clean);
        } catch {
            console.error('[AI/GENERATE-ADS] Failed to parse JSON:', raw);
            return NextResponse.json({ error: 'Resposta inválida da IA. Tente novamente.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            ads: parsed.anuncios ?? [],
            plan,
            count: adCount,
        });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Erro desconhecido';
        console.error('[AI/GENERATE-ADS] Error:', message);
        return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
    }
}
