import { Product } from '@/lib/db';
import { callAIJson, getLLMProviderInfo } from '@/lib/ai/llm';
import { MASTER_AI_PROMPT, NICHE_GUIDANCE } from '@/lib/ai/masterPrompt';

/**
 * AI Response Schema for Product Generation
 */
interface AIProductResponse {
    products: {
        name: string;
        description: string;
        category?: string;
        baseCost: number;
        sellingPrice: number;
        profitMarginPercent: number;
        imageUrl?: string;
        whyItSells?: string;
        source?: string;
    }[];
}

/**
 * Generate mock products (fallback when AI is unavailable)
 */
function generateMockProducts(niche: string, count: number = 12): Product[] {
    const effectiveNiche = niche === 'Mixed' ? ['Tech', 'Home', 'Beauty', 'Pets'][Math.floor(Math.random() * 4)] : niche;

    return Array.from({ length: count }).map((_, i) => ({
        id: Math.floor(Math.random() * 100000) + i,
        name: `${effectiveNiche} ${['Pro', 'Ultra', 'Max', 'Lite', 'X', 'Air'][Math.floor(Math.random() * 6)]} ${['Gadget', 'Tool', 'Device', 'Kit', 'Set'][Math.floor(Math.random() * 5)]}`,
        niche: effectiveNiche,
        supplier: ['DSers', 'CJ Dropshipping', 'Zendrop', 'Spocket'][Math.floor(Math.random() * 4)],
        costPrice: (Math.random() * 50 + 5).toFixed(2),
        sellingPrice: (Math.random() * 100 + 20).toFixed(2),
        profitMargin: (Math.random() * 40 + 20).toFixed(0) + '%',
        score: (Math.random() * 1.5 + 3.5).toFixed(1),
        description: `High demand ${effectiveNiche} product with viral potential.`
    }));
}

/**
 * Map AI response to Product type
 */
function mapAIToProducts(aiResponse: AIProductResponse, niche: string): Product[] {
    return aiResponse.products.map((p, i) => {
        const costPrice = p.baseCost || (Math.random() * 50 + 5);
        const sellingPrice = p.sellingPrice || (costPrice * 2.5);
        const margin = ((sellingPrice - costPrice) / sellingPrice * 100);

        return {
            id: Date.now() + i,
            name: p.name || `${niche} Product ${i + 1}`,
            niche: niche,
            supplier: p.source === 'shopify_dsers' ? 'DSers' :
                p.source === 'cj' ? 'CJ Dropshipping' :
                    ['DSers', 'CJ Dropshipping'][Math.floor(Math.random() * 2)],
            costPrice: costPrice.toFixed(2),
            sellingPrice: sellingPrice.toFixed(2),
            profitMargin: margin.toFixed(0) + '%',
            score: ((4 + Math.random() * 1.5) * (margin / 50)).toFixed(1), // Score based on margin
            description: p.description || p.whyItSells || `Premium ${niche} product with high demand.`
        };
    });
}

/**
 * Generate products using AI or fallback to mock
 */
export const generateProducts = async (niche: string, filters: string): Promise<Product[]> => {
    const providerInfo = getLLMProviderInfo();

    console.log(`[ProductGenerator] Niche: ${niche}, Provider: ${providerInfo.provider}, Model: ${providerInfo.model || 'N/A'}`);

    // Try AI generation first
    if (providerInfo.provider !== 'mock') {
        try {
            // Build user prompt with niche guidance
            const nicheGuidance = NICHE_GUIDANCE[niche as keyof typeof NICHE_GUIDANCE];
            const userPrompt = `
Generate 8-10 winning products for the following niche:

NICHE: ${niche}
${filters ? `FILTERS: ${filters}` : ''}

${nicheGuidance ? `
BUYER PSYCHOLOGY: ${nicheGuidance.buyerPsychology}
VISUAL FOCUS: ${nicheGuidance.visualFocus}
PRICE RANGE: ${nicheGuidance.priceRange}
KEYWORDS: ${nicheGuidance.keywords.join(', ')}
` : ''}

REQUIREMENTS:
- All products must be available on DSers (Shopify dropshipping)
- Focus on products that can sell within 24-48 hours
- Ensure 40-60% profit margins
- Include realistic pricing based on current market
- Provide compelling descriptions that highlight benefits

Return ONLY valid JSON matching the schema. No explanations.
            `.trim();

            const aiResponse = await callAIJson<AIProductResponse>({
                systemPrompt: MASTER_AI_PROMPT,
                userPrompt,
                schemaName: 'product_generation',
                userId: 'product-finder' // Could pass real userId here
            });

            // Validate response has products
            if (!aiResponse.products || !Array.isArray(aiResponse.products) || aiResponse.products.length === 0) {
                throw new Error('AI returned no products');
            }

            console.log(`[ProductGenerator] AI success - generated ${aiResponse.products.length} products`);
            return mapAIToProducts(aiResponse, niche);

        } catch (error) {
            console.warn('[ProductGenerator] AI generation failed, falling back to mock:', error);
            // Fall through to mock generation
        }
    }

    // Fallback to mock generation
    console.log('[ProductGenerator] Using mock product generation');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API latency
    return generateMockProducts(niche, 12);
};

