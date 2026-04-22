/**
 * Production-safe logger.
 * Logs in development, silently drops in production.
 * Usage: import { log, logError } from '@/lib/logger';
 */

const isDev = process.env.NODE_ENV !== 'production';

export const log = (...args: unknown[]) => {
    if (isDev) console.log('[Empire]', ...args);
};

export const logWarn = (...args: unknown[]) => {
    if (isDev) console.warn('[Empire:WARN]', ...args);
};

export const logError = (...args: unknown[]) => {
    // Always log errors — in prod you'd pipe to Sentry/Datadog
    console.error('[Empire:ERROR]', ...args);
};
