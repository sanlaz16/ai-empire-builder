import { NextResponse, type NextRequest } from 'next/server';

/**
 * LIGHTWEIGHT MIDDLEWARE — Zero external network calls, zero heavy SDK imports.
 *
 * Root cause of 504 MIDDLEWARE_INVOCATION_TIMEOUT:
 *   • @supabase/ssr was imported here, making its entire bundle run on the
 *     Vercel Edge Runtime on EVERY request. Even with getSession() (no network
 *     call), the bundle initialization alone exceeded Edge timeout limits.
 *
 * Solution:
 *   • Remove ALL Supabase imports from middleware.
 *   • Determine auth state by checking whether a Supabase session cookie exists
 *     (raw cookie read — pure synchronous, zero latency).
 *   • Real auth verification (signature check, expiry, DB lookup) stays in
 *     page-level Server Components / Route Handlers where it belongs.
 */

// ─── Route Definitions ────────────────────────────────────────────────────────

/** Fully public — skip middleware entirely, render immediately. */
const PUBLIC_PREFIXES = [
    '/',
    '/pricing',
    '/launch',
    '/vip-demo',
    '/privacy-policy',
    '/terms-of-service',
    '/reset-password',
    '/store',
];

/** Only accessible when logged out — redirect to dashboard if session found. */
const AUTH_ONLY_PREFIXES = ['/signin', '/signup'];

/** Must be logged in — redirect to signin if no session cookie found. */
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/onboarding'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if a Supabase session cookie is present.
 * Supabase stores the session in cookies named:
 *   sb-<project-ref>-auth-token   (new SDK)
 *   supabase-auth-token            (legacy)
 * We just check for the presence of any sb-*-auth-token cookie — no decoding,
 * no verification. Pages do real verification server-side.
 */
function hasSessionCookie(request: NextRequest): boolean {
    for (const [name] of request.cookies) {
        if (name.startsWith('sb-') && name.endsWith('-auth-token')) {
            return true;
        }
    }
    return false;
}

// ─── Middleware ────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Fully public routes — pass through immediately, zero processing.
    if (PUBLIC_PREFIXES.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)))) {
        return NextResponse.next();
    }

    // 2. Static assets & API routes — always pass through.
    if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
        return NextResponse.next();
    }

    const hasSession = hasSessionCookie(request);

    // 3. Auth-only routes (signin/signup) — redirect logged-in users to dashboard.
    if (AUTH_ONLY_PREFIXES.some(p => pathname.startsWith(p))) {
        const loggedOut = request.nextUrl.searchParams.get('logged_out') === '1';
        if (hasSession && !loggedOut) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // 4. Protected routes — redirect logged-out users to signin.
    if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
        if (!hasSession) {
            const redirectUrl = new URL('/signin', request.url);
            redirectUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // 5. Everything else — pass through.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static  (static files)
         * - _next/image   (image optimization)
         * - favicon.ico
         * - public image/font files
         */
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)',
    ],
};
