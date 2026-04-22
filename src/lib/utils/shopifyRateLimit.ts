/**
 * Shopify API Rate Limiter — NUCLEAR 13, Part 1
 * Token bucket: max 2 Shopify calls per second per user.
 * Any call beyond that is queued and executed when a token is available.
 */

interface Bucket {
    tokens: number;
    lastRefill: number;
    queue: Array<() => void>;
    flushing: boolean;
}

const buckets = new Map<string, Bucket>();

const MAX_TOKENS = 2;   // max burst
const REFILL_RATE = 2;   // tokens per second
const REFILL_INTERVAL = 1000; // ms

function getBucket(userId: string): Bucket {
    if (!buckets.has(userId)) {
        buckets.set(userId, {
            tokens: MAX_TOKENS,
            lastRefill: Date.now(),
            queue: [],
            flushing: false
        });
    }
    return buckets.get(userId)!;
}

function refill(bucket: Bucket): void {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / REFILL_INTERVAL;
    const newTokens = Math.floor(elapsed * REFILL_RATE);
    if (newTokens > 0) {
        bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + newTokens);
        bucket.lastRefill = now;
    }
}

async function flush(userId: string): Promise<void> {
    const bucket = getBucket(userId);
    if (bucket.flushing) return;
    bucket.flushing = true;

    while (bucket.queue.length > 0) {
        refill(bucket);
        if (bucket.tokens > 0) {
            bucket.tokens--;
            const resolve = bucket.queue.shift()!;
            resolve();
        } else {
            // Wait for next token
            await new Promise(r => setTimeout(r, REFILL_INTERVAL / REFILL_RATE));
        }
    }

    bucket.flushing = false;
}

/**
 * Acquire a Shopify API slot for a user.
 * Returns a promise that resolves when it's safe to make the call.
 */
export function acquireShopifySlot(userId: string): Promise<void> {
    const bucket = getBucket(userId);
    refill(bucket);

    if (bucket.tokens > 0) {
        bucket.tokens--;
        return Promise.resolve();
    }

    // Queue the request
    return new Promise<void>(resolve => {
        bucket.queue.push(resolve);
        flush(userId);
    });
}
