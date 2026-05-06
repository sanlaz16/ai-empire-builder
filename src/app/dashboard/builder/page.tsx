'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle, ShoppingBag, DollarSign, Store, Megaphone, Rocket, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const MAX_CHARS = 5000;

const NICHE_CHIPS = [
    { label: 'Pets 🐾', text: 'Nicho: produtos para pets (cães e gatos). ' },
    { label: 'Fitness 💪', text: 'Nicho: fitness e suplementos. ' },
    { label: 'Tech 🎧', text: 'Nicho: gadgets e tecnologia. ' },
    { label: 'Moda 👗', text: 'Nicho: moda feminina e acessórios. ' },
    { label: 'Beleza ✨', text: 'Nicho: cosméticos e skincare. ' },
    { label: 'Casa 🏠', text: 'Nicho: decoração e organização do lar. ' },
    { label: 'Kids 👶', text: 'Nicho: produtos infantis e educativos. ' },
    { label: 'Esportes ⚽', text: 'Nicho: esportes e atividades ao ar livre. ' },
];

interface ProductIdea {
    nome: string;
    descricao: string;
    precoSugerido: string;
    margemEstimada: string;
}

interface AdIdea {
    tipo: string;
    conceito: string;
}

interface StoreResult {
    produtosIdeas: ProductIdea[];
    estrategiaPreco: string;
    configuracaoLoja: string[];
    ideiasAnuncio: AdIdea[];
    passosLancamento: string[];
}

const LOADING_STEPS = [
    '>> Analisando nicho e mercado...',
    '>> Gerando ideias de produtos...',
    '>> Calculando preços em BRL...',
    '>> Montando estratégia de lançamento...',
];

