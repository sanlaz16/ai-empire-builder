/**
 * LLM Wrapper - Unified interface for OpenAI and Anthropic
 * Auto-detects provider based on environment variables
 * Enforces JSON-only output with validation
 */

type LLMProvider = 'openai' | 'anthropic' | 'mock';

interface CallAIJsonArgs {
    systemPrompt: string;
    userPrompt: string;
    schemaName: string;
    userId?: string;
}

interface LLMConfig {
    provider: LLMProvider;
    apiKey?: string;
    model?: string;
    maxTokens: number;
    timeout: number;
}

/**
 * Detect which LLM provider to use based on environment variables
 */
function detectProvider(): LLMConfig {
    const maxTokens = parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '1500');
    const timeout = parseInt(process.env.AI_TIMEOUT_MS || '20000');

    // Priority: OpenAI → Anthropic → Mock
    if (process.env.OPENAI_API_KEY) {
        return {
            provider: 'openai',
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            maxTokens,
            timeout
        };
    }

    if (process.env.ANTHROPIC_API_KEY) {
        return {
            provider: 'anthropic',
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
            maxTokens,
            timeout
        };
    }

    console.warn('[LLM] No API keys found. Running in MOCK mode. Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable real AI.');
    return {
        provider: 'mock',
        maxTokens,
        timeout
    };
}

/**
 * Call OpenAI API with JSON mode
 */
async function callOpenAI<T>(config: LLMConfig, args: CallAIJsonArgs): Promise<T> {
    const { systemPrompt, userPrompt, schemaName, userId } = args;

    console.log(`[LLM] OpenAI call - schema: ${schemaName}, user: ${userId || 'anonymous'}, model: ${config.model}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: { type: 'json_object' },
                max_tokens: config.maxTokens,
                temperature: 0.7
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error (${response.status}): ${error}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('OpenAI returned empty response');
        }

        // Parse and validate JSON
        const parsed = JSON.parse(content);
        console.log(`[LLM] OpenAI success - schema: ${schemaName}`);
        return parsed as T;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`OpenAI request timeout after ${config.timeout}ms`);
        }
        throw error;
    }
}

/**
 * Call Anthropic API with JSON mode
 */
async function callAnthropic<T>(config: LLMConfig, args: CallAIJsonArgs): Promise<T> {
    const { systemPrompt, userPrompt, schemaName, userId } = args;

    console.log(`[LLM] Anthropic call - schema: ${schemaName}, user: ${userId || 'anonymous'}, model: ${config.model}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.apiKey!,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: config.model,
                max_tokens: config.maxTokens,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Anthropic API error (${response.status}): ${error}`);
        }

        const data = await response.json();
        const content = data.content[0]?.text;

        if (!content) {
            throw new Error('Anthropic returned empty response');
        }

        // Parse and validate JSON
        const parsed = JSON.parse(content);
        console.log(`[LLM] Anthropic success - schema: ${schemaName}`);
        return parsed as T;

    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Anthropic request timeout after ${config.timeout}ms`);
        }
        throw error;
    }
}

/**
 * Main function: Call AI and return structured JSON
 * Throws error if AI fails - caller should handle fallback
 */
export async function callAIJson<T>(args: CallAIJsonArgs): Promise<T> {
    const config = detectProvider();

    // Log the call
    console.log(`[LLM] Provider: ${config.provider}, Schema: ${args.schemaName}, User: ${args.userId || 'anonymous'}`);

    // If mock mode, throw error to trigger fallback
    if (config.provider === 'mock') {
        throw new Error('No LLM provider configured - using mock fallback');
    }

    try {
        let result: T;

        if (config.provider === 'openai') {
            result = await callOpenAI<T>(config, args);
        } else {
            result = await callAnthropic<T>(config, args);
        }

        // Minimal validation: ensure it's an object
        if (typeof result !== 'object' || result === null) {
            throw new Error('AI returned invalid JSON structure');
        }

        return result;

    } catch (error) {
        console.error(`[LLM] Error calling ${config.provider}:`, error);
        throw error; // Re-throw to trigger fallback in caller
    }
}

/**
 * Get current provider info (for logging/debugging)
 */
export function getLLMProviderInfo(): { provider: LLMProvider; model?: string } {
    const config = detectProvider();
    return {
        provider: config.provider,
        model: config.model
    };
}
