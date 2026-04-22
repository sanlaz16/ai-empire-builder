/**
 * Simple In-Memory Rate Limiter
 * Token bucket algorithm for API rate limiting
 */

interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

class RateLimiter {
    private buckets: Map<string, TokenBucket> = new Map();
    private maxTokens: number;
    private refillRate: number; // tokens per minute

    constructor(maxTokens: number = 60, refillRate: number = 60) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
    }

    /**
     * Check if request is allowed
     * @param key - Unique identifier (e.g., "userId:provider")
     * @returns true if allowed, false if rate limited
     */
    checkLimit(key: string): boolean {
        const now = Date.now();
        let bucket = this.buckets.get(key);

        if (!bucket) {
            // Create new bucket
            bucket = {
                tokens: this.maxTokens - 1,
                lastRefill: now
            };
            this.buckets.set(key, bucket);
            return true;
        }

        // Refill tokens based on time passed
        const timePassed = now - bucket.lastRefill;
        const tokensToAdd = (timePassed / 60000) * this.refillRate;
        bucket.tokens = Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
        bucket.lastRefill = now;

        // Check if we have tokens
        if (bucket.tokens >= 1) {
            bucket.tokens -= 1;
            return true;
        }

        return false;
    }

    /**
     * Get remaining tokens for a key
     */
    getRemainingTokens(key: string): number {
        const bucket = this.buckets.get(key);
        if (!bucket) return this.maxTokens;

        const now = Date.now();
        const timePassed = now - bucket.lastRefill;
        const tokensToAdd = (timePassed / 60000) * this.refillRate;
        return Math.min(this.maxTokens, bucket.tokens + tokensToAdd);
    }

    /**
     * Clear all buckets (for testing)
     */
    clear() {
        this.buckets.clear();
    }
}

// Global rate limiters for each provider
export const dsersRateLimiter = new RateLimiter(
    parseInt(process.env.RATE_LIMIT_DSERS || '60'),
    parseInt(process.env.RATE_LIMIT_DSERS || '60')
);

export const cjRateLimiter = new RateLimiter(
    parseInt(process.env.RATE_LIMIT_CJ || '60'),
    parseInt(process.env.RATE_LIMIT_CJ || '60')
);

/**
 * Check rate limit for a user and provider
 */
export function checkRateLimit(userId: string, provider: 'dsers' | 'cj'): {
    allowed: boolean;
    remaining: number;
} {
    const limiter = provider === 'dsers' ? dsersRateLimiter : cjRateLimiter;
    const key = `${userId}:${provider}`;

    return {
        allowed: limiter.checkLimit(key),
        remaining: Math.floor(limiter.getRemainingTokens(key))
    };
}
