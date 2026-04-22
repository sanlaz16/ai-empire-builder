import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Params
        const q = searchParams.get('q') || '';
        const niche = searchParams.get('niche');
        const minProfit = parseFloat(searchParams.get('minProfit') || '0');
        const maxPrice = parseFloat(searchParams.get('maxPrice') || '10000');
        const sort = searchParams.get('sort') || 'trend'; // trend, profit, sales
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 24;
        const offset = (page - 1) * limit;

        const supabase = createClient();

        let query = supabase
            .from('product_index')
            .select(`
                *,
                profit:profit,
                margin:margin
            `, { count: 'exact' });

        // Search Query
        if (q) {
            query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,niche_tags.cs.{${q}}`);
        }

        // Filters
        if (niche) {
            query = query.eq('category', niche);
        }

        // Price Filter (Cost Price)
        if (maxPrice) {
            query = query.lte('price_cost', maxPrice);
        }

        // Note: Generated columns like 'profit' might not be filterable directly in some Supabase versions without a view,
        // but typically it works if selected. If not, we filter in code or use a view.
        // For simplicity, we trust Supabase can filter on computed columns if they are persisted/stored.
        // Our SQL schema has GENERATED ALWAYS AS ... STORED, so they are indexable and queryable!
        if (minProfit) {
            query = query.gte('profit', minProfit);
        }

        // Sorting / Ranking
        // score = w1*trend + w2*profit + w3*sales + w4*rating
        // Since we can't easily do weighted sort dynamically in basic SQL without RPC, 
        // we will sort by the primary selected metric, OR fetch and sort in memory if the dataset is small (it's not).
        // For v1, we'll map the 'sort' param to a specific column.

        switch (sort) {
            case 'profit':
                query = query.order('profit', { ascending: false });
                break;
            case 'sales':
                query = query.order('monthly_sales_est', { ascending: false });
                break;
            case 'trend':
            default:
                // If trending, we trust the 'trend_score' field which should be updated by a background job
                // based on the weighted logic.
                query = query.order('trend_score', { ascending: false });
                break;
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) {
            console.error('Supabase Product Fetch Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            products: products || [],
            total: count || 0,
            page,
            totalPages: count ? Math.ceil(count / limit) : 0
        });

    } catch (e) {
        console.error('API Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
