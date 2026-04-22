interface ProductData {
    title: string;
    productType: string;
    vendor: string;
    price: string;
    tags: string;
}

interface ListingResult {
    optimizedTitle: string;
    seoTitle: string;
    description: string;
    bullets: string[];
    keywords: string[];
    tiktokHook: string;
    angle: string;
    benefits: string[];
}

/**
 * AI Listing Engine - Simulated Logic
 * In a real scenario, this would call OpenAI/Gemini with the detailed prompt rules.
 */
export async function generateListing(product: ProductData): Promise<ListingResult> {
    // Simulate AI generation delay
    await new Promise(r => setTimeout(r, 1500));

    const titleBase = product.title || 'Product';
    const niche = product.productType || 'Store Item';

    // Rule: Primary Keyword + Benefit + Qualifier
    const optimizedTitle = `${titleBase} – Professional Grade ${niche} for Maximum Performance`;
    const seoTitle = `Buy ${titleBase} | Best ${niche} Online | ${product.vendor}`;

    const description = `
        <p><strong>Are you struggling with generic ${niche.toLowerCase()} solutions?</strong></p>
        <p>Introducing the <strong>${titleBase}</strong>. Designed specifically for individuals who value quality and results, this ${niche.toLowerCase()} bridges the gap between frustration and achievement.</p>
        <h3>Why choose our ${titleBase}?</h3>
        <ul>
            <li>Engineered for durability and long-term use.</li>
            <li>Optimized for ${niche.toLowerCase()} enthusiasts.</li>
            <li>Trusted by thousands of ${product.vendor} customers.</li>
        </ul>
        <p>Don't settle for less. Upgrade your game today with the ${titleBase}.</p>
    `.trim();

    const bullets = [
        `High-Performance Design: Engineered specifically for ${niche.toLowerCase()} tasks.`,
        `Premium Materials: Crafted by ${product.vendor} using top-tier components.`,
        `Results Driven: Designed to solve the most common problems with ${niche.toLowerCase()} products.`,
        `Universal Compatibility: Works seamlessly with your existing setup.`,
        `Satisfaction Guaranteed: Backed by our standard ${product.vendor} warranty.`
    ];

    const keywords = [
        product.productType,
        product.vendor,
        'best ' + product.productType,
        'premium ' + product.productType,
        'affordable ' + titleBase
    ].filter(Boolean);

    const tiktokHook = `You HAVE to see this ${niche.toLowerCase()} hack! 🔥 #cleaninghacks #storefinds`;
    const angle = 'Problem-Solution';
    const benefits = ['Time-saving', 'Durable', 'High-ROI'];

    return {
        optimizedTitle,
        seoTitle,
        description,
        bullets,
        keywords,
        tiktokHook,
        angle,
        benefits
    };
}
