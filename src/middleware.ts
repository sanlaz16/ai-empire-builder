import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/admin', '/onboarding'];
// Routes that should redirect to dashboard if already authed
const AUTH_PATHS = ['/signin', '/signup'];
// Routes that are fully public — no auth check needed
const PUBLIC_PATHS = ['/', '/reset-password', '/privacy-policy', '/terms-of-service', '/pricing', '/launch', '/vip-demo'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Fully public routes — skip all auth checks
    if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    // Safety: skip if Supabase env vars are missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Middleware: Missing Supabase environment variables');
        return response;
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({ request: { headers: request.headers } });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // Check for dev bypass cookie (dev only)
    const isDevBypass = request.cookies.get('sb-dev-bypass')?.value === 'true';
    if (isDevBypass && process.env.NODE_ENV === 'development') {
        if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return response;
    }

    // Single fast auth check — reads JWT cookie locally, NO network request
    // (getUser() makes a live HTTP call to Supabase which causes middleware timeouts;
    //  getSession() is safe for routing decisions in middleware)
    let user = null;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user ?? null;
    } catch (e) {
        console.error('Middleware: Failed to read session:', e);
        // On error, allow through — pages handle their own auth guards
        return response;
    }

    // Redirect unauthenticated users away from protected routes
    const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));
    if (isProtected && !user) {
        const redirectUrl = new URL('/signin', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Redirect already-logged-in users away from auth pages
    if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
        const loggedOut = request.nextUrl.searchParams.get('logged_out') === '1';
        if (user && !loggedOut) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
