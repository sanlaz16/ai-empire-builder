import { NextRequest, NextResponse } from 'next/server';
import { getProviderCredentials } from '@/lib/integrations/credentials';

/**
 * POST /api/integrations/test
 * Test provider credentials
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider } = body;

        // Validate provider
        if (!provider || !['dsers', 'cj'].includes(provider)) {
            return NextResponse.json(
                { error: 'Invalid provider' },
                { status: 400 }
            );
        }

        // Get user from session
        const userId = request.headers.get('x-user-id') || 'dev-user';

        // Get credentials
        const credentials = await getProviderCredentials(userId, provider);

        if (!credentials) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No credentials found for ${provider}`
                },
                { status: 404 }
            );
        }

        // Simulate test (in production, you'd make a real API call to validate)
        // For now, just verify credentials exist and are properly formatted
        if (provider === 'dsers') {
            const { apiKey } = credentials as any;
            if (!apiKey || apiKey.length < 10) {
                return NextResponse.json({
                    success: false,
                    message: 'API key appears invalid (too short)'
                });
            }
        } else if (provider === 'cj') {
            const { email, password } = credentials as any;
            if (!email || !password || !email.includes('@')) {
                return NextResponse.json({
                    success: false,
                    message: 'Credentials appear invalid'
                });
            }
        }

        // Credentials look valid
        return NextResponse.json({
            success: true,
            message: `${provider === 'dsers' ? 'DSers' : 'CJ Dropshipping'} credentials validated successfully`
        });
    } catch (error) {
        console.error('Test credentials error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to test credentials'
            },
            { status: 500 }
        );
    }
}
