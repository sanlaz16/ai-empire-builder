/**
 * client-side logout helper
 */
export async function logout() {
    try {
        // 1. Call server-side logout to clear cookies
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Server-side logout failed, proceeding with client cleanup', e);
    } finally {
        // 2. Clear all local storage related to auth
        if (typeof window !== 'undefined') {
            // Specific Supabase keys
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase-auth-token'); // Check both common names
            localStorage.removeItem('empire-dev-session');

            // Clear any keys starting with 'sb-' (Supabase default) or containing 'supabase'
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-') || key.toLowerCase().includes('supabase')) {
                    localStorage.removeItem(key);
                }
            });

            // Same for sessionStorage
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('sb-') || key.toLowerCase().includes('supabase')) {
                    sessionStorage.removeItem(key);
                }
            });

            // 3. Final Redirect with logout signal
            window.location.href = '/signin?logged_out=1';
        }
    }
}
