import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PATHS = ['/dashboard', '/admin'];
// Routes that should redirect to dashboard if already authed
const AUTH_PATHS = ['/signin', '/signup'];
// Routes that are part of onboarding and should bypass the main gate
const ONBOARDING_PATHS = ['/onboarding'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Check for dev bypass cookie
    const isDevBypass = request.cookies.get('sb-dev-bypass')?.value === 'true';

    // In dev mode, if we have the bypass cookie, skip Supabase calls to avoid hangs
    if (isDevBypass && process.env.NODE_ENV === 'development') {
        const devUser = { id: 'dev-user', email: 'dev@empire.builder' };

        if (AUTH_PATHS.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        return response;
    }

    let user = null;
    try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        user = supabaseUser;
    } catch (e) {
        console.error('Middleware: Failed to reach Supabase Auth:', e);
    }

    // Enforce auth on protected paths (and onboarding path)
    const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p)) || ONBOARDING_PATHS.some(p => pathname.startsWith(p));

    if (isProtected) {
        if (!user) {
            const redirectUrl = new URL('/signin', request.url);
            redirectUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // --- ONBOARDING GATE ---
        // Skip for /onboarding itself and API routes
        const isOnboardingPath = ONBOARDING_PATHS.some(p => pathname.startsWith(p));
        if (!isOnboardingPath && !pathname.startsWith('/api')) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('onboarding_completed')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.onboarding_completed === false) {
                    return NextResponse.redirect(new URL('/onboarding', request.url));
                }
            } catch (e) {
                // If check fails in dev, allow through
                console.error('Middleware: Failed to check onboarding:', e);
            }
        }

        // --- SUBSCRIPTION GATE ---
        // Exclude billing page from the gate to avoid redirect loops
        if (pathname !== '/dashboard/billing') {
            try {
                const { data: subscription } = await supabase
                    .from('subscriptions')
                    .select('status')
                    .eq('user_id', user.id)
                    .single();

                const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

                if (!isActive) {
                    return NextResponse.redirect(new URL('/dashboard/billing', request.url));
                }
            } catch (e) {
                console.error('Middleware: Failed to check subscription:', e);
                // In dev mode, allow access if Supabase fails
                if (process.env.NODE_ENV === 'development') return response;
            }
        }
    }

    // Redirect already-authed users away from auth pages
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