export default function AIStoreBuilder() {
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<StoreResult | null>(null);
    const [error, setError] = useState('');
    const [loadingStep, setLoadingStep] = useState(0);
    const loadingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isGenerating) {
            setLoadingStep(0);
            loadingInterval.current = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
            }, 1800);
        } else {
            if (loadingInterval.current) clearInterval(loadingInterval.current);
        }
        return () => { if (loadingInterval.current) clearInterval(loadingInterval.current); };
    }, [isGenerating]);

    const appendNiche = (text: string) => {
        if (prompt.length + text.length <= MAX_CHARS) {
            setPrompt(prev => prev + text);
        }
    };

    const handleGenerate = async () => {
        setError('');
        if (!prompt.trim() || prompt.trim().length < 10) {
            setError(t('builder.errorEmpty'));
            return;
        }
        setIsGenerating(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai/build-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt.trim() }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json.error || t('builder.errorApi'));
                return;
            }
            setResult(json.data);
        } catch {
            setError(t('builder.errorApi'));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto min-h-screen pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white">
                        <span className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                            <Sparkles className="w-6 h-6" />
                        </span>
                        <span className="gradient-text">{t('builder.title')}</span>
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {t('builder.betaBadge')}
                    </span>
                </div>
                <p className="text-gray-400 max-w-2xl leading-relaxed">{t('builder.subtitle')}</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* ── Input Panel ── */}
                <div className="space-y-5">
                    <div className="glass-card">
                        <div className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm font-bold flex items-center gap-2">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Niche quick-fill chips */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
                                    {t('builder.nicheLabel')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {NICHE_CHIPS.map(chip => (
                                        <button
                                            key={chip.label}
                                            type="button"
                                            onClick={() => appendNiche(chip.text)}
                                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 font-bold hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main prompt textarea */}
                            <div>
                                <div className="flex justify-between items-baseline mb-3">
                                    <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                                        {t('builder.promptLabel')}
                                    </label>
                                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">IA Otimizado</span>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-80 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none text-sm leading-relaxed placeholder:text-gray-600"
                                        placeholder={t('builder.promptPlaceholder')}
                                        value={prompt}
                                        maxLength={MAX_CHARS}
                                        onChange={(e) => setPrompt(e.target.value)}
                                    />
                                    <div className={`absolute bottom-4 right-4 text-xs px-2 py-1 rounded backdrop-blur-sm font-mono ${prompt.length > MAX_CHARS * 0.9 ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-500 bg-black/50'}`}>
                                        {prompt.length.toLocaleString('pt-BR')} / {MAX_CHARS.toLocaleString('pt-BR')} {t('builder.charCount')}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-3 flex items-center gap-2">{t('builder.promptTip')}</p>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt.trim()}
                                className={`w-full py-5 text-lg font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${isGenerating
                                    ? 'bg-primary/20 text-primary cursor-wait border border-primary/20'
                                    : 'btn-primary'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span className="animate-pulse">{t('builder.generatingButton')}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        {t('builder.generateButton')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Results Panel ── */}
                <div className="relative min-h-[500px]">
                    {/* Empty state */}
                    {!result && !isGenerating && (
                        <div className="h-full min-h-[500px] border border-white/5 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center p-12 text-center text-gray-500 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-grid opacity-[0.4] pointer-events-none" />
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/10">
                                <Sparkles className="w-8 h-8 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </div>
                            <p className="text-xl font-medium text-gray-300 mb-2">{t('builder.awaitingTitle')}</p>
                            <p className="text-sm max-w-xs mx-auto opacity-60">{t('builder.awaitingDesc')}</p>
                        </div>
                    )}

                    {/* Loading state */}
                    {isGenerating && (
                        <div className="h-full min-h-[500px] bg-black/40 rounded-2xl flex flex-col items-center justify-center p-12 text-center border border-primary/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                            <div className="relative z-10 w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <div className="absolute inset-4 bg-primary/20 rounded-full blur-md animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight relative z-10">IA Processando</h3>
                            <div className="text-sm text-primary/80 font-mono tracking-wider relative z-10 h-6">
                                {LOADING_STEPS[loadingStep]}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {result && !isGenerating && (
                        <div className="space-y-5">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
                                <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />
                                <span className="text-green-200 font-bold text-sm">{t('builder.resultSuccess')}</span>
                            </div>

                            {/* Products */}
                            {result.produtosIdeas?.length > 0 && (
                                <div className="glass-card">
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" /> {t('builder.sectionProducts')}
                                    </h3>
                                    <div className="space-y-3">
                                        {result.produtosIdeas.map((p, i) => (
                                            <div key={i} className="p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-primary/20 transition-all">
                                                <div className="flex justify-between items-start gap-3 mb-2">
                                                    <span className="font-black text-white text-sm">{p.nome}</span>
                                                    <div className="flex gap-2 shrink-0">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">{p.precoSugerido}</span>
                                                        <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 font-bold">{p.margemEstimada}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{p.descricao}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing Strategy */}
                            {result.estrategiaPreco && (
                                <div className="glass-card">
                                    <h3 className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" /> {t('builder.sectionPricing')}
                                    </h3>
                                    <p className="text-sm text-gray-300 leading-relaxed">{result.estrategiaPreco}</p>
                                </div>
                            )}

                            {/* Store Setup */}
                            {result.configuracaoLoja?.length > 0 && (
                                <div className="glass-card">
                                    <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Store className="w-4 h-4" /> {t('builder.sectionSetup')}
                                    </h3>
                                    <div className="space-y-2">
                                        {result.configuracaoLoja.map((step, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                                                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                                <span className="text-sm text-gray-300">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ad Ideas */}
                            {result.ideiasAnuncio?.length > 0 && (
                                <div className="glass-card">
                                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Megaphone className="w-4 h-4" /> {t('builder.sectionAds')}
                                    </h3>
                                    <div className="space-y-3">
                                        {result.ideiasAnuncio.map((ad, i) => (
                                            <div key={i} className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10">
                                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{ad.tipo}</span>
                                                <p className="text-sm text-gray-300 mt-1">{ad.conceito}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Launch Steps */}
                            {result.passosLancamento?.length > 0 && (
                                <div className="glass-card">
                                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Rocket className="w-4 h-4" /> {t('builder.sectionLaunch')}
                                    </h3>
                                    <div className="space-y-2">
                                        {result.passosLancamento.map((step, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <ChevronDown className="w-4 h-4 text-primary shrink-0 mt-0.5 -rotate-90" />
                                                <span className="text-sm text-gray-300">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Beta disclaimer */}
                            <p className="text-xs text-gray-600 text-center font-bold">{t('builder.betaDisclaimer')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
