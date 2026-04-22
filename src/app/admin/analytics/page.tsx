'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Users, DollarSign, TrendingDown, Activity, Package,
    Search, Store, RefreshCw, Zap, BarChart3, PieChart,
    TrendingUp, Video, Wand2, Calendar, ChevronDown
} from 'lucide-react';

type Range = 'today' | '7d' | '30d';

interface Metrics {
    range: string;
    users: { total: number; active: number };
    revenue: {
        mrr: number;
        activeSubscriptions: number;
        canceledSubscriptions: number;
        churnRate: number;
    };
    planDistribution: Record<string, number>;
    usage: {
        eventMap: Record<string, number>;
        topFeature: string;
        topFeatureCount: number;
        searches: number;
        productsAdded: number;
        storesCreated: number;
        aiOptimizations: number;
        tiktokExports: number;
    };
}

const RANGE_LABELS: Record<Range, string> = {
    today: 'Hoje',
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
};

const PLAN_COLORS: Record<string, string> = {
    free: 'bg-gray-500/20 text-gray-400',
    pro: 'bg-primary/20 text-primary',
    elite: 'bg-purple-500/20 text-purple-400',
    enterprise: 'bg-blue-500/20 text-blue-400',
};

function StatCard({
    icon, label, value, sub, color = 'text-primary', trend
}: {
    icon: React.ReactNode; label: string; value: string | number;
    sub?: string; color?: string; trend?: { dir: 'up' | 'down'; text: string };
}) {
    return (
        <div className="glass-card p-6 flex flex-col gap-4 hover:border-white/15 transition-all group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</div>
                <div className="text-3xl font-black text-white">{value}</div>
                {sub && <div className="text-xs text-gray-500 font-bold mt-1">{sub}</div>}
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-[11px] font-black ${trend.dir === 'up' ? 'text-primary' : 'text-red-400'}`}>
                        {trend.dir === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend.text}
                    </div>
                )}
            </div>
        </div>
    );
}

function EventBar({ label, count, max, icon }: { label: string; count: number; max: number; icon: React.ReactNode }) {
    const pct = max > 0 ? Math.round((count / max) * 100) : 0;
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-44 shrink-0 text-xs font-bold text-gray-400">
                {icon}<span className="truncate">{label}</span>
            </div>
            <div className="flex-grow bg-white/5 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs font-black text-white w-12 text-right">{count.toLocaleString()}</div>
        </div>
    );
}

export default function AnalyticsDashboard() {
    const [range, setRange] = useState<Range>('30d');
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/metrics?range=${range}`);
            if (res.ok) setMetrics(await res.json());
        } finally {
            setLoading(false);
        }
    }, [range]);

    const fetchInsights = async () => {
        setInsightsLoading(true);
        try {
            const res = await fetch('/api/analytics/insights');
            if (res.ok) {
                const data = await res.json();
                setInsights(data.insights);
            }
        } finally {
            setInsightsLoading(false);
        }
    };

    useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-gray-500 font-bold animate-pulse">Carregando analytics...</p>
                </div>
            </div>
        );
    }

    const m = metrics;
    const totalEvents = m ? Object.values(m.usage.eventMap).reduce((a, b) => a + b, 0) : 0;
    const topEventCount = m ? Math.max(...Object.values(m.usage.eventMap), 1) : 1;

    const eventIcons: Record<string, React.ReactNode> = {
        search_performed: <Search className="w-3.5 h-3.5" />,
        product_added: <Package className="w-3.5 h-3.5" />,
        product_imported: <Package className="w-3.5 h-3.5" />,
        store_created: <Store className="w-3.5 h-3.5" />,
        ai_optimize_used: <Wand2 className="w-3.5 h-3.5" />,
        tiktok_export_used: <Video className="w-3.5 h-3.5" />,
        user_login: <Users className="w-3.5 h-3.5" />,
        user_signup: <Users className="w-3.5 h-3.5" />,
        subscription_started: <Zap className="w-3.5 h-3.5" />,
        subscription_canceled: <TrendingDown className="w-3.5 h-3.5" />,
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <BarChart3 className="w-8 h-8 text-primary" /> Analytics
                    </h1>
                    <p className="text-gray-500 font-bold mt-1">MRR, usuários, churn e uso da plataforma.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Range selector */}
                    <div className="relative">
                        <select
                            value={range}
                            onChange={(e) => setRange(e.target.value as Range)}
                            className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-xs text-white font-black uppercase tracking-widest focus:border-primary focus:outline-none"
                        >
                            {Object.entries(RANGE_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    </div>

                    <button
                        onClick={fetchMetrics}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {m && (
                <>
                    {/* Core KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={<Users className="w-5 h-5" />}
                            label="Total Usuários"
                            value={m.users.total.toLocaleString()}
                            sub={`${m.users.active} ativos no período`}
                        />
                        <StatCard
                            icon={<DollarSign className="w-5 h-5" />}
                            label="MRR"
                            value={`R$ ${m.revenue.mrr.toLocaleString()}`}
                            sub={`${m.revenue.activeSubscriptions} assinaturas ativas`}
                            color="text-green-400"
                        />
                        <StatCard
                            icon={<TrendingDown className="w-5 h-5" />}
                            label="Taxa de Churn"
                            value={`${m.revenue.churnRate}%`}
                            sub={`${m.revenue.canceledSubscriptions} cancelamentos`}
                            color="text-red-400"
                        />
                        <StatCard
                            icon={<Activity className="w-5 h-5" />}
                            label="Eventos Totais"
                            value={totalEvents.toLocaleString()}
                            sub={`Período: ${RANGE_LABELS[range]}`}
                            color="text-blue-400"
                        />
                    </div>

                    {/* Usage stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={<Search className="w-5 h-5" />} label="Buscas" value={m.usage.searches} color="text-yellow-400" />
                        <StatCard icon={<Package className="w-5 h-5" />} label="Produtos" value={m.usage.productsAdded} color="text-purple-400" />
                        <StatCard icon={<Wand2 className="w-5 h-5" />} label="AI Otimizações" value={m.usage.aiOptimizations} color="text-primary" />
                        <StatCard icon={<Video className="w-5 h-5" />} label="TikTok Exports" value={m.usage.tiktokExports} color="text-pink-400" />
                    </div>

                    {/* Bottom row: Plan distribution + Event breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Plan Distribution */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <PieChart className="w-4 h-4 text-primary" />
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Distribuição de Planos</h3>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(m.planDistribution).length > 0 ? (
                                    Object.entries(m.planDistribution)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([plan, count]) => {
                                            const total = Object.values(m.planDistribution).reduce((a, b) => a + b, 0);
                                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                            return (
                                                <div key={plan} className="flex items-center justify-between">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${PLAN_COLORS[plan] ?? 'bg-gray-500/20 text-gray-400'}`}>
                                                        {plan}
                                                    </span>
                                                    <div className="flex items-center gap-3 flex-grow mx-4">
                                                        <div className="flex-grow bg-white/5 rounded-full h-2 overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                    <span className="text-white font-black text-sm">{count}</span>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="text-gray-600 text-sm font-bold">Nenhuma assinatura ainda.</p>
                                )}
                            </div>
                        </div>

                        {/* Feature Usage */}
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Activity className="w-4 h-4 text-primary" />
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Uso de Features</h3>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(m.usage.eventMap)
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 8)
                                    .map(([event, count]) => (
                                        <EventBar
                                            key={event}
                                            label={event.replace(/_/g, ' ')}
                                            count={count}
                                            max={topEventCount}
                                            icon={eventIcons[event] ?? <Activity className="w-3.5 h-3.5" />}
                                        />
                                    ))
                                }
                                {Object.keys(m.usage.eventMap).length === 0 && (
                                    <p className="text-gray-600 text-sm font-bold">Nenhum evento ainda. Comece a usar a plataforma!</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="glass-card p-6 border-primary/20 bg-primary/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="text-xs font-black text-primary uppercase tracking-widest">AI Growth Insights</span>
                            </div>
                            <button
                                onClick={fetchInsights}
                                disabled={insightsLoading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50"
                            >
                                {insightsLoading
                                    ? <><RefreshCw className="w-3 h-3 animate-spin" /> Analisando...</>
                                    : <><Zap className="w-3 h-3" /> Gerar Insights</>
                                }
                            </button>
                        </div>
                        {insights ? (
                            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{insights}</p>
                        ) : (
                            <p className="text-gray-600 text-sm font-bold">
                                Clique em "Gerar Insights" para obter uma análise de tendências baseada em IA.
                                {!process.env.NEXT_PUBLIC_SUPABASE_URL && ' (Requer OPENAI_API_KEY configurado)'}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
