import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is missing. AI Product Brain will be disabled.');
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

export interface ProductAIInput {
    title: string;
    description?: string;
    tags?: string[];
    price: number | string;
    supplier?: string;
    niche?: string;
}

export interface ProductAIScore {
    niche: string;
    audience: string;
    angle: string;
    pain_point: string;
    trend_score: number;
    virality_score: number;
    margin_score: number;
    competition_score: number;
    overall_score: number;
}

/**
 * AI PRODUCT BRAIN
 * Analyzes products to identify "winners" and target audiences.
 */
export const ProductBrain = {
    /**
     * Scores a product across multiple dimensions using LLM.
     */
    async scoreProduct(product: ProductAIInput): Promise<ProductAIScore> {
        const prompt = `
            Analyze this e-commerce product and provide a "Winning Product Score" (0-100).
            Return ONLY a JSON object with the following fields:
            {
              "niche": "e.g. Pets",
              "audience": "detailed target audience description",
              "angle": "marketing hook/angle",
              "pain_point": "what pain point it solves",
              "trend_score": 0-100,
              "virality_score": 0-100,
              "margin_score": 0-100,
              "competition_score": 0-100,
              "overall_score": 0-100
            }

            PRODUCT DATA:
            Title: ${product.title}
            Description: ${product.description || 'N/A'}
            Price: ${product.price}
            Category: ${product.niche || 'N/A'}
            Tags: ${product.tags?.join(', ') || 'N/A'}
            Supplier: ${product.supplier || 'N/A'}
        `;

        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.2,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty AI response');

            return JSON.parse(content) as ProductAIScore;
        } catch (e: any) {
            console.error('[AI_BRAIN] Scoring failed:', e);
            throw e;
        }
    },

    async detectNiche(product: ProductAIInput): Promise<string> {
        const score = await this.scoreProduct(product);
        return score.niche;
    },

    async suggestAngle(product: ProductAIInput): Promise<string> {
        const score = await this.scoreProduct(product);
        return score.angle;
    }
};
