import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // In a real app, we would scrape the URL here.
        // For v1 placeholder, we extract the domain and return simulated data to save into product_index.
        // The user must be authenticated to import.

        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Mock Scraper Logic
        const domain = new URL(url).hostname.replace('www.', '');
        const mockProduct = {
            source: 'manual', // or detect from domain
            source_product_id: `imported_${Date.now()}`,
            title: `Imported Product from ${domain}`,
            description: `This product was imported from ${url}. Description would be scraped here.`,
            url: url,
            price_cost: 25.00,
            shipping_cost: 5.00,
            price_suggested: 59.99,
            category: 'Uncategorized',
            trend_score: 50, // Default neutral score
            images: ['https://placehold.co/600x400?text=Imported+Product'] // Placeholder
        };

        // Insert into product_index
        const { data, error } = await supabase
            .from('product_index')
            .insert(mockProduct)
            .select()
            .single();

        if (error) {
            console.error('Import Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ product: data });

    } catch (e) {
        console.error('Import API Error:', e);
        return NextResponse.json({ error: 'Failed to process import' }, { status: 500 });
    }
}
