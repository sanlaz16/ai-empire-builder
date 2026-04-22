import { NextResponse } from 'next/server';
import { PagarmeProvider } from '@/lib/billing/pagarme';

export async function POST(req: Request) {
    try {
        const event = await PagarmeProvider.handleWebhook(req);

        if (!event) {
            return NextResponse.json({ received: true, status: 'ignored' });
        }

        // Logic to update Supabase 'subscriptions' and 'profiles' 
        // similar to Stripe webhook but adapted for Pagar.me schema.

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('[PAGARME/WEBHOOK] Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
