import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ valid: false, error: 'Código não fornecido' }, { status: 400 });
        }

        const supabase = createClient();

        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('referral_code', code.trim().toUpperCase())
            .single();

        if (error || !data) {
            return NextResponse.json({ valid: false, error: 'Código inválido ou não encontrado' });
        }

        return NextResponse.json({
            valid: true,
            referrerName: data.full_name
        });

    } catch (e: any) {
        console.error('Validate Referral Error:', e);
        return NextResponse.json({ valid: false, error: 'Erro interno' }, { status: 500 });
    }
}
