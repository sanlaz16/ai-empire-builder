import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');

    if (!shop) {
        return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
    }

    // Clean shop domain (ensure it ends with .myshopify.com)
    let shopDomain = shop.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!shopDomain.includes('.')) {
        shopDomain = `${shopDomain}.myshopify.com`;
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    const scopes = 'read_products,write_products,read_inventory,read_orders';
    const redirectUri = `${appUrl}/api/shopify/callback`;

    if (!clientId) {
        console.error('SHOPIFY_CLIENT_ID is missing in environment variables');
        return NextResponse.json({ error: 'App configuration error' }, { status: 500 });
    }

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;

    return NextResponse.redirect(authUrl);
}
