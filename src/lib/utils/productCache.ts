import { Redis } from '@upstash/redis';

/**
 * Product Cache Layer — NUCLEAR 25 (Scale 250k)
 * Distributed Redis cache for Product Finder data.
 * Fallback to in-memory for local dev if Redis not configured.
 */

export const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

// In-memory fallback for local dev or if Redis fails
const localCache = new Map<string, { data: any; expiresAt: number }>();
const TTL_SECONDS = 3600; // 1 hour for distributed scaling
const TTL_MS = TTL_SECONDS * 1000;

export async function getCached<T>(key: string): Promise<T | null> {
    try {
        if (redis) {
            const data = await redis.get<T>(key);
            return data;
        }
    } catch (e) {
        console.warn('[CACHE/REDIS] Get failed, falling back:', e);
    }

    const entry = localCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        localCache.delete(key);
        return null;
    }
    return entry.data;
}

export async function setCached<T>(key: string, data: T, ttlSeconds = TTL_SECONDS): Promise<void> {
    try {
        if (redis) {
            await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
            return;
        }
    } catch (e) {
        console.warn('[CACHE/REDIS] Set failed, falling back:', e);
    }

    localCache.set(key, { data, expiresAt: Date.now() + (ttlSeconds * 1000) });
}

export async function invalidateCache(userId: string): Promise<void> {
    const prefix = `products:${userId}`;

    try {
        if (redis) {
            // Redis pattern delete (Note: SCAN is better for large sets, but this is per-user)
            const keys = await redis.keys(`${prefix}:*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            return;
        }
    } catch (e) {
        console.warn('[CACHE/REDIS] Invalidate failed:', e);
    }

    Array.from(localCache.keys()).forEach((key) => {
        if (key.startsWith(prefix)) {
            localCache.delete(key);
        }
    });
}

export function productCacheKey(userId: string, query = ''): string {
    return `products:${userId}:${query}`;
}
