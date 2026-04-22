import { NextRequest, NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/onesignal";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event, targetUserIds } = body;

        let title = '';
        let message = '';
        let url = 'https://empirebuilder.ai/dashboard';

        // Pre-defined event templates
        switch (event) {
            case 'new_product':
                title = '🔥 Novo Produto Vencedor Encontrado';
                message = 'A inteligência artificial encontrou um novo produto com alta margem no seu nicho. Adicione agora e venda hoje!';
                url = 'https://empirebuilder.ai/dashboard/product-finder';
                break;
            case 'trending_product':
                title = '📈 Produto em Alta Rápida';
                message = 'Notamos um pico de vendas em produtos similares aos do seu catálogo. Veja os detalhes e aproveite a tendência.';
                url = 'https://empirebuilder.ai/dashboard/product-finder';
                break;
            case 'trial_ending':
                title = '⚠️ Seu Teste Grátis Está Acabando!';
                message = 'Faltam poucas horas para o fim do seu trial. Continue faturando com o EmpireBuilder AI mantendo seu plano ativo.';
                url = 'https://empirebuilder.ai/dashboard/billing';
                break;
            case 'new_feature':
                title = '🚀 Nova Ferramenta de Conversão Liberada!';
                message = 'Acabamos de lançar um novo gerador de scripts viraís pro TikTok. Entre no dashboard e teste agora!';
                url = 'https://empirebuilder.ai/dashboard';
                break;
            default:
                if (body.title && body.message) {
                    title = body.title;
                    message = body.message;
                    url = body.url || url;
                } else {
                    return NextResponse.json({ success: false, error: 'Invalid event type and no custom title/message provided' }, { status: 400 });
                }
        }

        const success = await sendPushNotification({
            title,
            message,
            url,
            userIds: targetUserIds // if undefined or empty, broadcasts to all
        });

        if (success) {
            return NextResponse.json({ success: true, message: 'Push notification dispatched' });
        } else {
            return NextResponse.json({ success: false, error: 'Failed to dispatch via OneSignal' }, { status: 500 });
        }

    } catch (e: any) {
        console.error('Push API Error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
