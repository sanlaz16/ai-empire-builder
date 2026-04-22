import { supabase } from './supabaseClient';

// Types (re-exporting or defining here if needed elsewhere)
export interface Product {
    id: string | number;
    name: string;
    niche: string;
    supplier: string;
    costPrice: string;
    sellingPrice: string;
    profitMargin: string;
    score: string;
    description: string;
}

export interface IntegrationState {
    shopify_active: boolean;
    shopify_config: any;
    amazon_active: boolean;
    amazon_config: any;
    tiktok_active: boolean;
    tiktok_config: any;
}

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

// ==========================================
// SELECTED PRODUCTS
// ==========================================

export const getSelectedProducts = async (userId: string): Promise<Product[]> => {
    if (!userId || !isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('selected_products')
        .select('product_json, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching selected products:', error);
        return [];
    }

    return data?.map(row => row.product_json as Product) || [];
};

export const addSelectedProduct = async (userId: string, product: Product) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured or no user' };

    // We store the whole product object as JSONB
    // We don't have a unique constraint on 'product_json' itself, but the app logic prevents dupes.
    const { error } = await supabase.from('selected_products').insert({
        user_id: userId,
        product_json: product
    });

    return { error };
};

export const removeSelectedProduct = async (userId: string, productId: string | number) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured or no user' };

    // Delete by matching the ID inside the JSONB column
    // This requires the postgres operator ->> to extract the ID as text
    const { error } = await supabase
        .from('selected_products')
        .delete()
        .eq('user_id', userId)
        .filter('product_json->>id', 'eq', String(productId));

    return { error };
};

// ==========================================
// INTEGRATIONS
// ==========================================

export const getIntegrations = async (userId: string) => {
    if (!userId || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore row not found
        console.error('Error fetching integrations:', error);
        return null;
    }

    return data; // Returns the row object or null
};

export const upsertIntegrations = async (userId: string, updates: Partial<IntegrationState>) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured or no user' };

    const { error } = await supabase
        .from('integrations')
        .upsert({
            user_id: userId,
            ...updates,
            updated_at: new Date().toISOString()
        });

    return { error };
};

// ==========================================
// TIKTOK SCHEDULED POSTS
// ==========================================

export interface TikTokPost {
    id: string;
    product_json: Product;
    scheduled_at: string;
    region: string;
    status: 'draft' | 'scheduled' | 'published';
    created_at: string;
}

export const getTikTokPosts = async (userId: string): Promise<TikTokPost[]> => {
    if (!userId || !isSupabaseConfigured()) return [];

    const { data, error } = await supabase
        .from('tiktok_scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true });

    if (error) {
        console.error('Error fetching TikTok posts:', error);
        return [];
    }

    return data as TikTokPost[];
};

export const createTikTokPost = async (userId: string, product: Product, scheduledAt: Date, region: string) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const { error } = await supabase
        .from('tiktok_scheduled_posts')
        .insert({
            user_id: userId,
            product_json: product,
            scheduled_at: scheduledAt.toISOString(),
            region: region,
            status: 'scheduled'
        });

    return { error };
};

export const updateTikTokPostStatus = async (userId: string, postId: string, status: 'draft' | 'scheduled' | 'published') => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const { error } = await supabase
        .from('tiktok_scheduled_posts')
        .update({ status })
        .eq('id', postId)
        .eq('user_id', userId);

    return { error };
};

export const deleteTikTokPost = async (userId: string, postId: string) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const { error } = await supabase
        .from('tiktok_scheduled_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

    return { error };
};

// ==========================================
// SUBSCRIPTIONS
// ==========================================

export interface UserSubscription {
    user_id: string;
    plan: 'starter' | 'pro' | 'empire';
    subscription_status: 'trial' | 'active' | 'canceled' | 'past_due';
    trial_ends_at: string | null;
    current_period_end: string | null;
}

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
    if (!userId || !isSupabaseConfigured()) {
        // Mock fallback if DB not ready
        return {
            user_id: userId,
            plan: 'starter',
            subscription_status: 'trial',
            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            current_period_end: null
        };
    }

    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        // If not found, user might be new/legacy. In real app, we'd insert via trigger.
        // For now, return a mock default to keep UI working if trigger failed or pre-existing user.
        if (error.code === 'PGRST116') {
            return {
                user_id: userId,
                plan: 'starter',
                subscription_status: 'trial',
                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                current_period_end: null
            };
        }
        console.error('Error fetching subscription:', error);
        return null;
    }

    return data as UserSubscription;
};

export const updateUserSubscription = async (userId: string, updates: Partial<UserSubscription>) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured' };

    const { error } = await supabase
        .from('user_subscriptions')
        .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() });

    return { error };
};


// ==========================================
// SELLER PROFILES
// ==========================================

export interface SellerProfile {
    user_id: string;
    store_name: string;
    tagline?: string;
    about_us?: string;
    contact_email?: string;
    phone?: string;
    location?: string;
    logo_url?: string;
    instagram_url?: string;
    facebook_url?: string;
    x_url?: string;
    tiktok_url?: string;
    youtube_url?: string;
    public_slug: string;
    is_public: boolean;
    verified_badge?: boolean;
}

export const getSellerProfile = async (userId: string): Promise<SellerProfile | null> => {
    if (!userId || !isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) return null;
    return data as SellerProfile;
};

export const getSellerProfileBySlug = async (slug: string): Promise<SellerProfile | null> => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('public_slug', slug)
        .eq('is_public', true)
        .single();

    if (error) return null;
    return data as SellerProfile;
};

export const upsertSellerProfile = async (userId: string, profile: Partial<SellerProfile>) => {
    if (!userId || !isSupabaseConfigured()) return { error: 'Supabase not configured' };

    // Auto-generate slug if missing on insert is handled by logic calling this, 
    // but here we just pass what we get.

    const { error } = await supabase
        .from('seller_profiles')
        .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() });

    return { error };
};


// ==========================================
// WAITLIST
// ==========================================

export const addToWaitlist = async (email: string, referredBy?: string) => {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, mocking waitlist join');
        return { data: { id: 'mock-id-' + Date.now() }, error: null };
    }

    const { data, error } = await supabase
        .from('waitlist')
        .insert({ email, referred_by: referredBy || null })
        .select()
        .single();

    return { data, error };
};



