import { NextRequest, NextResponse } from 'next/server';
import { getProviderCredentials, getMaskedHint } from '@/lib/integrations/credentials';

/**
 * GET /api/integrations/status
 * Get integration status for current user
 */
export async function GET(request: NextRequest) {
    try {
        // Get user from session (you'll need to implement session handling)
        // For now, using a placeholder - replace with actual auth
        const userId = request.headers.get('x-user-id') || 'dev-user';

        // Check each provider
        const [dsersCreds, cjCreds] = await Promise.all([
            getProviderCredentials(userId, 'dsers'),
            getProviderCredentials(userId, 'cj')
        ]);

        return NextResponse.json({
            dsers: {
                configured: dsersCreds !== null,
                hint: getMaskedHint('dsers', dsersCreds)
            },
            cj: {
                configured: cjCreds !== null,
                hint: getMaskedHint('cj', cjCreds)
            },
            amazon: {
                configured: false,
                enabled: false,
                hint: 'Feature disabled'
            }
        });
    } catch (error) {
        console.error('Integration status error:', error);
        return NextResponse.json(
            { error: 'Failed to get integration status' },
            { status: 500 }
        );
    }
}
