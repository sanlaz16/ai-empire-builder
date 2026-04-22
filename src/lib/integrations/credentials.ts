import { supabase } from '@/lib/supabaseClient';
import { encryptJson, decryptJson, isEncryptionConfigured } from '@/lib/crypto/encryption';

/**
 * Provider Credentials Management
 * Server-side only - handles encrypted storage in Supabase
 */

export interface DsersCredentials {
    apiKey: string;
}

export interface CJCredentials {
    email: string;
    password: string;
}

export type ProviderCredentials = DsersCredentials | CJCredentials;

export interface IntegrationSecret {
    id: string;
    user_id: string;
    provider: 'dsers' | 'cj' | 'amazon';
    secrets: any; // Encrypted payload
    created_at: string;
    updated_at: string;
}

/**
 * Get provider credentials for a user
 * Priority: Supabase (encrypted) → env vars → null
 */
export async function getProviderCredentials(
    userId: string,
    provider: 'dsers' | 'cj'
): Promise<ProviderCredentials | null> {
    try {
        // Try Supabase first
        const { data, error } = await supabase
            .from('integration_secrets')
            .select('*')
            .eq('user_id', userId)
            .eq('provider', provider)
            .single();

        if (data && !error) {
            // Decrypt the secrets
            if (isEncryptionConfigured()) {
                try {
                    const decrypted = decryptJson(data.secrets);
                    return decrypted as ProviderCredentials;
                } catch (decryptError) {
                    console.error(`Failed to decrypt ${provider} credentials:`, decryptError);
                    // Fall through to env vars
                }
            } else {
                // No encryption, assume plaintext (fallback mode)
                return data.secrets as ProviderCredentials;
            }
        }

        // Fallback to environment variables
        if (provider === 'dsers') {
            const apiKey = process.env.DSERS_API_KEY;
            if (apiKey) {
                return { apiKey } as DsersCredentials;
            }
        } else if (provider === 'cj') {
            const email = process.env.CJ_EMAIL;
            const password = process.env.CJ_PASSWORD;
            if (email && password) {
                return { email, password } as CJCredentials;
            }
        }

        // No credentials found
        return null;
    } catch (error) {
        console.error(`Error fetching ${provider} credentials:`, error);
        return null;
    }
}

/**
 * Save provider credentials for a user
 */
export async function saveProviderCredentials(
    userId: string,
    provider: 'dsers' | 'cj',
    credentials: ProviderCredentials
): Promise<{ success: boolean; error?: string }> {
    try {
        // Encrypt the credentials
        let encryptedSecrets: any;

        if (isEncryptionConfigured()) {
            encryptedSecrets = encryptJson(credentials);
        } else {
            // Fallback: store plaintext (not recommended for production)
            console.warn('ENCRYPTION_KEY not set - storing credentials in plaintext');
            encryptedSecrets = credentials;
        }

        // Upsert to Supabase
        const { error } = await supabase
            .from('integration_secrets')
            .upsert({
                user_id: userId,
                provider,
                secrets: encryptedSecrets
            }, {
                onConflict: 'user_id,provider'
            });

        if (error) {
            console.error('Supabase upsert error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error(`Error saving ${provider} credentials:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Delete provider credentials for a user
 */
export async function deleteProviderCredentials(
    userId: string,
    provider: 'dsers' | 'cj'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('integration_secrets')
            .delete()
            .eq('user_id', userId)
            .eq('provider', provider);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error(`Error deleting ${provider} credentials:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check if provider is configured for a user
 */
export async function isProviderConfigured(
    userId: string,
    provider: 'dsers' | 'cj'
): Promise<boolean> {
    const credentials = await getProviderCredentials(userId, provider);
    return credentials !== null;
}

/**
 * Get masked hint for credentials (for UI display)
 */
export function getMaskedHint(
    provider: 'dsers' | 'cj',
    credentials: ProviderCredentials | null
): string {
    if (!credentials) return 'Not configured';

    if (provider === 'dsers') {
        const creds = credentials as DsersCredentials;
        const key = creds.apiKey;
        if (key.length > 8) {
            return `***${key.slice(-4)}`;
        }
        return '***key';
    } else if (provider === 'cj') {
        const creds = credentials as CJCredentials;
        const email = creds.email;
        const [user, domain] = email.split('@');
        if (user && domain) {
            return `${user.slice(0, 2)}***@${domain}`;
        }
        return '***@***';
    }

    return 'Configured';
}
