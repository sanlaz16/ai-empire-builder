import { createClient } from '@/lib/supabase/server';
import { SupplierProduct, CSVRow } from './types';

// Helper to parse CSV string (simple implementation)
function parseCSV(csvText: string): CSVRow[] {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));

    const results: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle simple comma separation (doesn't handle commas inside quotes well, but sufficient for basic usage)
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        if (values.length < headers.length) continue;

        const row: any = {};
        headers.forEach((h, index) => {
            row[h] = values[index];
        });
        results.push(row);
    }
    return results;
}

export async function uploadSupplierCSV(csvText: string, userId: string) {
    const supabase = createClient();
    const rows = parseCSV(csvText);

    const productsToInsert = rows.map(row => ({
        user_id: userId,
        title: row.title || 'Untitled Product',
        image_url: row.image_url || row.image || '',
        source_price: parseFloat(String(row.price)) || 0,
        shipping_cost: parseFloat(String(row.shipping || 0)),
        currency: row.currency || 'USD',
        supplier_url: row.url || '',
        supplier_name: row.supplier || 'CSV Import',
        status: 'active'
    }));

    if (productsToInsert.length === 0) return { count: 0 };

    const { error, data } = await supabase
        .from('supplier_products')
        .insert(productsToInsert)
        .select();

    if (error) throw error;

    return { count: data ? data.length : productsToInsert.length };
}

export async function searchSupplierProducts(userId: string, query?: string) {
    const supabase = createClient();
    let q = supabase
        .from('supplier_products')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active'); // only show active ones

    if (query && query.trim().length > 0) {
        q = q.ilike('title', `%${query}%`);
    } else {
        q = q.order('created_at', { ascending: false });
    }

    const { data, error } = await q;

    if (error) throw error;

    // Map to normalized structure if needed, or return as is
    return data.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        imageUrl: p.image_url,
        sourcePrice: Number(p.source_price),
        shippingCost: Number(p.shipping_cost),
        currency: p.currency,
        supplierUrl: p.supplier_url,
        supplierName: p.supplier_name,
        status: p.status
    }));
}
