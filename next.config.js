/** @type {import('next').NextConfig} */
const nextConfig = {
    // ─── Images ───────────────────────────────────────────
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.shopify.com' },
            { protocol: 'https', hostname: '**.shopifycdn.com' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: '**.aliexpress.com' },
            { protocol: 'https', hostname: '**.alicdn.com' },
            { protocol: 'https', hostname: '**.cjdropshipping.com' },
        ],
    },

    // ─── Production Optimizations ─────────────────────────
    reactStrictMode: true,
    poweredByHeader: false, // hide X-Powered-By: Next.js

    // ─── Console log stripping in production ──────────────
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production'
            ? { exclude: ['error', 'warn'] }
            : false,
    },

    // ─── Experimental ─────────────────────────────────────
    experimental: {
        serverActions: { allowedOrigins: ['localhost:3000', 'empirebuilder.ai'] },
    },

    // ─── Webpack custom config ─────────────────────────────
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Don't bundle server-only packages on client
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

module.exports = nextConfig;
