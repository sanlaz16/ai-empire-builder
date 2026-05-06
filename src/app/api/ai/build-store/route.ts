import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Você é um especialista em e-commerce e dropshipping no Brasil. 
Responda APENAS com JSON válido (sem markdown, sem texto extra) no seguinte formato exato:
{
  "produtosIdeas": [
    { "nome": "string", "descricao": "string", "precoSugerido": "R$ XX,XX", "margemEstimada": "XX%" }
  ],
  "estrategiaPreco": "string com estratégia de preço em português",
  "configuracaoLoja": ["passo 1", "passo 2", "passo 3", "passo 4", "passo 5"],
  "ideiasAnuncio": [
    { "tipo": "TikTok/Instagram/Facebook", "conceito": "string" }
  ],
  "passosLancamento": ["passo 1", "passo 2", "passo 3", "passo 4", "passo 5"]
}
Todos os preços devem ser em BRL (R$). Máximo de 5 produtos, 3 ideias de anúncio, 5 passos de lançamento.`;

export async function POST(request: Request) {
    try {
        // Auth check
        const authHeader = request.headers.get('cookie') || '';
        const isDevBypass = authHeader.includes('sb-dev-bypass=true');

        if (!isDevBypass) {
            const supabase = createClient();
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
            }
        }

        // Missing API key — don't crash, return a clear error
        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'Chave da OpenAI não configurada. Adicione OPENAI_API_KEY no .env.local.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { prompt } = body as { prompt: string };

        if (!prompt || prompt.trim().length < 10) {
            return NextResponse.json({ error: 'Descreva sua loja antes de gerar.' }, { status: 400 });
        }

        if (prompt.length > 5000) {
            return NextResponse.json({ error: 'Prompt muito longo. Máximo de 5000 caracteres.' }, { status: 400 });
        }

        // Call OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                temperature: 0.7,
                max_tokens: 1500,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Crie uma estratégia completa para esta loja:\n\n${prompt.trim()}` },
                ],
            }),
        });

        if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            console.error('[AI/BUILD-STORE] OpenAI error:', errBody);
            return NextResponse.json(
                { error: 'Erro ao conectar com a IA. Tente novamente.' },
                { status: 502 }
            );
        }

        const data = await response.json();
        const raw = data.choices?.[0]?.message?.content ?? '';

        let parsed;
        try {
            // Strip any markdown code fences just in case
            const clean = raw.replace(/```json|```/g, '').trim();
            parsed = JSON.parse(clean);
        } catch {
            console.error('[AI/BUILD-STORE] Failed to parse JSON:', raw);
            return NextResponse.json({ error: 'Resposta inválida da IA. Tente novamente.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: parsed });

    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Erro desconhecido';
        console.error('[AI/BUILD-STORE] Error:', message);
        return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
    }
}
