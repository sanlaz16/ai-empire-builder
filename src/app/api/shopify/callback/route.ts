import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const hmac = searchParams.get('hmac');

    if (!shop || !code || !hmac) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?error=missing_params`);
    }

    // 1. Validate HMAC
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    if (!clientSecret) {
        console.error('SHOPIFY_CLIENT_SECRET missing');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?error=config_error`);
    }

    const map = new Map(searchParams);
    map.delete('hmac');
    const message = Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const generatedHmac = crypto
        .createHmac('sha256', clientSecret)
        .update(message)
        .digest('hex');

    if (generatedHmac !== hmac) {
        console.error('HMAC validation failed');
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?error=invalid_hmac`);
    }

    // 2. Exchange code for token
    try {
        const clientId = process.env.SHOPIFY_CLIENT_ID;
        const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        });

        const data = await accessTokenResponse.json();
        const { access_token, scope } = data;

        if (!access_token) {
            console.error('Failed to get access token:', data);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?error=token_exchange_failed`);
        }

        // 3. Store in Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/signin?error=auth_required`);
        }

        const { error } = await supabase
            .from('shopify_connections')
            .upsert({
                user_id: user.id,
                shop_domain: shop,
                access_token: access_token,
                scope: scope,
            }, { onConflict: 'user_id, shop_domain' });

        if (error) {
            console.error('Error saving Shopify connection:', error);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?error=database_error`);
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?success=shopify_connected`);

    } catch (err) {
        console.error('OAuth Callback Error:', err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/integrations?error=server_error`);
    }
}
