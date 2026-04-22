import { redis } from './redis';

export const isCacheEnabled = !!redis;

export async function getJson<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
        return await redis.get<T>(key);
    } catch (err) {
        console.error(`Cache Read Error [${key}]:`, err);
        return null;
    }
}

export async function setJson<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(key, value, { ex: ttlSeconds });
    } catch (err) {
        console.error(`Cache Write Error [${key}]:`, err);
    }
}

export async function del(key: string): Promise<void> {
    if (!redis) return;
    try {
        await redis.del(key);
    } catch (err) {
        console.error(`Cache Delete Error [${key}]:`, err);
    }
}

/**
 * Generate a cache key for Shopify scans
 */
export function getShopifyScanKey(userId: string, shop: string, query: string = 'all'): string {
    return `shopifyScan:${userId}:${shop}:${query}`;
}
