'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, Users, MousePointer2, DollarSign, Copy, Check, Sparkles, Megaphone, ArrowRight, Gift } from 'lucide-react';
import WinningProductsWidget from '@/components/dashboard/WinningProductsWidget';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardOverview() {
    const { user } = useAuth();
    const displayName = user?.user_metadata?.full_name
        || user?.email?.split('@')[0]
        || 'Empreendedor';

    const [referralStats, setReferralStats] = useState({
        code: '---',
        clicks: 0,
        conversions: 0,
        earnings: 0,
    });
    const [copied, setCopied] = useState(false);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/referrals/stats');
                if (!res.ok) return;
                const data = await res.json();
                if (data.code) {
                    setReferralStats(data);
                }
            } catch {
                // silently fail — user still sees dashboard
            } finally {
                setStatsLoaded(true);
            }
        };
        fetchStats();
    }, []);

    const copyCode = () => {
        if (referralStats.code === '---') return;
        navigator.clipboard.writeText(referralStats.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Referral reward tiers
    const referralTiers = [
        { count: 5, reward: '7 dias grátis', icon: '🎁' },
        { count: 10, reward: '1 mês grátis', icon: '🏆' },
    ];

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
            {/* Welcome Header */}
            <div className="mb-2">
                <h1 className="text-3xl font-black text-white mb-2">
                    Bem-vindo de volta, <span className="text-primary">{displayName}</span> 👋
                </h1>
                <p className="text-gray-400">Seu império de e-commerce está pronto para crescer.</p>
            </div>

            {/* AI Tools Quick Access */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* AI Store Builder Card */}
                <Link href="/dashboard/builder"
                    className="glass-card group hover:border-primary/40 hover:bg-primary/[0.04] transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4 group-hover:bg-primary/20 transition-all" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase tracking-widest animate-pulse">BETA</span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Construtor de Loja IA</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Descreva sua marca e a IA gera produtos, preços em BRL, estratégia e passos de lançamento.
                        </p>
                        <div className="flex items-center gap-2 text-primary text-sm font-black group-hover:gap-3 transition-all">
                            Abrir Construtor <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>

                {/* AI Ad Generator Card */}
                <Link href="/dashboard/ad-generator"
                    className="glass-card group hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4 group-hover:bg-purple-500/20 transition-all" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                <Megaphone className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase tracking-widest">NOVO</span>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Gerador de Anúncios IA</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Gere anúncios completos para TikTok, Instagram e Facebook com hook, roteiro e legenda.
                        </p>
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-black group-hover:gap-3 transition-all">
                            Gerar Anúncios <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Status + Referrals Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Beta Status Card */}
                <div className="glass-card border-yellow-500/20 bg-yellow-500/[0.02]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Status Beta</h3>
                        <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-500/30 animate-pulse">
                            ATIVO
                        </span>
                    </div>
                    <div className="text-2xl font-black text-white mb-1">14 Dias</div>
                    <p className="text-xs text-gray-500 font-bold mb-4">Acesso beta gratuito completo</p>
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
                        <div className="h-1.5 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full w-[35%]" />
                    </div>
                    <Link href="/dashboard/billing" className="text-xs text-primary font-black hover:underline flex items-center gap-1">
                        Ver planos <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Referral Card */}
                <div className="lg:col-span-2 glass-card border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Minhas Indicações 🚀</h3>
                            <p className="text-xs text-gray-500 font-bold">Convide amigos e ganhe acesso grátis</p>
                        </div>
                    </div>

                    {/* Referral code */}
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                        <div className="bg-black/50 border border-white/10 px-5 py-3 rounded-xl flex-1 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <span className="text-xl font-black text-blue-400 tracking-widest">{statsLoaded ? referralStats.code : '...'}</span>
                            <button onClick={copyCode} className="p-2 hover:bg-blue-500/20 rounded-lg transition-all" title="Copiar código">
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-400 hover:text-blue-300" />}
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6 relative z-10 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Progresso</span>
                            <span className="text-sm font-black text-white bg-white/10 px-2 py-0.5 rounded-md">
                                {referralStats.conversions} / {referralStats.conversions < 5 ? 5 : 10} indicações
                            </span>
                        </div>
                        <div className="w-full bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min((referralStats.conversions / (referralStats.conversions < 5 ? 5 : 10)) * 100, 100)}%` }} 
                            />
                        </div>
                    </div>

                    {/* Reward tiers */}
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        {referralTiers.map(tier => (
                            <div key={tier.count} className={`p-4 rounded-xl border transition-all ${referralStats.conversions >= tier.count ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{tier.icon}</span>
                                    <div>
                                        <div className="text-sm font-black text-white">{tier.count} indicações</div>
                                        <div className={`text-xs font-bold ${referralStats.conversions >= tier.count ? 'text-blue-400' : 'text-gray-500'}`}>{tier.reward}</div>
                                    </div>
                                    {referralStats.conversions >= tier.count && (
                                        <div className="ml-auto bg-green-500/20 text-green-500 p-1 rounded-full">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Winning Products */}
            <div className="glass-card border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Produtos em Alta 🔥</h3>
                </div>
                <p className="text-xs text-gray-500 font-bold mb-6">Análise IA dos produtos com melhor desempenho no mercado brasileiro.</p>
                <WinningProductsWidget />
            </div>
        </div>
    );
}
