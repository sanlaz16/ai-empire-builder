import { NextRequest, NextResponse } from 'next/server';
import { saveProviderCredentials, type DsersCredentials, type CJCredentials } from '@/lib/integrations/credentials';

/**
 * POST /api/integrations/save
 * Save provider credentials
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider, data } = body;

        // Validate provider
        if (!provider || !['dsers', 'cj'].includes(provider)) {
            return NextResponse.json(
                { error: 'Invalid provider. Must be "dsers" or "cj"' },
                { status: 400 }
            );
        }

        // Validate data
        if (!data || typeof data !== 'object') {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            );
        }

        // Get user from session
        const userId = request.headers.get('x-user-id') || 'dev-user';

        // Validate provider-specific data
        if (provider === 'dsers') {
            const { apiKey } = data as DsersCredentials;
            if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
                return NextResponse.json(
                    { error: 'DSers API key is required' },
                    { status: 400 }
                );
            }
        } else if (provider === 'cj') {
            const { email, password } = data as CJCredentials;
            if (!email || !password) {
                return NextResponse.json(
                    { error: 'CJ email and password are required' },
                    { status: 400 }
                );
            }
            // Basic email validation
            if (!email.includes('@')) {
                return NextResponse.json(
                    { error: 'Invalid email format' },
                    { status: 400 }
                );
            }
        }

        // Save credentials
        const result = await saveProviderCredentials(userId, provider, data);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to save credentials' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${provider === 'dsers' ? 'DSers' : 'CJ Dropshipping'} credentials saved successfully`
        });
    } catch (error) {
        console.error('Save credentials error:', error);
        return NextResponse.json(
            { error: 'Failed to save credentials' },
            { status: 500 }
        );
    }
}
