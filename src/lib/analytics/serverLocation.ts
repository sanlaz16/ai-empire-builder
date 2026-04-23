/**
 * Analytics Server Location Helper
 * Extracts location info from request headers (optimized for Vercel/Cloudflare).
 */
import { headers } from 'next/headers';

export interface ServerLocation {
    country: string | null;
    region: string | null;
    city: string | null;
}

export function getServerLocation(): ServerLocation {
    const headerList = headers();

    // Vercel Headers
    const country = headerList.get('x-vercel-ip-country');
    const region = headerList.get('x-vercel-ip-country-region');
    const city = headerList.get('x-vercel-ip-city');

    // Cloudflare Fallback
    const cfCountry = headerList.get('cf-ipcountry');

    return {
        country: country || cfCountry || null,
        region: region || null,
        city: city ? decodeURIComponent(city) : null,
    };
}
