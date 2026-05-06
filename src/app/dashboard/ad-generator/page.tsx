'use client';

import { useState } from 'react';
import { Megaphone, Sparkles, Zap, ChevronRight, Film, Hash, Target, FileText, Mic, Camera } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSubscription } from '@/context/SubscriptionContext';
import Link from 'next/link';

interface Ad {
    gancho: string;
    roteiro: string;
    conceito: string;
    listaDeCenas: string[];
    legenda: string;
    hashtags: string[];
    tipoAngulo: string;
}

const ANGLE_COLORS: Record<string, string> = {
    'Problema/Solução': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Prova Social': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'FOMO': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Lifestyle': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Educativo': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Transformação': 'bg-primary/10 text-primary border-primary/20',
};

export default function AdGeneratorPage() {
    const { t } = useTranslation();
    const { plan } = useSubscription();
    const isPro = plan === 'pro' || plan === 'elite';
    const adLimit = isPro ? 10 : 3;

    const [productDescription, setProductDescription] = useState('');
    const [ads, setAds] = useState<Ad[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setError('');
        if (!productDescription.trim() || productDescription.trim().length < 10) {
            setError(t('adGenerator.errorEmpty'));
            return;
        }
        setIsGenerating(true);
        setAds([]);

        try {
            const res = await fetch('/api/ai/generate-ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productDescription: productDescription.trim() }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json.error || t('adGenerator.errorApi'));
                return;
            }
            setAds(json.ads ?? []);
        } catch {
            setError(t('adGenerator.errorApi'));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3 text-white">
                        <span className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10">
                            <Megaphone className="w-6 h-6" />
                        </span>
                        <span>{t('adGenerator.title')}</span>
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest animate-pulse">
                        {t('adGenerator.betaBadge')}
                    </span>
                </div>
                <p className="text-gray-400 max-w-2xl leading-relaxed">{t('adGenerator.subtitle')}</p>
            </div>

            {/* Plan badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border ${isPro
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-white/5 border-white/10 text-gray-400'
                }`}>
                <Zap className="w-3.5 h-3.5" />
                {isPro ? t('adGenerator.planPro') : t('adGenerator.planFree')}
            </div>

            {/* Input card */}
            <div className="glass-card mb-8">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm font-bold flex items-center gap-2 mb-5">
                        ⚠️ {error}
                    </div>
                )}

                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">
                    {t('adGenerator.productLabel')}
                </label>
                <textarea
                    className="w-full h-40 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none text-sm leading-relaxed placeholder:text-gray-600 mb-5"
                    placeholder={t('adGenerator.productPlaceholder')}
                    value={productDescription}
                    maxLength={2000}
                    onChange={(e) => setProductDescription(e.target.value)}
                />

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !productDescription.trim()}
                        className={`flex-grow py-4 text-base font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${isGenerating ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-wait' : 'btn-primary'}`}
                    >
                        {isGenerating ? (
                            <>
                                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                {t('adGenerator.generatingButton')}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                {t('adGenerator.generateButton')}
                            </>
                        )}
                    </button>

                    {!isPro && (
                        <Link
                            href="/dashboard/pricing"
                            className="shrink-0 flex items-center gap-2 px-4 py-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-widest hover:bg-yellow-500/20 transition-all"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            {t('adGenerator.upgradeButton')}
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>

                {!isPro && (
                    <p className="text-xs text-gray-600 font-bold mt-3 text-center">
                        {t('adGenerator.upgradePrompt')}
                    </p>
                )}
            </div>

            {/* Empty state */}
            {ads.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600 border border-white/5 rounded-2xl bg-white/[0.02]">
                    <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-bold text-gray-500">{t('adGenerator.awaitingTitle')}</p>
                    <p className="text-sm mt-1 opacity-60">{t('adGenerator.awaitingDesc')}</p>
                </div>
            )}

            {/* Loading */}
            {isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-primary/20 rounded-2xl bg-primary/5 animate-pulse">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                    <p className="font-black text-white">Gerando {adLimit} anúncios com IA...</p>
                    <p className="text-sm text-primary/60 mt-2">Isso pode levar alguns segundos</p>
                </div>
            )}

            {/* Ad Results */}
            {ads.length > 0 && !isGenerating && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-black text-white">{ads.length} Anúncios Gerados</h2>
                        <div className="h-px flex-grow bg-white/5" />
                    </div>

                    {ads.map((ad, i) => (
                        <div key={i} className="glass-card border-purple-500/10 space-y-4">
                            {/* Ad header */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                                    {t('adGenerator.adNumber')} {i + 1}
                                </span>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-wider ${ANGLE_COLORS[ad.tipoAngulo] ?? 'bg-white/5 text-gray-400 border-white/10'}`}>
                                    <Target className="w-3 h-3 inline mr-1" />
                                    {ad.tipoAngulo}
                                </span>
                            </div>

                            {/* Hook */}
                            <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Mic className="w-3.5 h-3.5 text-yellow-400" />
                                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">{t('adGenerator.hook')}</span>
                                </div>
                                <p className="text-white font-bold text-sm leading-relaxed">{ad.gancho}</p>
                            </div>

                            {/* Concept */}
                            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{t('adGenerator.concept')}</span>
                                </div>
                                <p className="text-gray-300 text-sm">{ad.conceito}</p>
                            </div>

                            {/* Script */}
                            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('adGenerator.script')}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{ad.roteiro}</p>
                            </div>

                            {/* Shot list */}
                            {ad.listaDeCenas?.length > 0 && (
                                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Camera className="w-3.5 h-3.5 text-green-400" />
                                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{t('adGenerator.shotList')}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {ad.listaDeCenas.map((scene, j) => (
                                            <div key={j} className="flex items-start gap-2">
                                                <span className="w-5 h-5 rounded bg-green-500/10 text-green-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                                                <span className="text-sm text-gray-400">{scene}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Caption */}
                            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <Film className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('adGenerator.caption')}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{ad.legenda}</p>
                            </div>

                            {/* Hashtags */}
                            {ad.hashtags?.length > 0 && (
                                <div className="flex items-start gap-2 flex-wrap">
                                    <Hash className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
                                    {ad.hashtags.map((tag, j) => (
                                        <span key={j} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <p className="text-xs text-gray-600 text-center font-bold">{t('adGenerator.betaDisclaimer')}</p>
                </div>
            )}
        </div>
    );
}
