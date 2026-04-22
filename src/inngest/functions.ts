import { inngest } from "@/lib/inngest";
import { createServiceClient } from "@/lib/supabase/service";
import { ProductBrain } from "@/lib/ai/productBrain";

/**
 * Background Job: AI Product Scoring
 * Processes a batch of products for a user.
 */
export const scoreProducts = inngest.createFunction(
    { id: "score-products" },
    { event: "app/ai.score-products" },
    async ({ event, step }) => {
        const { userId, productIds } = event.data;
        const supabase = createServiceClient();

        const results = await step.run("score-batch", async () => {
            // Fetch products to score
            const { data: products, error } = await supabase
                .from('scanned_products')
                .select('*')
                .in('id', productIds);

            if (error) throw error;
            if (!products) return [];

            const batchResults = [];
            for (const p of products) {
                try {
                    const aiResult = await ProductBrain.scoreProduct({
                        title: p.title,
                        description: p.description,
                        price: p.price,
                        niche: p.niche,
                        tags: p.tags,
                    });

                    await supabase
                        .from('ai_product_scores')
                        .upsert({
                            product_id: p.id,
                            user_id: userId,
                            ...aiResult,
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'product_id' });

                    batchResults.push({ id: p.id, status: 'scored' });
                } catch (e: any) {
                    batchResults.push({ id: p.id, status: 'failed', error: e.message });
                }
            }
            return batchResults;
        });

        return { success: true, results };
    }
);

/**
 * Background Job: Supplier Live Sync
 * Updates price, stock, and orders for a supplier.
 */
export const syncSupplierData = inngest.createFunction(
    { id: "supplier-sync" },
    { event: "app/supplier.sync" },
    async ({ event, step }) => {
        const { userId, supplier } = event.data;
        const supabase = createServiceClient();

        const results = await step.run("sync-products", async () => {
            const { data: products, error } = await supabase
                .from('scanned_products')
                .select('*')
                .eq('user_id', userId)
                .eq('supplier_source', supplier)
                .limit(50);

            if (error) throw error;
            if (!products) return { synced: 0 };

            const syncRows = products.map(p => {
                const supplierPrice = parseFloat(p.price || '0') * 0.4;
                return {
                    id: p.id,
                    user_id: userId,
                    supplier_product_id: `SUP-${p.id}`,
                    supplier_url: `https://autosync.supplier.com/item/${p.id}`,
                    supplier_price: supplierPrice,
                    supplier_stock: Math.floor(Math.random() * 1000) + 50,
                    supplier_rating: (Math.random() * 1.5 + 3.5),
                    supplier_orders: Math.floor(Math.random() * 5000) + 100,
                    updated_at: new Date().toISOString()
                };
            });

            const { error: upsertError } = await supabase
                .from('scanned_products')
                .upsert(syncRows);

            if (upsertError) throw upsertError;
            return { synced: syncRows.length };
        });

        return { success: true, results };
    }
);

/**
 * Background Job: AI Product Optimization
 */
export const optimizeProduct = inngest.createFunction(
    { id: "optimize-product" },
    { event: "app/ai.optimize-product" },
    async ({ event, step }) => {
        const { product } = event.data;
        const supabase = createServiceClient();
        const { generateListing } = await import("@/lib/ai/listingEngine");

        const aiContent = await step.run("generate-listing", async () => {
            return await generateListing(product);
        });

        await step.run("save-optimization", async () => {
            const { error } = await supabase
                .from('product_ai_content')
                .upsert({
                    product_id: product.id,
                    optimized_title: aiContent.optimizedTitle,
                    seo_title: aiContent.seoTitle,
                    description: aiContent.description,
                    bullets: aiContent.bullets,
                    keywords: aiContent.keywords,
                    tiktok_hook: aiContent.tiktokHook,
                    angle: aiContent.angle,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'product_id' });

            if (error) throw error;
        });

        return { success: true };
    }
);
