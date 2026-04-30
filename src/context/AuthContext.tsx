'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Cookies from 'js-cookie';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<{ error: any }>;
    signInWithDev: () => Promise<void>;
    signOut: () => Promise<void>;
    isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    signInWithGoogle: async () => { return { error: null }; },
    signInWithDev: async () => { },
    signOut: async () => { },
    isSupabaseConfigured: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        console.log('[AuthContext] Initializing auth state check...');

        // Safety net: never leave isLoading=true for more than 6 seconds
        const safetyTimer = setTimeout(() => {
            setIsLoading((prev) => {
                if (prev) {
                    console.warn('[AuthContext] Safety timeout hit — forcing isLoading=false');
                    return false;
                }
                return prev;
            });
        }, 6000);

        const setData = async () => {
            try {
                // Check for dev session in localStorage first to avoid hanging on remote calls
                const devSessionStr = typeof window !== 'undefined' ? localStorage.getItem('empire-dev-session') : null;
                if (devSessionStr) {
                    console.log('[AuthContext] Dev session found in localStorage');
                    const devData = JSON.parse(devSessionStr);
                    setSession(devData.session);
                    setUser(devData.user);
                    setIsLoading(false);
                    return;
                }

                console.log('[AuthContext] Calling supabase.auth.getSession()...');
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('[AuthContext] getSession error:', error.message);
                    // still fall through to finally
                } else if (session) {
                    console.log('[AuthContext] Session found for user:', session.user.email);
                    setSession(session);
                    setUser(session.user);
                } else {
                    console.log('[AuthContext] No active session');
                }
            } catch (e) {
                console.error('[AuthContext] Auth check threw:', e);
            } finally {
                setIsLoading(false);
                clearTimeout(safetyTimer);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[AuthContext] onAuthStateChange event:', event, '| user:', session?.user?.email ?? 'none');
            if (session) {
                setSession(session);
                setUser(session.user);
            } else {
                const devSessionStr = typeof window !== 'undefined' ? localStorage.getItem('empire-dev-session') : null;
                if (!devSessionStr) {
                    setSession(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        });

        setData();

        return () => {
            listener.subscription.unsubscribe();
            clearTimeout(safetyTimer);
        };
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        });
        if (error) {
            console.error('Error signing in with Google:', error.message);
            return { error };
        }
        return { error: null };
    };

    const signInWithDev = async () => {
        const devUser: User = {
            id: 'dev-user',
            app_metadata: {},
            user_metadata: { full_name: 'Dev User' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: 'dev@empire.builder'
        } as User;

        const devSession: Session = {
            access_token: 'dev-token',
            refresh_token: 'dev-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: devUser
        };

        // Persist dev session manually for stability in dev mode
        if (typeof window !== 'undefined') {
            localStorage.setItem('empire-dev-session', JSON.stringify({ user: devUser, session: devSession }));
            // Set a cookie so the middleware can see it without Supabase
            document.cookie = `sb-dev-bypass=true; path=/; max-age=3600; SameSite=Lax`;
        }

        setUser(devUser);
        setSession(devSession);
        router.push('/dashboard');
    };

    const signOut = async () => {
        setIsLoading(true);
        const isDevEnv = process.env.NODE_ENV === 'development';
        try {
            // 1. Clear any dev bypass
            if (isDevEnv) {
                Cookies.remove('sb-dev-bypass');
                Cookies.remove('empire-dev-session');
            }

            // 2. Call our robust logout endpoint
            await fetch('/api/auth/logout', { method: 'POST' });

            // 3. Purge all client storage
            localStorage.clear();
            sessionStorage.clear();

            // 4. Supabase Client SignOut
            await supabase.auth.signOut();

            // 5. Hard refresh to clear memory state and redirect with flag
            window.location.href = '/signin?logged_out=1';
        } catch (error) {
            console.error('Error signing out:', error);
            window.location.href = '/signin?logged_out=1';
        } finally {
            setIsLoading(false);
        }
    };

    const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signInWithGoogle, signInWithDev, signOut, isSupabaseConfigured }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
