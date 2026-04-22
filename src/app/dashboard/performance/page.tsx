'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPerformanceSummary, getRevenueSeries, getTopProducts, getAIInsights, KPI, ChartPoint, ProductPerformance, AIInsight } from '@/lib/performance';
import PerformanceChart from '@/components/PerformanceChart';
import { ArrowUp, ArrowDown, TrendingUp, Sparkles, ShoppingBag, Video, Zap, Activity, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PerformancePage() {
    const { user } = useAuth();

    // State
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [chartData, setChartData] = useState<ChartPoint[]>([]);
    const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<'7d' | '14d' | '30d'>('7d');

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user, range]);

    const loadData = async () => {
        if (!user) return;
        // Parallel fetch
        const [kpiRes, chartRes, prodRes, insightRes] = await Promise.all([
            getPerformanceSummary(user.id),
            getRevenueSeries(user.id, range),
            getTopProducts(user.id),
            getAIInsights(user.id)
        ]);

        setKpis(kpiRes);
        setChartData(chartRes);
        setTopProducts(prodRes);
        setInsights(insightRes);
        setLoading(false);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen pb-20">
            {/* HEADER */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                        Performance <Activity className="text-primary w-8 h-8" />
                    </h1>
                    <p className="text-gray-400">Track your sales, products, and AI-powered insights.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    {(['7d', '14d', '30d'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${range === r ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />) : kpis.map((kpi, i) => (
                    <div key={i} className="glass-card p-6 border-primary/20 hover:border-primary/50 transition-colors">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{kpi.label}</div>
                        <div className="text-3xl font-black text-white mb-2">{kpi.value}</div>
                        <div className={`flex items-center text-xs font-bold ${kpi.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {kpi.trendDirection === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                            {kpi.trend}% vs last period
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">

                {/* LEFT: CHART (2/3 width) */}
                <div className="lg:col-span-2 glass-card p-6 border-white/10 flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            Revenue Trend <TrendingUp className="w-5 h-5 text-green-400" />
                        </h3>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                            Live Estimate
                        </span>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        {loading ? <div className="w-full h-full bg-white/5 animate-pulse rounded-xl" /> : (
                            <PerformanceChart data={chartData} />
                        )}
                    </div>
                </div>

                {/* RIGHT: AI INSIGHTS (1/3 width) */}
                <div className="glass-card p-0 overflow-hidden border-purple-500/30 flex flex-col">
                    <div className="p-6 bg-purple-500/10 border-b border-purple-500/20">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            AI Insights <Sparkles className="w-5 h-5 text-purple-400" />
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Optimization opportunities detected</p>
                    </div>
                    <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                        {loading ? <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />)}</div> : insights.map((insight) => (
                            <div key={insight.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                                        {insight.category === 'timing' && <Clock className="w-4 h-4" />}
                                        {insight.category === 'product' && <ShoppingBag className="w-4 h-4" />}
                                        {insight.category === 'conversion' && <TrendingUp className="w-4 h-4" />}
                                        {insight.category === 'viral' && <Zap className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 leading-relaxed mb-3">
                                            {insight.text}
                                        </p>
                                        {insight.actionLabel && (
                                            <Link href={insight.actionLink || '#'} className="text-xs font-bold text-purple-400 hover:text-white uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                                                {insight.actionLabel} <ArrowUp className="w-3 h-3 rotate-45" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM: TOP PRODUCTS & ACTIONS */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* LEFT: TOP PRODUCTS (2/3) */}
                <div className="lg:col-span-2 glass-card p-6 border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6">Top Performing Products</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-gray-500 uppercase border-b border-white/10">
                                    <th className="pb-3 pl-2">Product</th>
                                    <th className="pb-3 text-right">Units</th>
                                    <th className="pb-3 text-right">Revenue</th>
                                    <th className="pb-3 text-center">Trend</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? [1, 2, 3].map(i => <tr key={i} className="h-16"><td colSpan={5} className="bg-white/5 animate-pulse" /></tr>) : topProducts.map((p) => (
                                    <tr key={p.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-2 font-bold text-white">{p.name}</td>
                                        <td className="py-4 text-right text-gray-300">{p.unitsSold}</td>
                                        <td className="py-4 text-right text-green-400 font-mono">{formatCurrency(p.revenue)}</td>
                                        <td className="py-4 text-center">
                                            {p.trend === 'up'
                                                ? <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                                                : <TrendingUp className="w-4 h-4 text-red-500 mx-auto rotate-180" />
                                            }
                                        </td>
                                        <td className="py-4 text-right">
                                            <button className="text-xs font-bold text-primary hover:text-white border border-primary/30 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all">
                                                Analyze
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {topProducts.length === 0 && !loading && (
                            <div className="text-center py-10 text-gray-500">
                                No products found. Add products to see analytics.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: QUICK ACTIONS (1/3) */}
                <div className="glass-card p-6 border-white/10 flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <QuickAction
                            href="/dashboard/product-finder"
                            icon={<Sparkles className="w-5 h-5 text-purple-400" />}
                            title="Generate AI Content"
                            desc="Create thumbnails or scripts"
                        />
                        <QuickAction
                            href="/dashboard/tiktok-posts"
                            icon={<Video className="w-5 h-5 text-[#00f2ea]" />}
                            title="Schedule TikTok"
                            desc="Manage upcoming posts"
                        />
                        <QuickAction
                            href="/dashboard/trends"
                            icon={<Zap className="w-5 h-5 text-orange-400" />}
                            title="Viral Radar"
                            desc="Spot new trends early"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ href, icon, title, desc }: any) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-black/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <div className="font-bold text-white text-sm">{title}</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">{desc}</div>
            </div>
            <ArrowUp className="w-4 h-4 text-gray-600 ml-auto rotate-45 group-hover:text-white transition-colors" />
        </Link>
    );
}
