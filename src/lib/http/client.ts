/**
 * HTTP Client with Retry and Timeout
 * Production-ready HTTP utilities for provider API calls
 */

export interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

/**
 * Fetch with automatic retry on failures
 */
export async function fetchWithRetry(
    url: string,
    options: FetchOptions = {},
    retriesLeft: number = 1
): Promise<Response> {
    const { timeout = 10000, retries = 1, retryDelay = 2000, ...fetchOptions } = options;

    try {
        // Wrap fetch with timeout
        const response = await withTimeout(
            fetch(url, fetchOptions),
            timeout
        );

        // Retry on rate limit or server errors
        if ((response.status === 429 || response.status >= 500) && retriesLeft > 0) {
            console.log(`Retrying ${url} after ${response.status}, ${retriesLeft} retries left`);
            await sleep(retryDelay);
            return fetchWithRetry(url, options, retriesLeft - 1);
        }

        return response;
    } catch (error) {
        // Retry on network errors
        if (retriesLeft > 0) {
            console.log(`Retrying ${url} after error, ${retriesLeft} retries left`);
            await sleep(retryDelay);
            return fetchWithRetry(url, options, retriesLeft - 1);
        }
        throw error;
    }
}

/**
 * Wrap promise with timeout
 */
export async function withTimeout<T>(
    promise: Promise<T>,
    ms: number
): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
    );

    return Promise.race([promise, timeout]);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Handle provider-specific errors
 */
export function handleProviderError(error: any, provider: string): {
    shouldRetry: boolean;
    message: string;
} {
    if (error.message?.includes('timeout')) {
        return {
            shouldRetry: false,
            message: `${provider} request timed out`
        };
    }

    if (error.message?.includes('401') || error.message?.includes('403')) {
        return {
            shouldRetry: false,
            message: `${provider} credentials invalid - please reconnect`
        };
    }

    if (error.message?.includes('429')) {
        return {
            shouldRetry: true,
            message: `${provider} rate limit exceeded`
        };
    }

    if (error.message?.includes('5')) {
        return {
            shouldRetry: true,
            message: `${provider} server error`
        };
    }

    return {
        shouldRetry: false,
        message: `${provider} request failed: ${error.message}`
    };
}

/**
 * Parse error response from provider
 */
export async function parseErrorResponse(response: Response): Promise<string> {
    try {
        const data = await response.json();
        return data.error || data.message || response.statusText;
    } catch {
        return response.statusText;
    }
}
