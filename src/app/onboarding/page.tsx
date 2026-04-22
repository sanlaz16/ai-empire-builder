'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Rocket, ChevronRight, ChevronLeft, Store, Package,
    ShoppingCart, CheckCircle2, AlertTriangle, Loader2,
    Zap, Star, TrendingUp, ArrowRight, X
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MockProduct {
    id: string;
    title: string;
    emoji: string;
    cost: number;
    price: number;
    profit: number;
    margin: number;
    tag: string;
}

// ─── Mock product catalog (tied to niche) ─────────────────────────────────────
const NICHE_PRODUCTS: Record<string, MockProduct[]> = {
    pets: [
        { id: 'p1', title: 'Comedouro Automático Smart', emoji: '🐾', cost: 45, price: 149, profit: 104, margin: 70, tag: 'Best Seller' },
        { id: 'p2', title: 'Cama Ortopédica Premium', emoji: '🛏️', cost: 60, price: 189, profit: 129, margin: 68, tag: 'Alta Margem' },
        { id: 'p3', title: 'Brinquedo Interativo LED', emoji: '🎯', cost: 15, price: 69, profit: 54, margin: 78, tag: 'Viral TikTok' },
    ],
    fitness: [
        { id: 'p1', title: 'Elástico de Resistência Set', emoji: '💪', cost: 20, price: 89, profit: 69, margin: 78, tag: 'Best Seller' },
        { id: 'p2', title: 'Rolo de Recuperação Muscular', emoji: '🔄', cost: 25, price: 99, profit: 74, margin: 75, tag: 'Alta Margem' },
        { id: 'p3', title: 'Garrafa Térmica 1L', emoji: '💧', cost: 18, price: 79, profit: 61, margin: 77, tag: 'Viral TikTok' },
    ],
    tech: [
        { id: 'p1', title: 'Suporte Magnético Para Mesa', emoji: '🔌', cost: 12, price: 59, profit: 47, margin: 80, tag: 'Viral TikTok' },
        { id: 'p2', title: 'Fone Bluetooth ANC', emoji: '🎧', cost: 55, price: 199, profit: 144, margin: 72, tag: 'Best Seller' },
        { id: 'p3', title: 'Hub USB-C 7 em 1', emoji: '🖥️', cost: 40, price: 149, profit: 109, margin: 73, tag: 'Alta Margem' },
    ],
    fashion: [
        { id: 'p1', title: 'Cinto Couro Legítimo', emoji: '👔', cost: 22, price: 89, profit: 67, margin: 75, tag: 'Best Seller' },
        { id: 'p2', title: 'Óculos Retrô Polarizado', emoji: '🕶️', cost: 15, price: 79, profit: 64, margin: 81, tag: 'Viral TikTok' },
        { id: 'p3', title: 'Bag Minimalista Couro', emoji: '👜', cost: 35, price: 139, profit: 104, margin: 75, tag: 'Alta Margem' },
    ],
    beauty: [
        { id: 'p1', title: 'Sérum Vitamina C', emoji: '✨', cost: 18, price: 89, profit: 71, margin: 80, tag: 'Viral TikTok' },
        { id: 'p2', title: 'Escova Facial Massageadora', emoji: '💆', cost: 25, price: 99, profit: 74, margin: 75, tag: 'Best Seller' },
        { id: 'p3', title: 'Kit Skincare Noturno', emoji: '🌙', cost: 35, price: 149, profit: 114, margin: 77, tag: 'Alta Margem' },
    ],
    home: [
        { id: 'p1', title: 'Luminária LED Giratória', emoji: '💡', cost: 22, price: 99, profit: 77, margin: 78, tag: 'Viral TikTok' },
        { id: 'p2', title: 'Organizador Modular', emoji: '📦', cost: 18, price: 79, profit: 61, margin: 77, tag: 'Best Seller' },
        { id: 'p3', title: 'Vaso Hidropônico Smart', emoji: '🌿', cost: 30, price: 129, profit: 99, margin: 77, tag: 'Alta Margem' },
    ],
};

const DEFAULT_PRODUCTS = NICHE_PRODUCTS.tech;

