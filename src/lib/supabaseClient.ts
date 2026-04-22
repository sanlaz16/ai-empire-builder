import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars missing. Supabase functionality will be limited.');
}

// Create a browser client for interacting with Supabase from client components
export const supabase = createBrowserClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
        auth: {
            persistSession: true,
            storageKey: 'supabase-auth-token',
        },
        cookieOptions: {
            secure: false, // Set to false for localhost
            sameSite: 'lax',
            path: '/',
        }
    }
);
