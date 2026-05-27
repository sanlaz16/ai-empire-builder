'use client';

import { ShieldCheck, Sparkles, Smartphone, ShoppingCart, UserCheck, Clock, ArrowRight } from 'lucide-react';

const TRUST_POINTS = [
    {
        icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
        title: "Pagamentos Seguros",
        description: "Todas as transações são processadas com segurança através de provedores confiáveis como Stripe e Pagar.me."
    },
    {
        icon: <UserCheck className="w-6 h-6 text-blue-400" />,
        title: "Fácil para Iniciantes",
        description: "Não requer conhecimento de código ou experiência. Nossa IA guia você passo a passo."
    },
    {
        icon: <Smartphone className="w-6 h-6 text-purple-400" />,
        title: "Pronto para PC e Celular",
        description: "Acesse seu negócio de qualquer lugar, a qualquer hora."
    },
    {
        icon: <ShoppingCart className="w-6 h-6 text-yellow-400" />,
        title: "Integração Real de Ecommerce",
        description: "Conecte sua loja e trabalhe com produtos e dados reais."
    },
    {
        icon: <Sparkles className="w-6 h-6 text-orange-400" />,
        title: "Construído com IA",
        description: "IA avançada ajuda você a encontrar produtos, otimizar ofertas e crescer mais rápido."
    },
    {
        icon: <Clock className="w-6 h-6 text-primary" />,
        title: "Suporte de Acesso Antecipado",
        description: "Participe durante o beta e obtenha suporte direto e atualizações contínuas."
    }
];

export function TrustSection() {
    return (
        <section className="py-24 relative overflow-hidden bg-[#050505]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl mb-6">
                        Construa sua loja com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">confiança</span>
                    </h2>
                    <p className="text-lg text-gray-400 font-bold">
                        EmpireBuilder IA ajuda você a lançar mais rápido com pagamentos seguros, integração guiada e ferramentas reais de ecommerce.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {TRUST_POINTS.map((point, index) => (
                        <div
                            key={index}
                            className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.1)] group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                {point.icon}
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight mb-3">{point.title}</h3>
                            <p className="text-gray-500 font-bold text-sm leading-relaxed">{point.description}</p>
                        </div>
                    ))}
                </div>

                <div className="max-w-3xl mx-auto bg-primary/10 border border-primary/20 p-8 rounded-[2rem] text-center mb-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px] mb-4">
                            <Sparkles className="w-3 h-3" /> Acesso Antecipado Beta
                        </div>
                        <p className="text-gray-300 font-bold max-w-2xl mx-auto">
                            Você está entrando no início. Se algo estiver faltando ou confuso, use o botão de feedback e nós melhoraremos rapidamente.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <button 
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                        aria-label="Comece o Teste Grátis"
                    >
                        Comece o Teste Grátis <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all text-center"
                        aria-label="Veja Como Funciona"
                    >
                        Veja Como Funciona
                    </button>
                </div>

                <div className="text-center">
                    <div className="inline-flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs mb-2">
                            <Smartphone className="w-4 h-4 text-gray-400" /> App Mobile em Breve
                        </div>
                        <p className="text-gray-500 font-bold text-xs">
                            Use a plataforma completa na web hoje. Apps para Android e iOS chegarão após o beta.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>
    );
}
