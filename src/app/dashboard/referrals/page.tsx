'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Gift, Copy, Check, Users, MousePointerClick,
    DollarSign, Trophy, Share2, ExternalLink, Star,
    TrendingUp, Zap, ChevronRight, RefreshCw, Facebook, Twitter, Crown
} from 'lucide-react';

interface LeaderboardUser {
    id: string;
    name: string;
    conversions: number;
    isCurrentUser: boolean;
}

interface ReferralStats {
    code: string;
    shareUrl: string;
    clicks: number;
    conversions: number;
    credits: number;
    referrals: {
        id: string;
        status: 'pending' | 'active' | 'rewarded';
        created_at: string;
        activated_at?: string;
    }[];
    referralsByStatus: { pending: number; active: number; rewarded: number };
    rewards: {
        type: string;
        value: number;
        description: string;
        created_at: string;
    }[];
}

const STATUS_STYLE = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    rewarded: 'bg-primary/10 text-primary border-primary/20',
};

const STATUS_LABEL = {
    pending: 'Pendente',
    active: 'Ativo',
    rewarded: 'Recompensado ✓',
};

function StatCard({ icon, label, value, sub, color = 'text-primary' }: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
    return (
        <div className="glass-card p-6 flex flex-col gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-3xl font-black text-white">{value}</div>
                {sub && <p className="text-xs text-gray-500 font-bold mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default function ReferralsPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<'code' | 'url' | null>(null);
    const [sharing, setSharing] = useState(false);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, leadRes] = await Promise.all([
                fetch('/api/referrals/stats'),
                fetch('/api/referrals/leaderboard')
            ]);
            
            if (statsRes.ok) setStats(await statsRes.json());
            if (leadRes.ok) {
                const leadData = await leadRes.json();
                setLeaderboard(leadData.leaderboard || []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const copyToClipboard = async (text: string, type: 'code' | 'url') => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleNativeShare = async () => {
        if (!stats) return;
        setSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'EmpireBuilder — Dropshipping com IA 🚀',
                    text: `Crie sua loja com IA em minutos — use meu link: ${stats.code}`,
                    url: stats.shareUrl,
                });
            } else {
                await copyToClipboard(stats.shareUrl, 'url');
            }
        } catch { }
        setSharing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const convRate = stats && stats.clicks > 0
        ? Math.round((stats.conversions / stats.clicks) * 100)
        : 0;

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Gift className="w-8 h-8 text-primary" /> Indique &amp; Ganhe
                </h1>
                <p className="text-gray-500 font-bold mt-1">
                    Ganhe <span className="text-primary font-black">R$ 25</span> por amigo, <span className="text-primary font-black">1 semana Premium</span> (5 amigos) e <span className="text-primary font-black">1 mês Premium</span> (10 amigos)!
                </p>
            </div>

            {/* Viral Share Card */}
            {stats && (
                <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                    <div className="flex items-center gap-2 mb-5">
                        <Share2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Seu Link de Indicação</span>
                    </div>

                    {/* Share URL */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-gray-300 truncate">
                            {stats.shareUrl}
                        </div>
                        <button
                            onClick={() => copyToClipboard(stats.shareUrl, 'url')}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                        >
                            {copied === 'url' ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Link</>}
                        </button>
                    </div>

                    {/* Code + Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Código:</span>
                            <span className="font-black text-white text-sm tracking-wider">{stats.code}</span>
                            <button onClick={() => copyToClipboard(stats.code, 'code')} className="text-gray-500 hover:text-white transition-colors">
                                {copied === 'code' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>

                        <button
                            onClick={handleNativeShare}
                            disabled={sharing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            <Share2 className="w-4 h-4" /> Compartilhar
                        </button>

                        {/* WhatsApp */}
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(`🚀 Crie sua loja com IA em minutos — use meu link: ${stats.shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-black uppercase tracking-widest hover:bg-[#25D366]/20 transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> WhatsApp
                        </a>

                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🚀 Crie sua loja com IA em minutos — use meu link: ${stats.shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400 text-xs font-black uppercase tracking-widest hover:bg-blue-400/20 transition-all"
                        >
                            <Twitter className="w-3.5 h-3.5" /> X / Twitter
                        </a>
                        
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats.shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                        >
                            <Facebook className="w-3.5 h-3.5" /> Facebook
                        </a>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<MousePointerClick className="w-5 h-5" />}
                        label="Cliques"
                        value={stats.clicks}
                        sub="No seu link"
                    />
                    <StatCard
                        icon={<Users className="w-5 h-5" />}
                        label="Indicados"
                        value={stats.conversions}
                        sub={`${convRate}% taxa de conv.`}
                        color="text-blue-400"
                    />
                    <StatCard
                        icon={<DollarSign className="w-5 h-5" />}
                        label="Créditos ganhos"
                        value={`R$ ${stats.credits}`}
                        sub="Recompensas acumuladas"
                        color="text-yellow-400"
                    />
                    <StatCard
                        icon={<Trophy className="w-5 h-5" />}
                        label="Recompensados"
                        value={stats.referralsByStatus.rewarded}
                        sub={`${stats.referralsByStatus.active} ativos`}
                        color="text-purple-400"
                    />
                </div>
            )}

            {/* How it works */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Como funciona</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { step: '1', icon: <Share2 className="w-5 h-5" />, title: 'Compartilhe seu link', desc: 'Envie para amigos que queiram fazer dropshipping.' },
                        { step: '2', icon: <Users className="w-5 h-5" />, title: 'Amigo se cadastra', desc: 'O amigo usa seu código e cria a conta.' },
                        { step: '3', icon: <DollarSign className="w-5 h-5" />, title: 'Você ganha R$ 25', desc: 'Crédito automático quando o amigo assina um plano.' },
                    ].map(({ step, icon, title, desc }) => (
                        <div key={step} className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                {icon}
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-0.5">Passo {step}</div>
                                <div className="font-black text-white text-sm">{title}</div>
                                <div className="text-gray-500 text-xs font-bold mt-0.5">{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                             <div className="text-sm font-black text-purple-400 uppercase tracking-widest">Bônus: 5 Amigos</div>
                             <Star className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-xl font-black text-white mb-1">+1 Semana Premium</div>
                        <div className="w-full bg-white/5 rounded-full h-2 mt-3">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats?.conversions || 0) / 5 * 100)}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-bold">{stats?.conversions || 0} de 5 amigos indicados</div>
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                             <div className="text-sm font-black text-yellow-500 uppercase tracking-widest">Bônus: 10 Amigos</div>
                             <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-xl font-black text-white mb-1">+1 Mês Premium</div>
                        <div className="w-full bg-white/5 rounded-full h-2 mt-3">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats?.conversions || 0) / 10 * 100)}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-bold">{stats?.conversions || 0} de 10 amigos indicados</div>
                    </div>
                </div>
            </div>

            {/* Referral History */}
            {stats && stats.referrals.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">Histórico de Indicações</span>
                    </div>
                    <div className="space-y-3">
                        {stats.referrals.map((r, i) => (
                            <div key={r.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-gray-500">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-white">Indicado</div>
                                        <div className="text-[10px] text-gray-600 font-mono">
                                            {new Date(r.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-xl border text-[10px] font-black uppercase tracking-wider ${STATUS_STYLE[r.status]}`}>
                                    {STATUS_LABEL[r.status]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Rewards History */}
            {stats && stats.rewards.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-black text-yellow-400 uppercase tracking-widest">Recompensas Recebidas</span>
                    </div>
                    <div className="space-y-3">
                        {stats.rewards.map((rw, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <div>
                                    <div className="text-sm font-black text-white">{rw.description}</div>
                                    <div className="text-[10px] text-gray-600 font-mono">
                                        {new Date(rw.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <div className="text-primary font-black text-sm">{rw.type === 'credit' ? `+ R$ ${rw.value}` : `+ ${rw.value} Dias`}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LEADERBOARD */}
            {leaderboard.length > 0 && (
                <div className="glass-card p-6 border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.02] to-transparent relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] pointer-events-none rounded-full" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Crown className="w-6 h-6 text-yellow-500" />
                            <h2 className="text-lg font-black text-yellow-500 uppercase tracking-widest">Top Parceiros Globais</h2>
                        </div>
                        
                        <div className="space-y-2">
                            {leaderboard.map((u, i) => (
                                <div key={u.id} className={`flex items-center justify-between p-4 rounded-xl border ${u.isCurrentUser ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/5'} transition-all`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-orange-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                                            {i + 1}
                                        </div>
                                        <div className={`font-black uppercase tracking-wider text-sm ${u.isCurrentUser ? 'text-yellow-400 inline-flex items-center gap-2' : 'text-white'}`}>
                                            {u.name} {u.isCurrentUser && <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 rounded text-yellow-500">Você</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="font-black text-white">{u.conversions}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
