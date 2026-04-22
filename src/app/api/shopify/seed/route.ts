import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
        const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
        const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

        if (!shopDomain || !accessToken) {
            return NextResponse.json(
                { error: 'Missing Shopify Credentials in .env.local' },
                { status: 500 }
            );
        }

        const url = `https://${shopDomain}/admin/api/${apiVersion}/products.json`;

        const createdProducts = [];
        const count = 20;

        // Static Image (Dog Bed) - High quality unsplash
        const imageUrl = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';

        for (let i = 1; i <= count; i++) {
            const price = (29.99 + (Math.random() * 70)).toFixed(2);

            const payload = {
                product: {
                    title: `Premium Orthopedic Dog Bed ${i}`,
                    body_html: "<strong>Ultimate comfort for your furry friend.</strong><br>Memory foam base, washable cover, and non-slip bottom.",
                    vendor: "DSers",
                    product_type: "Pets",
                    tags: "pets, dog bed, orthopedic, demo",
                    images: [
                        { src: imageUrl }
                    ],
                    variants: [
                        {
                            price: price,
                            inventory_management: null, // Don't track inventory
                            option1: "Large",
                            sku: `DEMO-BED-${i}`
                        }
                    ]
                }
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                createdProducts.push({
                    id: data.product.id,
                    title: data.product.title,
                    handle: data.product.handle
                });
            } else {
                console.error(`Failed to create product ${i}:`, await res.text());
                // Continue despite error to try others
            }

            // Tiny delay to be nice to API limits (though 20 is small)
            await new Promise(r => setTimeout(r, 200));
        }

        return NextResponse.json({
            success: true,
            createdCount: createdProducts.length,
            products: createdProducts
        });

    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
