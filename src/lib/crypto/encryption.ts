import crypto from 'crypto';

/**
 * AES-256-GCM Encryption for sensitive data
 * Server-side only - never import this in client components
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

interface EncryptedPayload {
    iv: string;
    authTag: string;
    data: string;
}

/**
 * Get encryption key from environment
 * Must be 32 bytes (64 hex characters)
 */
function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    // Convert hex string to buffer
    const keyBuffer = Buffer.from(key, 'hex');

    if (keyBuffer.length !== KEY_LENGTH) {
        throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
    }

    return keyBuffer;
}

/**
 * Encrypt data using AES-256-GCM
 * @param plaintext - Data to encrypt (will be JSON stringified if object)
 * @returns Encrypted payload with IV and auth tag
 */
export function encryptData(plaintext: string | object): EncryptedPayload {
    try {
        const key = getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Convert to string if object
        const data = typeof plaintext === 'string' ? plaintext : JSON.stringify(plaintext);

        // Encrypt
        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Get authentication tag
        const authTag = cipher.getAuthTag();

        return {
            iv: iv.toString('base64'),
            authTag: authTag.toString('base64'),
            data: encrypted
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data using AES-256-GCM
 * @param payload - Encrypted payload with IV and auth tag
 * @returns Decrypted plaintext
 */
export function decryptData(payload: EncryptedPayload): string {
    try {
        const key = getEncryptionKey();
        const iv = Buffer.from(payload.iv, 'base64');
        const authTag = Buffer.from(payload.authTag, 'base64');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

        decipher.setAuthTag(authTag);

        // Decrypt
        let decrypted = decipher.update(payload.data, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data - data may be corrupted or key is incorrect');
    }
}

/**
 * Encrypt JSON object
 * @param obj - Object to encrypt
 * @returns Encrypted payload
 */
export function encryptJson<T = any>(obj: T): EncryptedPayload {
    return encryptData(JSON.stringify(obj));
}

/**
 * Decrypt to JSON object
 * @param payload - Encrypted payload
 * @returns Decrypted object
 */
export function decryptJson<T = any>(payload: EncryptedPayload): T {
    const decrypted = decryptData(payload);
    return JSON.parse(decrypted);
}

/**
 * Generate a new encryption key (for setup)
 * Run this once to generate ENCRYPTION_KEY for .env.local
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Check if encryption is configured
 */
export function isEncryptionConfigured(): boolean {
    try {
        getEncryptionKey();
        return true;
    } catch {
        return false;
    }
}
