'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    AlertTriangle, Lightbulb, TrendingUp, AlertCircle,
    Star, CheckCircle2, Clock, XCircle, RefreshCw,
    Filter, Zap, MessageSquare, Users, Activity
} from 'lucide-react';

type FeedbackType = 'bug' | 'suggestion' | 'improvement' | 'complaint';
type FeedbackStatus = 'pending' | 'in_review' | 'resolved' | 'wont_fix';
type FeedbackPriority = 'low' | 'normal' | 'high' | 'critical';

interface FeedbackItem {
    id: string;
    user_id: string;
    type: FeedbackType;
    message: string;
    rating: number | null;
    page: string | null;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    created_at: string;
}

interface Summary {
    stats: {
        total: number;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
        avgRating: number;
        highPriority: number;
    };
    aiSummary: string;
}

const TYPE_ICONS: Record<FeedbackType, React.ReactNode> = {
    bug: <AlertTriangle className="w-3.5 h-3.5" />,
    suggestion: <Lightbulb className="w-3.5 h-3.5" />,
    improvement: <TrendingUp className="w-3.5 h-3.5" />,
    complaint: <AlertCircle className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<FeedbackType, string> = {
    bug: 'bg-red-500/15 text-red-400 border-red-500/30',
    suggestion: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    improvement: 'bg-primary/15 text-primary border-primary/30',
    complaint: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const PRIORITY_COLORS: Record<FeedbackPriority, string> = {
    low: 'bg-gray-500/10 text-gray-500',
    normal: 'bg-blue-500/10 text-blue-400',
    high: 'bg-orange-500/10 text-orange-400',
    critical: 'bg-red-500/10 text-red-400',
};

const STATUS_ICONS: Record<FeedbackStatus, React.ReactNode> = {
    pending: <Clock className="w-3.5 h-3.5" />,
    in_review: <Activity className="w-3.5 h-3.5" />,
    resolved: <CheckCircle2 className="w-3.5 h-3.5" />,
    wont_fix: <XCircle className="w-3.5 h-3.5" />,
};

export default function AdminFeedbackPage() {
    const [items, setItems] = useState<FeedbackItem[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<FeedbackPriority | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('pending');


    const fetchFeedback = useCallback(async () => {
        setLoading(true);
        let query = supabase
            .from('beta_feedback')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (filterType !== 'all') query = query.eq('type', filterType);
        if (filterPriority !== 'all') query = query.eq('priority', filterPriority);
        if (filterStatus !== 'all') query = query.eq('status', filterStatus);

        const { data, error } = await query;
        if (!error && data) setItems(data as FeedbackItem[]);
        setLoading(false);
    }, [filterType, filterPriority, filterStatus, supabase]);

    const fetchSummary = async () => {
        setSummaryLoading(true);
        try {
            const res = await fetch('/api/feedback/summary');
            const data = await res.json();
            setSummary(data);
        } catch { }
        setSummaryLoading(false);
    };

    useEffect(() => { fetchFeedback(); }, [fetchFeedback]);
    useEffect(() => { fetchSummary(); }, []);

    const updateStatus = async (id: string, newStatus: FeedbackStatus) => {
        await supabase.from('beta_feedback').update({ status: newStatus }).eq('id', id);
        setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    };

    const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
        <div className="glass-card p-5 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${color ?? 'bg-primary/10 text-primary'} border border-white/5`}>{icon}</div>
            <div>
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</div>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                        <MessageSquare className="w-8 h-8 text-primary" /> Beta Feedback
                    </h1>
                    <p className="text-gray-500 font-bold mt-1">Central de feedback dos usuários beta.</p>
                </div>
                <button onClick={fetchFeedback} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<Users className="w-5 h-5" />} label="Total Feedback" value={summary.stats.total} />
                    <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Alta Prioridade" value={summary.stats.highPriority} color="bg-red-500/10 text-red-400" />
                    <StatCard icon={<Star className="w-5 h-5" />} label="Nota Média" value={summary.stats.avgRating > 0 ? `${summary.stats.avgRating} ★` : 'N/A'} color="bg-yellow-500/10 text-yellow-400" />
                    <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Bugs" value={summary.stats.byType?.bug ?? 0} color="bg-orange-500/10 text-orange-400" />
                </div>
            )}

            {/* AI Summary */}
            {summary?.aiSummary && (
                <div className="glass-card p-6 border-primary/20 bg-primary/[0.02]">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black text-primary uppercase tracking-widest">AI Summary</span>
                        {summaryLoading && <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{summary.aiSummary}</p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 text-gray-500">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Filtrar:</span>
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold uppercase tracking-wider focus:border-primary focus:outline-none"
                >
                    <option value="all">Todos os status</option>
                    <option value="pending">Pendente</option>
                    <option value="in_review">Em análise</option>
                    <option value="resolved">Resolvido</option>
                    <option value="wont_fix">Não corrigir</option>
                </select>

                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold uppercase tracking-wider focus:border-primary focus:outline-none"
                >
                    <option value="all">Todos os tipos</option>
                    <option value="bug">Bug</option>
                    <option value="suggestion">Sugestão</option>
                    <option value="improvement">Melhoria</option>
                    <option value="complaint">Reclamação</option>
                </select>

                <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold uppercase tracking-wider focus:border-primary focus:outline-none"
                >
                    <option value="all">Todas as prioridades</option>
                    <option value="high">Alta prioridade</option>
                    <option value="normal">Normal</option>
                    <option value="low">Baixa</option>
                </select>
            </div>

            {/* Feedback List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
                    <MessageSquare className="w-12 h-12 text-gray-700 mb-4" />
                    <p className="text-gray-500 font-bold">Nenhum feedback encontrado com estes filtros.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.id} className="glass-card p-5 hover:border-white/15 transition-all">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                {/* Info */}
                                <div className="flex-grow">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${TYPE_COLORS[item.type]}`}>
                                            {TYPE_ICONS[item.type]} {item.type}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${PRIORITY_COLORS[item.priority]}`}>
                                            {item.priority}
                                        </span>
                                        {item.rating && (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-yellow-400">
                                                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                            </span>
                                        )}
                                        {item.page && (
                                            <span className="text-[10px] text-gray-600 font-mono truncate max-w-[150px]">{item.page}</span>
                                        )}
                                    </div>

                                    <p className="text-white text-sm leading-relaxed">{item.message}</p>

                                    <p className="text-[10px] text-gray-600 mt-2 font-mono">
                                        {new Date(item.created_at).toLocaleString('pt-BR')}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${item.status === 'resolved' ? 'border-green-500/30 bg-green-500/10 text-green-400' :
                                        item.status === 'in_review' ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' :
                                            item.status === 'wont_fix' ? 'border-gray-500/30 bg-gray-500/10 text-gray-500' :
                                                'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                                        }`}>
                                        {STATUS_ICONS[item.status]} {item.status.replace('_', ' ')}
                                    </span>

                                    <select
                                        value={item.status}
                                        onChange={(e) => updateStatus(item.id, e.target.value as FeedbackStatus)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white font-bold uppercase tracking-wider focus:border-primary focus:outline-none"
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="in_review">Em análise</option>
                                        <option value="resolved">Resolvido</option>
                                        <option value="wont_fix">Não corrigir</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
