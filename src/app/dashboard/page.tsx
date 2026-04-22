'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, Users, MousePointer2, DollarSign, Copy, Check, Flame } from 'lucide-react';
import WinningProductsWidget from '@/components/dashboard/WinningProductsWidget';

export default function DashboardOverview() {
    const [referralStats, setReferralStats] = useState({
        code: 'LOADING...',
        clicks: 0,
        conversions: 0,
        earnings: 0
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/referrals/stats');
                const data = await res.json();
                if (data.code) {
                    setReferralStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch referral stats', err);
            }
        };
        fetchStats();
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText(referralStats.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta, John 👋</h1>
                <p className="text-gray-400">Veja o que está acontecendo com seu império hoje.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Status Card */}
                <div className="glass-card relative group">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse">
                            TESTE ATIVO
                        </span>
                    </div>

                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Plano Atual</h3>
                    <div className="flex items-baseline gap-2 mb-8">
                        <span className="text-4xl font-black text-white">Básico</span>
                        <span className="text-2xl text-gray-500 font-bold">R$19,90/mês</span>
                    </div>

                    <div className="space-y-6 mb-8 bg-white/[0.02] p-6 rounded-xl border border-white/5">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300">Período de Teste</span>
                                <span className="text-yellow-500 font-bold">5 Dias Restantes</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 w-[30%] shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Seu teste grátis está ativo. Você tem acesso completo ao construtor de loja.
                            <a href="#" className="text-primary hover:underline ml-1">Ver detalhes de faturamento</a>
                        </p>
                    </div>

                    <button className="w-full btn btn-primary py-4 text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                        Fazer Upgrade do Plano
                    </button>
                </div>

                {/* Quick Start / Promo Card */}
                <div className="glass-card bg-gradient-to-br from-[#0a0f2c] to-[#1e0030] border-primary/20 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                    <div>
                        <h3 className="text-2xl font-bold mb-4 text-white relative z-10">Começar a Construir</h3>
                        <p className="text-gray-300 mb-8 relative z-10 text-lg">Pronto para lançar sua próxima loja? O Arquiteto IA está pronto para gerar seu império.</p>
                    </div>

                    <div className="space-y-4 relative z-10 mt-auto">
                        <button className="w-full btn bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center gap-3 py-4 text-white font-bold transition-all hover:scale-[1.02] group">
                            <span className="bg-yellow-400 text-black rounded-full p-1"><Zap className="w-3 h-3" /></span>
                            Lançar Novo Projeto
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* REFERRAL SYSTEM SECTION */}
                    <div className="glass-card border-blue-500/20 h-full">
                        <div className="flex flex-col gap-8 items-center h-full">
                            <div className="flex-1 space-y-4 w-full">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Indique & Lucre 🚀</h3>
                                <p className="text-gray-400 font-bold">Convide outros empreendedores para o EmpireBuilder e ganhe bônus por cada assinatura ativa.</p>

                                <div className="flex items-center gap-3 mt-6">
                                    <div className="bg-black/50 border border-white/10 px-6 py-4 rounded-2xl flex-1 flex items-center justify-between group">
                                        <span className="text-2xl font-black text-primary tracking-widest uppercase">{referralStats.code}</span>
                                        <button
                                            onClick={copyCode}
                                            className="p-2 hover:bg-white/5 rounded-xl transition-all"
                                        >
                                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400 group-hover:text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                                    <MousePointer2 className="w-5 h-5 text-blue-400 mx-auto opacity-50 mb-2" />
                                    <div className="text-2xl font-black text-white">{referralStats.clicks}</div>
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Cliques</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                                    <Users className="w-5 h-5 text-green-400 mx-auto opacity-50 mb-2" />
                                    <div className="text-2xl font-black text-white">{referralStats.conversions}</div>
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Indicações</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-1">
                                    <DollarSign className="w-5 h-5 text-primary mx-auto opacity-50 mb-2" />
                                    <div className="text-2xl font-black text-primary">${referralStats.earnings}</div>
                                    <div className="text-[10px] text-primary/50 font-black uppercase tracking-widest">Ganhos</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                                    <div className="w-5 h-5 text-gray-400 mx-auto opacity-50 mb-2 font-black text-sm">ROI</div>
                                    <div className="text-2xl font-black text-gray-300">--</div>
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Status</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1">
                    <div className="glass-card border-primary/20 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Flame className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Winning Detection</h3>
                        </div>
                        <p className="text-xs text-gray-500 font-bold mb-8">AI analysis of the top performing products matching your store's profile.</p>

                        <div className="mt-auto">
                            <WinningProductsWidget />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
