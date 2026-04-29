import Link from 'next/link';

interface Plan {
    name: string;
    price: string;
    features: string[];
    recommended: boolean;
    color?: string;
}

export default function Pricing() {
    const plans: Plan[] = [
        {
            name: 'Inicial',
            price: 'R$ 19,90',
            features: ['Construtor de Loja Básico', '500 Sugestões IA/mês', 'Temas Padrão', 'Suporte Básico'],
            recommended: false,
        },
        {
            name: 'Crescimento',
            price: 'R$ 49,90',
            features: ['Tudo do Inicial', 'Estúdio de Fotos IA', 'Criador de Logo Avançado', 'Suporte Prioritário', '3 Lojas Conectadas'],
            recommended: true,
            color: 'border-primary/30 shadow-lg shadow-primary/10'
        },
        {
            name: 'Império',
            price: 'R$ 149,90',
            features: ['Tudo do Crescimento', 'Gerador de Vídeo Ads IA (Veo3)', 'Automação de Dropshipping', 'Gerente de Sucesso Dedicado', 'Lojas Ilimitadas'],
            recommended: false,
        }
    ];

    return (
        <div className="min-h-screen py-20">
            <div className="container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-black mb-6">Escolha Seu <span className="gradient-text">Poder</span></h1>
                <p className="text-gray-400 mb-16 max-w-2xl mx-auto">Comece pequeno ou vá direto para a dominação mundial. Todos os planos incluem nosso Motor IA principal.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card p-8 flex flex-col items-center relative transition-all hover:scale-105 ${plan.color || 'border-white/10'}`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 -translate-y-1/2 bg-primary text-white font-bold px-4 py-1 rounded-full text-sm">
                                    MAIS POPULAR
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                            <div className="text-5xl font-black mb-6">{plan.price}<span className="text-lg font-normal text-gray-500">/mês</span></div>

                            <ul className="text-left w-full space-y-4 mb-8 flex-grow">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <span className="text-green-500">✓</span> {f}
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-3 rounded-lg font-bold transition-all ${plan.recommended ? 'btn-primary' : 'bg-white/10 hover:bg-white/20'}`}>
                                Escolher {plan.name}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20">
                    <Link href="/" className="text-gray-500 hover:text-white transition-colors">← Voltar ao Início</Link>
                </div>
            </div>
        </div>
    );
}
