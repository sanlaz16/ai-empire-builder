import { z } from 'zod';

const envSchema = z.object({
    // Supabase (Public)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://dummy.supabase.co'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default('dummy-key'),

    // Supabase (Private)
    SUPABASE_SERVICE_ROLE_KEY: z.string().default('dummy-key'),

    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_STARTER_PRICE_ID: z.string().optional(),
    STRIPE_GROWTH_PRICE_ID: z.string().optional(),
    STRIPE_EMPIRE_PRICE_ID: z.string().optional(),

    // Shopify
    SHOPIFY_CLIENT_ID: z.string().optional(),
    SHOPIFY_CLIENT_SECRET: z.string().optional(),
    SHOPIFY_API_VERSION: z.string().default('2024-01'),

    // Redis (Cashing)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // OpenAI
    OPENAI_API_KEY: z.string().optional(),

    // Site
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

    // Billing Provider
    BILLING_PROVIDER: z.enum(['stripe', 'pagarme']).default('stripe'),
});

const isServer = typeof window === 'undefined';

const processEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
    STRIPE_GROWTH_PRICE_ID: process.env.STRIPE_GROWTH_PRICE_ID,
    STRIPE_EMPIRE_PRICE_ID: process.env.STRIPE_EMPIRE_PRICE_ID,
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    SHOPIFY_CLIENT_SECRET: process.env.SHOPIFY_CLIENT_SECRET,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    BILLING_PROVIDER: process.env.BILLING_PROVIDER,
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    console.error(
        '❌ Invalid environment variables:',
        JSON.stringify(parsed.error.format(), null, 2)
    );
    throw new Error('Invalid environment variables');
}

export const env = parsed.data;

// Safety check for server-only variables on the client
if (!isServer) {
    const serverVars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'SHOPIFY_CLIENT_SECRET',
        'UPSTASH_REDIS_REST_TOKEN',
        'OPENAI_API_KEY',
    ];

    for (const v of serverVars) {
        if (processEnv[v as keyof typeof processEnv]) {
            console.warn(`⚠️ Warning: Server-only variable ${v} is exposed to the client!`);
        }
    }
}
