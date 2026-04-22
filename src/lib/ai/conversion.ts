import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

export interface CreativeInput {
    title: string;
    description?: string;
    niche?: string;
    pain_point?: string;
    angle?: string;
}

/**
 * CONVERSION AI BRAIN
 * Generates high-converting marketing materials for products.
 */
export const ConversionBrain = {
    /**
     * Generates viral hooks for social media ads.
     */
    async generateHooks(product: CreativeInput) {
        const prompt = `
            Generate 5 viral scroll-stopping hooks for this e-commerce product.
            Product: ${product.title}
            Description: ${product.description || 'N/A'}
            Angle: ${product.angle || 'N/A'}
            
            Return ONLY a JSON array of strings.
        `;
        return this._callAI(prompt, 'json_array');
    },

    /**
     * Generates high-converting ad copy for Facebook/Instagram.
     */
    async generateAdCopy(product: CreativeInput) {
        const prompt = `
            Write a high-converting Facebook Ad copy for:
            Product: ${product.title}
            Description: ${product.description || 'N/A'}
            Angle: ${product.angle || 'N/A'}
            Pain Point: ${product.pain_point || 'N/A'}
            
            Format:
            - Primary Text (Emotion-driven)
            - Headline (Benefit-driven)
            - Description (Urgency-driven)
            
            Return ONLY a JSON object with fields: primary_text, headline, description.
        `;
        return this._callAI(prompt, 'json_object');
    },

    /**
     * Generates a TikTok UGC script.
     */
    async generateUGCScript(product: CreativeInput) {
        const prompt = `
            Write a 30-second TikTok UGC script for:
            Product: ${product.title}
            
            Include:
            - 0-3s: The Hook
            - 3-15s: Problem/Solution
            - 15-25s: Social Proof/Demonstration
            - 25-30s: CTA
            
            Return ONLY a JSON object with fields: hook, body, cta, notes.
        `;
        return this._callAI(prompt, 'json_object');
    },

    /**
     * Internal helper to call OpenAI
     */
    async _callAI(prompt: string, format: 'json_object' | 'json_array') {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: format === 'json_object' ? 'json_object' : 'text' }, // json_array isn't a native type, we parse it
                temperature: 0.7,
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty AI response');

            return JSON.parse(content);
        } catch (e) {
            console.error('[CONVERSION_AI] Failed:', e);
            throw e;
        }
    }
};
