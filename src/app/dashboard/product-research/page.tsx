'use client';

import { useState } from 'react';
import {
    Sparkles, Search, TrendingUp, DollarSign, Users, Zap,
    AlertTriangle, RefreshCw, ChevronRight, Flame, Target,
    Heart, Brain, ArrowRight, BarChart3
} from 'lucide-react';

interface WinningProduct {
    name: string;
    why_it_sells: string;
    audience_fit: string;
    viral_potential: string;
    estimated_cost_brl: number;
    suggested_price_brl: number;
    profit_margin_pct: number;
    problem_solved: string;
    emotional_trigger: string;
}

interface ResearchResult {
    products: WinningProduct[];
    generated_at: string;
}

const NICHE_SUGGESTIONS = [
    'Saúde e bem-estar', 'Pet care', 'Home office', 'Beleza feminina',
    'Fitness', 'Bebês e maternidade', 'Tecnologia', 'Moda feminina',
    'Cozinha e casa', 'Esportes ao ar livre'
];

const AUDIENCE_SUGGESTIONS = [
    'Mulheres 25-45 anos', 'Jovens 18-30 anos', 'Mães de primeira viagem',
    'Trabalhadores remotos', 'Estudantes universitários', 'Homens 30-50 anos',
    'Empreendedores iniciantes', 'Pessoas com pets', 'Atletas amadores'
];

function MarginBadge({ margin }: { margin: number }) {
    const color = margin >= 55 ? 'text-green-400 bg-green-400/10 border-green-400/20'
        : margin >= 40 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
            : 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    const label = margin >= 55 ? '🔥 Alta' : margin >= 40 ? '✅ Boa' : '⚠️ Ok';
    return (
        <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${color}`}>
            {label} {margin}%
        </span>
    );
}

function ProductCard({ product, index }: { product: WinningProduct; index: number }) {
    const profit = product.suggested_price_brl - product.estimated_cost_brl;
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div
            className="glass-card p-6 flex flex-col gap-5 border-white/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,240,255,0.08)]"
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{medals[index]}</span>
                    <h3 className="text-base font-black text-white leading-tight">{product.name}</h3>
                </div>
                <MarginBadge margin={product.profit_margin_pct} />
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Custo</div>
                    <div className="text-sm font-black text-gray-300">
                        R$ {product.estimated_cost_brl.toFixed(2).replace('.', ',')}
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <div className="text-[10px] text-primary/60 font-bold uppercase tracking-wider mb-1">Venda</div>
                    <div className="text-sm font-black text-primary">
                        R$ {product.suggested_price_brl.toFixed(2).replace('.', ',')}
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 text-center">
                    <div className="text-[10px] text-green-500/60 font-bold uppercase tracking-wider mb-1">Lucro</div>
                    <div className="text-sm font-black text-green-400">
                        R$ {profit.toFixed(2).replace('.', ',')}
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Por que vende</div>
                        <p className="text-xs text-gray-300 leading-relaxed">{product.why_it_sells}</p>
                    </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Fit com o público</div>
                        <p className="text-xs text-gray-300 leading-relaxed">{product.audience_fit}</p>
                    </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Potencial viral</div>
                        <p className="text-xs text-gray-300 leading-relaxed">{product.viral_potential}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="flex gap-2 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <Target className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] font-black text-purple-400/60 uppercase tracking-widest mb-1">Problema</div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">{product.problem_solved}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 p-3 rounded-xl bg-pink-500/5 border border-pink-500/10">
                        <Heart className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[10px] font-black text-pink-400/60 uppercase tracking-widest mb-1">Gatilho</div>
                            <p className="text-[11px] text-gray-300 leading-relaxed">{product.emotional_trigger}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingState() {
    const steps = [
        'Analisando tendências de mercado...',
        'Pesquisando produtos vencedores...',
        'Calculando margens de lucro...',
        'Avaliando potencial viral...',
        'Finalizando estratégia...',
    ];
    const [step] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Brain className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-2">
                <p className="text-primary font-black text-sm uppercase tracking-widest animate-pulse">
                    IA Pesquisando Produtos...
                </p>
                <p className="text-gray-500 text-xs">{steps[step % steps.length]}</p>
            </div>
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: `${i * 200}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function ProductResearchPage() {
    const [niche, setNiche] = useState('');
    const [audience, setAudience] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ResearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!niche.trim() || !audience.trim()) {
            setError('Preencha o nicho e o público-alvo para continuar.');
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai/product-research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ niche: niche.trim(), audience: audience.trim() }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Erro desconhecido');
            setResult(data.data);
        } catch (e: any) {
            setError(e.message || 'Falha ao gerar pesquisa. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Pesquisa de Produtos com IA</h1>
                        <p className="text-gray-400 text-sm">Descubra os 3 melhores produtos para o seu nicho em segundos</p>
                    </div>
                </div>
            </div>

            {/* Input Form */}
            <div className="glass-card p-6 space-y-6 border-primary/10">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Niche Input */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-black text-gray-300 uppercase tracking-widest">
                            <BarChart3 className="w-4 h-4 text-primary" />
                            Nicho
                        </label>
                        <input
                            type="text"
                            value={niche}
                            onChange={(e) => setNiche(e.target.value)}
                            placeholder="Ex: Saúde e bem-estar, Pet care..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                            {NICHE_SUGGESTIONS.slice(0, 5).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setNiche(s)}
                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all font-bold uppercase tracking-wide"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audience Input */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-black text-gray-300 uppercase tracking-widest">
                            <Users className="w-4 h-4 text-blue-400" />
                            Público-alvo
                        </label>
                        <input
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            placeholder="Ex: Mulheres 25-45 anos, Jovens universitários..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                        />
                        <div className="flex flex-wrap gap-2">
                            {AUDIENCE_SUGGESTIONS.slice(0, 5).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setAudience(s)}
                                    className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-400/30 transition-all font-bold uppercase tracking-wide"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 ${isLoading
                        ? 'bg-primary/30 text-primary/60 cursor-wait'
                        : 'bg-primary text-black hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-[0.99]'
                        }`}
                >
                    {isLoading ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Pesquisando com IA...</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Gerar Top 3 Produtos Vencedores</>
                    )}
                </button>
            </div>

            {/* Loading */}
            {isLoading && <LoadingState />}

            {/* Results */}
            {result && !isLoading && (
                <div className="space-y-6">
                    {/* Result Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary" />
                            <div>
                                <h2 className="text-lg font-black text-white">Top 3 Produtos para: <span className="text-primary">{niche}</span></h2>
                                <p className="text-xs text-gray-500">Público: {audience} · Gerado agora</p>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Gerar novamente
                        </button>
                    </div>

                    {/* Product Cards */}
                    <div className="grid md:grid-cols-3 gap-5">
                        {result.products.map((product, i) => (
                            <ProductCard key={i} product={product} index={i} />
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="glass-card p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                                <ArrowRight className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Pronto para importar um desses produtos?</p>
                                <p className="text-xs text-gray-400">Vá para Buscar Produtos e importe direto para sua loja Shopify</p>
                            </div>
                        </div>
                        <a
                            href="/dashboard/product-finder"
                            className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Ir para Produtos
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
