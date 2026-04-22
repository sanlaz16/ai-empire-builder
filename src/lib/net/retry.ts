interface RetryOptions {
    retries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    jitter?: boolean;
    retryOn?: (error: any) => boolean;
}

/**
 * Exponential backoff retry utility
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        retries = 3,
        baseDelayMs = 1000,
        maxDelayMs = 10000,
        jitter = true,
        retryOn = (err: any) => {
            const status = err?.status || err?.response?.status;
            // Retry on 429 (Too Many Requests), 5xx (Server Errors), or network/timeout issues
            return (
                status === 429 ||
                (status >= 500 && status <= 504) ||
                err?.name === 'AbortError' ||
                err?.message?.includes('timeout') ||
                err?.message?.includes('fetch')
            );
        },
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            // Create a timeout for the individual attempt
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout per attempt

            const result = await fn();

            clearTimeout(timeoutId);
            return result;
        } catch (err: any) {
            lastError = err;

            if (attempt === retries || !retryOn(err)) {
                throw err;
            }

            const delay = Math.min(
                baseDelayMs * Math.pow(2, attempt),
                maxDelayMs
            );

            const jitterAmount = jitter ? Math.random() * 200 : 0;
            const finalDelay = delay + jitterAmount;

            console.warn(`Retry Attempt ${attempt + 1}/${retries} after ${Math.round(finalDelay)}ms. Error: ${err.message}`);

            await new Promise((resolve) => setTimeout(resolve, finalDelay));
        }
    }

    throw lastError;
}
