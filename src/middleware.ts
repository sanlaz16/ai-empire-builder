import { NextResponse, type NextRequest } from 'next/server';

/**
 * ULTRA-LIGHTWEIGHT MIDDLEWARE
 *
 * KEY FIX: The `matcher` below is now ALLOW-LIST only — it only runs this
 * middleware on routes that actually need auth logic (protected + auth pages).
 * The home page '/', '/pricing', '/launch', etc. are NOT in the matcher,
 * so Next.js never invokes this function for them at all.
 *
 * Auth state is detected by checking for the presence of a Supabase session
 * cookie (raw cookie read — synchronous, zero network, zero SDK).
 * Real verification (JWT signature, expiry) happens in page Server Components.
 */

/** Supabase session cookie patterns */
function hasSession(request: NextRequest): boolean {
    return request.cookies.getAll().some(
        c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Protected routes: must be logged in ──────────────────────────────────
    if (
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/onboarding')
    ) {
        if (!hasSession(request)) {
            const url = new URL('/signin', request.url);
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

    // ── Auth pages: redirect to dashboard if already logged in ───────────────
    if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
        const loggedOut = request.nextUrl.searchParams.get('logged_out') === '1';
        if (!loggedOut && hasSession(request)) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // ── Everything else: pass through ────────────────────────────────────────
    return NextResponse.next();
}

/**
 * IMPORTANT: Only run middleware on routes that need it.
 * Public pages (/, /pricing, /launch, etc.) are intentionally EXCLUDED
 * so middleware is never invoked for them — eliminating any timeout risk.
 */
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/onboarding/:path*',
        '/signin',
        '/signin/:path*',
        '/signup',
        '/signup/:path*',
    ],
};
