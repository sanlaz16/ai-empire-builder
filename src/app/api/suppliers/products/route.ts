import { NextResponse } from 'next/server';
import { searchSupplierProducts } from '@/lib/suppliers';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || undefined;
        const niche = searchParams.get('niche') || undefined;
        const supplier = searchParams.get('supplier') as any || 'All';

        const result = await searchSupplierProducts(query, niche, supplier);

        return NextResponse.json(result);
    } catch (error) {
        console.error('[SUPPLIER_PRODUCTS] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch supplier products' }, { status: 500 });
    }
}