const NICHES = [
    { id: 'pets', name: 'Pets', icon: '🐾' },
    { id: 'fitness', name: 'Fitness', icon: '🏋️' },
    { id: 'tech', name: 'Tecnologia', icon: '🎧' },
    { id: 'fashion', name: 'Moda', icon: '👗' },
    { id: 'beauty', name: 'Beleza', icon: '💄' },
    { id: 'home', name: 'Casa & Deco', icon: '🛋️' },
];

const TOTAL_STEPS = 6;

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
    return (
        <div className="w-full max-w-lg mx-auto mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                    Passo {step} de {TOTAL_STEPS}
                </span>
                <span className="text-[11px] font-black text-primary">
                    {Math.round((step / TOTAL_STEPS) * 100)}%
                </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                />
            </div>
            <div className="flex justify-between mt-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i < step ? 'bg-primary' : 'bg-white/10'}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Skip Modal ────────────────────────────────────────────────────────────────
function SkipWarning({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-sm mx-4 shadow-2xl">
                <div className="flex justify-end mb-2">
                    <button onClick={onCancel} className="text-gray-600 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-4xl mb-4 text-center">⚠️</div>
                <h3 className="text-lg font-black text-white text-center mb-2">Tem certeza?</h3>
                <p className="text-gray-500 text-sm text-center font-bold mb-6">
                    Você pode pular, mas recomendamos completar o onboarding para ativar seu império corretamente.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-black text-sm hover:bg-white/5 transition-all"
                    >
                        Continuar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 rounded-xl bg-white/5 text-gray-500 font-black text-sm hover:bg-white/10 transition-all"
                    >
                        Pular mesmo assim
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Product Card (Step 4 & 5) ─────────────────────────────────────────────────
function OnboardingProductCard({
    product,
    onAdd,
    added,
}: {
    product: MockProduct;
    onAdd: (id: string) => void;
    added: boolean;
}) {
    return (
        <div className={`glass-card p-5 transition-all duration-300 ${added ? 'border-primary/40' : 'hover:border-white/15'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{product.emoji}</span>
                    <div>
                        <h3 className="font-black text-white text-sm">{product.title}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${product.tag === 'Viral TikTok' ? 'bg-pink-500/20 text-pink-400' : product.tag === 'Best Seller' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary/20 text-primary'}`}>
                            {product.tag}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-white/5 rounded-xl p-2">
                    <div className="text-[10px] text-gray-500 font-black uppercase">Custo</div>
                    <div className="font-black text-white text-sm">R${product.cost}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                    <div className="text-[10px] text-gray-500 font-black uppercase">Preço</div>
                    <div className="font-black text-white text-sm">R${product.price}</div>
                </div>
                <div className="bg-primary/10 rounded-xl p-2 border border-primary/20">
                    <div className="text-[10px] text-primary font-black uppercase">Margem</div>
                    <div className="font-black text-primary text-sm">{product.margin}%</div>
                </div>
            </div>

            <button
                onClick={() => onAdd(product.id)}
                disabled={added}
                className={`w-full py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    added
                        ? 'bg-primary/10 border border-primary/30 text-primary cursor-default'
                        : 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
                {added ? <><CheckCircle2 className="w-4 h-4" /> Adicionado!</> : <><ShoppingCart className="w-4 h-4" /> Adicionar à Loja</>}
            </button>
        </div>
    );
}

// ─── Main Onboarding Component ─────────────────────────────────────────────────
export default function OnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [niche, setNiche] = useState('');
    const [customNiche, setCustomNiche] = useState('');
    const [storeName, setStoreName] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiDone, setAiDone] = useState(false);
    const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
    const [showSkipWarning, setShowSkipWarning] = useState(false);
    const [saving, setSaving] = useState(false);

    const selectedNiche = niche || 'tech';
    const products = NICHE_PRODUCTS[selectedNiche] ?? DEFAULT_PRODUCTS;
    const hasAddedOne = addedProducts.size > 0;

    // Load saved progress
    useEffect(() => {
        fetch('/api/onboarding/progress')
            .then(r => r.json())
            .then(data => {
                if (data.onboarding_completed) {
                    router.replace('/dashboard');
                    return;
                }
                if (data.onboarding_step) setStep(data.onboarding_step);
                if (data.selected_niche) setNiche(data.selected_niche);
                if (data.store_name) setStoreName(data.store_name);
            })
            .catch(() => { });
    }, [router]);

    const saveProgress = useCallback(async (updates: Record<string, unknown>) => {
        setSaving(true);
        try {
            await fetch('/api/onboarding/progress', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
        } finally {
            setSaving(false);
        }
    }, []);

    const goNext = async () => {
        const nextStep = step + 1;
        setStep(nextStep);
        await saveProgress({ step: nextStep, selected_niche: niche || 'tech', store_name: storeName });
    };

    const goPrev = () => setStep(s => Math.max(1, s - 1));

    const handleAddProduct = (id: string) => {
        setAddedProducts(prev => new Set(prev).add(id));
    };

    const handleSkip = async () => {
        await saveProgress({ onboarding_completed: true });
        router.push('/dashboard');
    };

    const handleComplete = async () => {
        setSaving(true);
        await saveProgress({ onboarding_completed: true, step: TOTAL_STEPS });
        router.push('/dashboard');
    };

    // Step 3 AI animation
    const runAiGeneration = useCallback(async () => {
        if (aiDone) return;
        setAiLoading(true);
        await new Promise(r => setTimeout(r, 3200));
        setAiLoading(false);
        setAiDone(true);
    }, [aiDone]);

    useEffect(() => {
        if (step === 3) runAiGeneration();
    }, [step, runAiGeneration]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center py-16 px-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            {showSkipWarning && (
                <SkipWarning onConfirm={handleSkip} onCancel={() => setShowSkipWarning(false)} />
            )}

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2">
                        <span className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs text-primary border border-primary/30 font-black">AI</span>
                        <span className="font-bold text-white">EmpireBuilder</span>
                    </div>
                </div>

                <ProgressBar step={step} />

                {/* Card wrapper */}
                <div className="bg-[#0a0a0a] border border-white/8 rounded-3xl p-8 shadow-2xl min-h-[460px] flex flex-col">

                    {/* ─── STEP 1: WELCOME ─── */}
                    {step === 1 && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-300">
                            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Rocket className="w-12 h-12 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white leading-tight mb-3">
                                    Bem-vindo ao<br />
                                    <span className="text-primary">EmpireBuilder AI</span>
                                </h1>
                                <p className="text-gray-400 font-bold text-base max-w-md mx-auto">
                                    Vamos criar sua primeira loja com inteligência artificial.<br />
                                    Leva menos de 3 minutos.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 text-sm">
                                {['Escolher seu nicho', 'Gerar sua loja com IA', 'Adicionar seu primeiro produto'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-gray-400 font-bold">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 2: NICHO ─── */}
                    {step === 2 && (
                        <div className="flex-grow flex flex-col gap-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Qual nicho você quer?</h2>
                                <p className="text-gray-500 font-bold text-sm">Escolha uma categoria ou escreva a sua.</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {NICHES.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => setNiche(n.id)}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${niche === n.id
                                            ? 'border-primary bg-primary/10 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]'
                                            : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="text-3xl">{n.icon}</span>
                                        <span className="text-xs font-black text-white uppercase tracking-wider">{n.name}</span>
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Ou escreva outro nicho:</label>
                                <input
                                    type="text"
                                    value={customNiche}
                                    onChange={(e) => { setCustomNiche(e.target.value); if (e.target.value) setNiche('custom'); }}
                                    placeholder="ex: Joias, Surf, Bebê..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:border-primary focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 3: AI GENERATION ─── */}
                    {step === 3 && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-300">
                            {aiLoading ? (
                                <>
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <Zap className="w-12 h-12 text-primary animate-pulse" />
                                        </div>
                                        <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2">Gerando sua loja com IA...</h2>
                                        <p className="text-gray-500 font-bold">Analisando tendências do nicho <span className="text-primary capitalize">{niche === 'custom' ? customNiche : NICHES.find(n => n.id === niche)?.name || niche}</span>...</p>
                                    </div>
                                    <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-primary rounded-full animate-[progress_3.2s_ease-in-out_forwards]" style={{ animation: 'none', width: '85%', transition: 'width 3.2s ease-in-out' }} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                                        <CheckCircle2 className="w-12 h-12 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white mb-2">🎉 Loja criada com sucesso!</h2>
                                        <p className="text-gray-400 font-bold">Sua loja de <span className="text-primary capitalize">{niche === 'custom' ? customNiche : NICHES.find(n => n.id === niche)?.name || niche}</span> foi configurada com IA.</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                                        {[['12', 'Produtos'], ['3', 'Suppliers'], ['67%', 'Margem Média']].map(([val, label]) => (
                                            <div key={label} className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
                                                <div className="text-xl font-black text-white">{val}</div>
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 4: PRODUTOS ─── */}
                    {step === 4 && (
                        <div className="flex-grow flex flex-col gap-5 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Produtos recomendados 🔥</h2>
                                <p className="text-gray-500 font-bold text-sm">Esses produtos foram selecionados pela IA com base no seu nicho. Veja as margens de lucro!</p>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {products.map((p) => (
                                    <OnboardingProductCard key={p.id} product={p} onAdd={handleAddProduct} added={addedProducts.has(p.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 5: FIRST ACTION (must add product) ─── */}
                    {step === 5 && (
                        <div className="flex-grow flex flex-col gap-5 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Sua primeira ação 🚀</h2>
                                <p className="text-gray-500 font-bold text-sm">
                                    Adicione <strong className="text-white">pelo menos 1 produto</strong> para continuar. Isso leva 1 clique!
                                </p>
                            </div>

                            {!hasAddedOne && (
                                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                                    <p className="text-yellow-400 font-bold text-sm">Adicione um produto para desbloquear o próximo passo.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {products.map((p) => (
                                    <OnboardingProductCard key={p.id} product={p} onAdd={handleAddProduct} added={addedProducts.has(p.id)} />
                                ))}
                            </div>

                            {hasAddedOne && (
                                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl animate-in fade-in duration-300">
                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                                    <p className="text-primary font-bold text-sm">Perfeito! Você adicionou seu primeiro produto. Agora avance!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 6: FINAL ─── */}
                    {step === 6 && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-300">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)]">
                                    <span className="text-5xl">🏆</span>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white mb-3">
                                    Você já tem sua loja<br /><span className="text-primary">pronta para vender!</span>
                                </h2>
                                <p className="text-gray-400 font-bold max-w-md mx-auto">
                                    Parabéns! Sua loja está configurada, seus primeiros produtos estão adicionados. Agora é hora de vender!
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                                {[
                                    { icon: '🛍️', label: 'Loja Criada' },
                                    { icon: '📦', label: 'Produto Adicionado' },
                                    { icon: '🚀', label: 'Pronto para Vender' },
                                ].map(({ icon, label }) => (
                                    <div key={label} className="bg-primary/10 border border-primary/20 rounded-2xl p-3 text-center">
                                        <div className="text-2xl mb-1">{icon}</div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-wider">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Navigation ─── */}
                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            {step > 1 && (
                                <button
                                    onClick={goPrev}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all font-bold text-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Voltar
                                </button>
                            )}
                            <button
                                onClick={() => setShowSkipWarning(true)}
                                className="text-xs text-gray-600 hover:text-gray-400 transition-colors font-bold"
                            >
                                Pular onboarding
                            </button>
                        </div>

                        <div>
                            {step === 6 ? (
                                <button
                                    onClick={handleComplete}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                                    Ir para Dashboard
                                </button>
                            ) : (
                                <button
                                    onClick={goNext}
                                    disabled={(step === 2 && !niche && !customNiche) || (step === 5 && !hasAddedOne) || (step === 3 && aiLoading) || saving}
                                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {step === 1 ? 'Começar' : step === 3 && aiLoading ? 'Aguarde...' : 'Próximo'}
                                    {!saving && <ChevronRight className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Step indicator dots */}
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => i + 1 < step && setStep(i + 1)}
                            className={`rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 h-2 bg-primary' : i + 1 < step ? 'w-2 h-2 bg-primary/50 hover:bg-primary/70 cursor-pointer' : 'w-2 h-2 bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
