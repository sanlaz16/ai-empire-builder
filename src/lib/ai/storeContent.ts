import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

const SYSTEM_PROMPT = `You are an elite Brazilian e-commerce copywriter and conversion specialist.
You write high-converting product copy for the Brazilian dropshipping market.
Your copy is direct, emotional, benefit-focused, and designed to create impulse purchases.
Always write in Brazilian Portuguese (pt-BR). Be specific, not generic.
Think like a performance marketer who wants the reader to buy NOW.`;

export interface StoreContentInput {
    product: string;
}

export interface StoreContentOutput {
    store_names: string[];
    product_title: string;
    product_description: {
        problem: string;
        solution: string;
        benefits: string;
        social_proof: string;
    };
    bullet_points: string[];
    offers: {
        discount: string;
        bundle: string;
        urgency: string;
    };
    trust_elements: {
        guarantee: string;
        shipping: string;
        security: string;
    };
}

export const StoreContentAI = {
    async generate(input: StoreContentInput): Promise<StoreContentOutput> {
        const prompt = `
Using this product: ${input.product}

Generate complete, copy-paste ready store content for a Brazilian dropshipping store.

Return ONLY a valid JSON object with this EXACT structure:
{
  "store_names": ["Name1", "Name2", "Name3"],
  "product_title": "High-converting product title in Portuguese",
  "product_description": {
    "problem": "2-3 sentences describing the problem this product solves. Emotional, relatable.",
    "solution": "2-3 sentences presenting the product as THE solution. Exciting, confident.",
    "benefits": "2-3 sentences on the key benefits and transformation. Results-focused.",
    "social_proof": "1-2 sentences with social proof tone (e.g. thousands of customers, reviews). Trustworthy."
  },
  "bullet_points": [
    "✅ Benefit 1 — short, punchy, specific",
    "✅ Benefit 2 — short, punchy, specific",
    "✅ Benefit 3 — short, punchy, specific",
    "✅ Benefit 4 — short, punchy, specific",
    "✅ Benefit 5 — short, punchy, specific"
  ],
  "offers": {
    "discount": "A specific discount offer (e.g. 40% OFF hoje + frete grátis)",
    "bundle": "A compelling bundle idea (e.g. Leve 2 pague 1.5 — R$X por unidade)",
    "urgency": "An urgency trigger line (e.g. Apenas 23 unidades disponíveis)"
  },
  "trust_elements": {
    "guarantee": "A strong guarantee statement (e.g. 30-day money back)",
    "shipping": "A reassuring shipping message",
    "security": "A payment security message"
  }
}

Rules:
- Store names must be catchy, brandable, and relevant to the product niche
- Product title must be under 70 characters and conversion-optimized  
- All copy must be in Brazilian Portuguese
- Be specific and emotional, not generic
- Bullet points must start with ✅ and be benefit-focused (not feature-focused)
`;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.8,
                max_tokens: 2000,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty AI response');
            return JSON.parse(content) as StoreContentOutput;
        } catch (e) {
            console.error('[STORE_CONTENT_AI] Failed:', e);
            return getFallbackData(input.product);
        }
    }
};

function getFallbackData(product: string): StoreContentOutput {
    const p = product || 'Produto';
    return {
        store_names: [`${p}Shop Brasil`, `Loja${p.replace(/\s/g, '')}`, `Império${p.split(' ')[0]}`],
        product_title: `${p} — Resultado Garantido em 7 Dias | Frete Grátis`,
        product_description: {
            problem: `Você já se cansou de gastar dinheiro com soluções que não funcionam? Muitas pessoas sofrem com esse problema diariamente sem encontrar uma saída eficaz e acessível.`,
            solution: `O ${p} chegou para mudar isso de uma vez por todas. Com tecnologia avançada e design pensado para o dia a dia brasileiro, ele resolve o problema de forma simples e rápida.`,
            benefits: `Em apenas alguns dias de uso você já começa a sentir a diferença. Mais praticidade, mais qualidade de vida e mais economia no bolso — tudo isso em um único produto.`,
            social_proof: `Mais de 8.000 clientes brasileiros já transformaram sua rotina com o ${p}. A avaliação média é de 4,8 estrelas — veja o que eles estão dizendo!`
        },
        bullet_points: [
            `✅ Resultado visível em até 7 dias ou seu dinheiro de volta`,
            `✅ Design ergonômico pensado para o uso diário`,
            `✅ Material premium de alta durabilidade`,
            `✅ Fácil de usar — sem necessidade de experiência prévia`,
            `✅ Acompanha manual em português e suporte 24h`
        ],
        offers: {
            discount: `🔥 40% OFF apenas hoje + Frete GRÁTIS para todo o Brasil`,
            bundle: `🎁 Kit 2 unidades por R$ 179,90 — economize R$ 59,90 (melhor valor)`,
            urgency: `⚠️ Atenção: Restam apenas 17 unidades no estoque. Pedidos feitos hoje saem amanhã.`
        },
        trust_elements: {
            guarantee: `🛡️ Garantia Total de 30 dias — Se não gostar, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.`,
            shipping: `🚚 Envio Expresso para todo o Brasil. Pedidos aprovados até 18h saem no mesmo dia. Rastreamento em tempo real pelo site.`,
            security: `🔒 Pagamento 100% seguro via Pix, cartão de crédito ou boleto. Seus dados protegidos com criptografia SSL.`
        }
    };
}
