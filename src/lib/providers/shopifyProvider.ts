export async function searchShopifyProducts(query: string) {
    const res = await fetch(`/api/shopify/products?query=${encodeURIComponent(query)}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Shopify search failed");
    }
    return res.json();
}
