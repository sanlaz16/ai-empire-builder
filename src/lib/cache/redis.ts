import { Redis } from '@upstash/redis';
import { env } from '../env';

const redisUrl = env.UPSTASH_REDIS_REST_URL;
const redisToken = env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
    })
    : null;

if (!redis) {
    console.warn('⚠️ Upstash Redis connection not configured. Caching will be disabled.');
}
