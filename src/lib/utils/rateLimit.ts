import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

/**
 * Sliding Window Rate Limiter
 * @param identifier - Unique ID (e.g. userId)
 * @param action - Action name (e.g. 'ai-generate')
 * @param limit - Max requests allowed in the window
 * @param windowSeconds - Time window in seconds
 * @returns { success: boolean, remaining: number, reset: number }
 */
export async function rateLimit(
    identifier: string,
    action: string,
    limit: number,
    windowSeconds: number
) {
    if (!redis) return { success: true, remaining: 999, reset: 0 };

    const key = `rate_limit:${identifier}:${action}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    // Clean old entries and count current ones in an atomic pipeline/transaction if possible
    // Using ZSET for sliding window
    const multi = redis.pipeline();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    multi.zcard(key);
    multi.expire(key, windowSeconds);

    const results = await multi.exec();
    const count = results[2] as number;

    return {
        success: count <= limit,
        remaining: Math.max(0, limit - count),
        reset: now + (windowSeconds * 1000)
    };
}
