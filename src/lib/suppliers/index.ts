import { searchDSers } from './dsers';
import { searchCJ } from './cj';
import { searchTemu } from './temu';
import { SupplierSearchResult, SupplierType } from './types';

export async function searchSupplierProducts(
    query?: string,
    niche?: string,
    supplier?: SupplierType | 'All'
): Promise<SupplierSearchResult> {
    const results: SupplierSearchResult = {
        products: [],
        total: 0
    };

    const tasks: Promise<SupplierSearchResult>[] = [];

    if (!supplier || supplier === 'All' || supplier === 'DSers') tasks.push(searchDSers(query, niche));
    if (!supplier || supplier === 'All' || supplier === 'CJ') tasks.push(searchCJ(query, niche));
    if (!supplier || supplier === 'All' || supplier === 'Temu') tasks.push(searchTemu(query, niche));

    const allRes = await Promise.all(tasks);

    for (const res of allRes) {
        results.products.push(...res.products);
        results.total += res.total;
    }

    // Sort by price suggestion desc by default for "Trending" feel
    results.products.sort((a, b) => b.price_suggestion - a.price_suggestion);

    return results;
}
