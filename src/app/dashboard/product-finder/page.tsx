'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, Package, TrendingUp, DollarSign, BarChart3, ArrowRight, Zap,
    Filter, CheckCircle2, ShoppingBag, X, Globe, AlertTriangle,
    Video, ImageIcon, Flame, Rocket, RefreshCw, Sparkles,
    ExternalLink, Info, Award, LayoutGrid, ListFilter,
    Check, ChevronRight, HelpCircle, Store, Layers, Wand2, Share2, UploadCloud,
    Target, Mic, Hash
} from 'lucide-react';
import Link from 'next/link';
import { useIntegration } from '@/context/IntegrationContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/lib/subscription/useSubscription';
import { useUpgrade } from '@/lib/subscription/useUpgrade';
import { calculateMargins } from '@/lib/utils/margins';
import OnboardingFlow from '@/components/OnboardingFlow';
import SupplierWizardModal from '@/components/SupplierWizardModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { UpgradeModal } from '@/components/UpgradeModal';
import { useSubscription as useSubscriptionContext } from '@/context/SubscriptionContext';

// --- MODELS ---
// ... (rest of models)
interface Product {
    id: string | number;
    title: string;
    imageUrl?: string;
    price: string;
    priceMax?: string;
    compareAtPrice?: string | null;
    vendor: string;
    productType: string;
    tags: string;
    estimatedCost: string | null;
    profit: string | null;
    margin: string | null;
    status?: string;
    detectedSupplier?: 'DSers' | 'CJ' | 'Temu' | 'Shopify';
    supplierConfidence?: string;
    isAiOptimized?: boolean;
    supplier_price?: number;
    shipping_cost?: number;
    supplier_stock?: number;
    supplier_rating?: number;
    supplier_orders?: number;
    supplier_url?: string;
    aiScore?: {
        overall_score: number;
        trend_score: number;
        virality_score: number;
        margin_score: number;
        competition_score: number;
        niche: string;
        angle: string;
    } | null;
}

interface SupplierProduct {
    id: string;
    title: string;
    image: string;
    cost: number;
    price_suggestion: number;
    supplier: 'DSers' | 'CJ' | 'Temu';
    shipping_time?: string;
    url?: string;
    niche?: string;
}

const SupplierProductCard = ({ product, onImport, isImporting, plan }: {
    product: SupplierProduct,
    onImport: (product: SupplierProduct) => void,
    isImporting: boolean,
    plan: string
}) => {
    const { openUpgrade } = useUpgrade();
    const isFree = plan === 'free';
    const profit = product.price_suggestion - product.cost;
    const margin = (profit / product.price_suggestion) * 100;

    return (
        <div className="glass-card p-5 group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)] hover:border-primary/30">
            <div className="relative mb-4 overflow-hidden rounded-xl">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                    <div className="bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg border border-white/10">
                        <Package className="w-3 h-3 text-primary" /> {product.supplier}
                    </div>
                </div>

                <div className="absolute bottom-2 right-2">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-black text-primary border border-primary/20">
                        Suggest: ${product.price_suggestion}
                    </div>
                </div>
            </div>

            <h3 className="text-sm font-bold text-white mb-3 line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-primary transition-colors">
                {product.title}
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] uppercase font-black text-gray-500 mb-1">Cost</div>
                    <div className="text-sm font-black text-white">${product.cost}</div>
                </div>
                <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="text-[10px] uppercase font-black text-primary mb-1">Margin</div>
                    <div className="text-sm font-black text-primary">{margin.toFixed(0)}%</div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={() => isFree ? openUpgrade() : onImport(product)}
                    disabled={isImporting}
                    className={`w-full py-3 rounded-xl ${isFree ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40' : 'bg-primary text-black hover:scale-[1.02] active:scale-[0.98]'} font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50`}
                >
                    {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {isFree ? '🔒 Upgrade to Import' : 'Import to Shopify'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                        <Wand2 className="w-3 h-3" /> AI Opt
                    </button>
                    <button className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-1 opacity-50 cursor-not-allowed">
                        <Video className="w-3 h-3" /> TikTok
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const ProductCard = ({ product, onPushToStore, onOpenMarketing, plan }: {
    product: Product,
    onPushToStore: (id: string | number) => void,
    onOpenMarketing: (product: Product) => void,
    plan: string
}) => {
    const [isPushing, setIsPushing] = useState(false);
    const [pushDone, setPushDone] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isExportingTikTok, setIsExportingTikTok] = useState(false);
    const { can } = useSubscription();
    const { openUpgrade } = useUpgrade();
    const isFree = plan === 'free';

    const canPush = can('import_shopify');
    const canOptimize = can('optimize_ai');
    const canTikTok = can('tiktok_export');

    const supplier = product.detectedSupplier || (
        product.vendor?.toLowerCase().includes('aliexpress') || product.vendor?.toLowerCase().includes('dsers') ? 'DSers' :
            product.vendor?.toLowerCase().includes('cj') ? 'CJ' :
                product.vendor?.toLowerCase().includes('temu') ? 'Temu' : 'Shopify'
    );

    // NUCLEAR 22: Precision Margin Calculation
    const sPrice = product.supplier_price ? parseFloat(product.supplier_price.toString()) : parseFloat(product.estimatedCost || '0');
    const ship = product.shipping_cost ? parseFloat(product.shipping_cost.toString()) : 0;
    const sellPrice = parseFloat(product.price);

    const profit = sellPrice - sPrice - ship;
    const margin = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;

    const handlePush = async () => {
        if (!canPush) {
            openUpgrade();
            return;
        }

        setIsPushing(true);
        await onPushToStore(product.id);
        setIsPushing(false);
        setPushDone(true);
        setTimeout(() => setPushDone(false), 3000);
    };

    const handleOptimize = async () => {
        if (!canOptimize) {
            openUpgrade();
            return;
        }

        setIsOptimizing(true);
        try {
            const res = await fetch(`/api/shopify/optimize-listing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: { id: product.id, title: product.title, vendor: product.vendor } })
            });
            const data = await res.json();
            if (data.success) {
                alert('Product optimized! Syncing...');
                onPushToStore(product.id); // Re-sync to show changes
            } else if (data.error && data.error.includes("Quota Exceeded")) {
                alert(data.error);
            }
        } catch (e) {
            console.error('Optimization failed', e);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleTikTokExport = async () => {
        if (!canTikTok) {
            openUpgrade();
            return;
        }

        setIsExportingTikTok(true);
        try {
            const res = await fetch(`/api/tiktok/export?productId=${product.id}`);
            const data = await res.json();
            if (data.success) {
                alert('TikTok export ready! Check console.');
            } else if (data.error && data.error.includes("Quota Exceeded")) {
                alert(data.error);
            }
        } catch (e) {
            console.error('TikTok export failed', e);
        } finally {
            setIsExportingTikTok(false);
        }
    };

    const checkMarketingAccess = () => {
        if (!canOptimize) {
            openUpgrade();
            return;
        }
        onOpenMarketing(product);
    };

    return (
        <div className="glass-card p-5 group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(34,197,94,0.15)] hover:border-primary/30">
            <div className="relative mb-4 overflow-hidden rounded-xl">
                <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
                    {/* AI BADGES */}
                    {product.aiScore && product.aiScore.overall_score >= 80 && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg animate-pulse">
                            <Flame className="w-3 h-3 text-white" /> WINNING
                        </div>
                    )}
                    {product.supplier_orders && product.supplier_orders > 1000 && (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg">
                            <TrendingUp className="w-3 h-3 text-white" /> TOP SELLER
                        </div>
                    )}

                    <div className="bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg border border-white/10">
                        <Store className="w-3 h-3 text-primary" /> {supplier}
                    </div>

                    {product.status === 'draft' && (
                        <div className="bg-yellow-500/80 text-black px-2 py-1 rounded-lg text-[10px] font-black shadow-lg">
                            DRAFT
                        </div>
                    )}
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10">
                        {product.vendor}
                    </div>
                    {product.supplier_rating && (
                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                            ★ {product.supplier_rating}
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-sm font-bold text-white mb-3 line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-primary transition-colors">
                {product.title}
            </h3>

            {/* SUPPLIER INTEL */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Cost + Fees</div>
                    <div className="text-sm font-black text-gray-400">
                        ${sPrice.toFixed(2)} <span className="text-[9px] opacity-50 text-orange-400">+ Fees</span>
                    </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider text-right">Selling For</div>
                    <div className="text-sm font-black text-white text-right">${sellPrice.toFixed(2)}</div>
                </div>
                <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                    <div className="text-[9px] text-green-500/50 font-bold uppercase tracking-wider">Net Profit</div>
                    <div className="text-sm font-black text-green-400">${profit.toFixed(2)}</div>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="text-[9px] text-blue-500/50 font-bold uppercase tracking-wider text-right">Margin</div>
                    <div className="text-sm font-black text-blue-400 text-right">{margin.toFixed(1)}%</div>
                </div>
            </div>

            {/* LIVE SYNC STATS */}
            {product.supplier_orders && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 mb-4 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <ShoppingBag className="w-3 h-3 text-orange-400" />
                        <span>{product.supplier_orders.toLocaleString()}+ Orders</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Layers className="w-3 h-3 text-blue-400" />
                        <span>{product.supplier_stock?.toLocaleString() || 'In Stock'} Left</span>
                    </div>
                </div>
            )}

            {/* ACTIONS */}
            <div className="grid grid-cols-1 gap-2 mt-4">
                <div className="grid grid-cols-3 gap-2 mb-1">
                    <button
                        onClick={checkMarketingAccess}
                        className="py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold text-[10px] uppercase tracking-widest hover:bg-orange-500/20 transition-all flex flex-col items-center justify-center gap-1"
                        title="Viral Hooks"
                    >
                        <Hash className="w-3 h-3" />
                        Hooks
                    </button>
                    <button
                        onClick={checkMarketingAccess}
                        className="py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all flex flex-col items-center justify-center gap-1"
                        title="Generate Ads"
                    >
                        <Target className="w-3 h-3" />
                        Ads
                    </button>
                    <button
                        onClick={checkMarketingAccess}
                        className={`py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 ${!canOptimize ? 'bg-gray-800/10 border-gray-800/20 text-gray-500 cursor-not-allowed opacity-40' : 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20'}`}
                        title="TikTok Script"
                    >
                        <Mic className="w-3 h-3" />
                        {!canOptimize ? 'Upgrade' : 'Script'}
                    </button>
                </div>
                <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className={`py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!canOptimize ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-40' : 'bg-primary text-black hover:scale-[1.02]'}`}
                >
                    {isOptimizing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    {!canOptimize ? '🔒 Upgrade to Optimize' : (isOptimizing ? 'Optimizing...' : 'AI Optimize')}
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleTikTokExport}
                        disabled={isExportingTikTok}
                        className={`py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!canTikTok ? 'bg-gray-800/10 border-gray-800/20 text-gray-500 cursor-not-allowed opacity-40' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                    >
                        {isExportingTikTok ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                        {!canTikTok ? 'Upgrade' : (isExportingTikTok ? 'Exporting...' : 'TikTok')}
                    </button>

                    {(product.status === 'draft' || !product.status) ? (
                        <button
                            onClick={handlePush}
                            disabled={isPushing || pushDone}
                            className={`py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${pushDone
                                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                : 'bg-white/5 border border-white/10 text-white hover:bg-primary/20 hover:border-primary/40 hover:text-primary'
                                }`}
                        >
                            {isPushing
                                ? <><RefreshCw className="w-3 h-3 animate-spin" /> Pushing...</>
                                : pushDone
                                    ? <><Check className="w-3 h-3" /> Done!</>
                                    : <><UploadCloud className="w-3 h-3" /> Push</>
                            }
                        </button>
                    ) : (
                        <div className="py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> Live
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- CONVERSION AI MODAL ---
const MarketingModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'hook' | 'ad_copy' | 'ugc_script'>('hook');
    const [isGenerating, setIsGenerating] = useState(false);
    const [creativeData, setCreativeData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    const generate = async (type: string) => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/generate-creative', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    type,
                    productData: {
                        title: product.title,
                        description: product.aiScore?.angle || '',
                        niche: product.aiScore?.niche || '',
                        angle: product.aiScore?.angle || ''
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                setCreativeData(data.data.content);
            }
        } catch (e) {
            console.error('Generation failed', e);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        setCreativeData(null);
    }, [activeTab]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
            <div className="glass-card max-w-2xl w-full p-8 relative border-primary/20 overflow-hidden min-h-[500px] flex flex-col">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full"></div>

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <img src={product.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate max-w-sm">{product.title}</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Conversion AI Intelligence</p>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl">
                    {[
                        { id: 'hook', label: 'Viral Hooks', icon: Hash },
                        { id: 'ad_copy', label: 'Ad Copy', icon: Target },
                        { id: 'ugc_script', label: 'UGC Script', icon: Mic }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-black' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
                    {!creativeData && !isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                            <Sparkles className="w-12 h-12 text-primary/20" />
                            <p className="text-gray-500 font-bold text-sm">Generate winning marketing content for this product.</p>
                            <button
                                onClick={() => generate(activeTab)}
                                className="px-10 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:scale-105 transition-all text-xs"
                            >
                                Generate Now
                            </button>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-10">
                            <RefreshCw className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-primary font-black text-xs uppercase tracking-widest animate-pulse">AI is writing your creatives...</p>
                        </div>
                    )}

                    {creativeData && activeTab === 'hook' && (
                        <div className="space-y-4">
                            {creativeData.map((hook: string, i: number) => (
                                <div key={i} className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all">
                                    <p className="text-gray-300 font-bold text-sm leading-relaxed pr-10">{hook}</p>
                                    <button
                                        onClick={() => copyToClipboard(hook)}
                                        className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20 text-gray-500 hover:text-primary"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {creativeData && activeTab === 'ad_copy' && (
                        <div className="space-y-6">
                            {[
                                { label: 'Primary Text', value: creativeData.primary_text },
                                { label: 'Headline', value: creativeData.headline },
                                { label: 'Description', value: creativeData.description }
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{field.label}</label>
                                    <div className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                        <p className="text-gray-300 font-bold text-sm leading-relaxed whitespace-pre-wrap">{field.value}</p>
                                        <button
                                            onClick={() => copyToClipboard(field.value)}
                                            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20 text-gray-500 hover:text-primary"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {creativeData && activeTab === 'ugc_script' && (
                        <div className="space-y-6">
                            {[
                                { label: 'The Hook (0-3s)', value: creativeData.hook },
                                { label: 'The Body', value: creativeData.body },
                                { label: 'Call to Action', value: creativeData.cta }
                            ].map((field, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{field.label}</label>
                                    <div className="group relative p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                        <p className="text-gray-300 font-bold text-sm leading-relaxed">{field.value}</p>
                                        <button
                                            onClick={() => copyToClipboard(field.value)}
                                            className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20 text-gray-500 hover:text-primary"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {creativeData.notes && (
                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-blue-400 font-bold italic">
                                    💡 Pro Tip: {creativeData.notes}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {copied && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-bounce">
                        Copied to clipboard!
                    </div>
                )}
            </div>
        </div>
    );
};

// --- GUIDED MODAL (TEMU) ---
const TemuModal = ({ onClose, onRescan }: { onClose: () => void, onRescan: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
        <div className="glass-card max-w-lg w-full p-10 relative border-primary/20 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full"></div>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" /> Temu via DSers Guide
            </h3>
            <div className="space-y-6 mb-10">
                {[
                    "Open the DSers app in your Shopify Admin.",
                    "Go to AliExpress, find a product OR copy a Temu product URL.",
                    "Paste the URL into the DSers Import List.",
                    "Push the product to your Shopify store.",
                    "Return here and click 'I Imported Products'."
                ].map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                        <span className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black shrink-0"> {idx + 1} </span>
                        <p className="text-gray-400 font-bold group-hover:text-white transition-colors pt-1"> {step} </p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-4">
                <a href="https://admin.shopify.com/apps/dsers" target="_blank" className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-center hover:bg-primary transition-all">Open DSers</a>
                <button onClick={() => { onRescan(); onClose(); }} className="w-full py-4 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest hover:bg-primary/20 transition-all">I Imported Products</button>
            </div>
        </div>
    </div>
);

// --- MAIN COMPONENT ---
const PAGE_SIZE = 20;

export default function ProductFinder() {
    const [selectedMarketingProduct, setSelectedMarketingProduct] = useState<Product | null>(null);
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isRescanning, setIsRescanning] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [toast, setToast] = useState('');
    const [wizardSupplier, setWizardSupplier] = useState<'DSers' | 'CJ' | 'Temu' | null>(null);
    const [showTemuModal, setShowTemuModal] = useState(false);

    // AI Check
    const [viewMode, setViewMode] = useState<'store' | 'suppliers'>('store');
    const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
    const [activeSupplier, setActiveSupplier] = useState<string>('All');
    const [activeNiche, setActiveNiche] = useState<string>('All');
    const [isImporting, setIsImporting] = useState<string | null>(null);

    // AI Check & UI States
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [isFirstImport, setIsFirstImport] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    const { shopifyConnected } = useIntegration();
    const { plan, isPro, loading: subLoading } = useSubscription();
    const { openUpgrade } = useUpgrade();
    const { isUpgradeModalOpen, showUpgradeModal } = useSubscriptionContext();

    // Initial load
    useEffect(() => {
        if (shopifyConnected && viewMode === 'store') {
            loadProducts(1, true);
        } else if (viewMode === 'suppliers') {
            loadSupplierProducts();
        }
    }, [shopifyConnected, viewMode, activeSupplier, activeNiche]);

    const loadSupplierProducts = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch(`/api/suppliers/products?query=${encodeURIComponent(query)}&niche=${activeNiche}&supplier=${activeSupplier}`);
            const data = await res.json();
            if (data.products) {
                setSupplierProducts(data.products);
            }
        } catch (e) {
            console.error('Load supplier products failed', e);
        } finally {
            setIsSyncing(false);
        }
    };

    const loadProducts = async (p: number, reset = false) => {
        if (p === 1) setIsSyncing(true);
        else setIsLoadingMore(true);

        try {
            const res = await fetch(`/api/shopify/products?page=${p}&limit=${PAGE_SIZE}&query=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setProducts(prev => reset ? data : [...prev, ...data]);
                setHasMore(data.length === PAGE_SIZE);
                setPage(p);
            }
        } catch (e) {
            console.error('Load products failed', e);
        } finally {
            setIsSyncing(false);
            setIsLoadingMore(false);
        }
    };

    // Infinite scroll via IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isSyncing) {
                    loadProducts(page + 1);
                }
            },
            { threshold: 0.1 }
        );
        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, isLoadingMore, isSyncing, page, query]);

    const handleRescan = async (silent = false) => {
        if (!silent) setIsRescanning(true);
        else setIsSyncing(true);

        const wasEmpty = products.length === 0;

        try {
            const res = await fetch('/api/shopify/rescan-products', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                // NUCLEAR 22: Trigger supplier syncs
                const suppliers = ['DSers', 'CJ', 'Temu'];
                for (const supplier of suppliers) {
                    try {
                        await fetch('/api/suppliers/sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ supplier })
                        });
                    } catch (e) {
                        console.error(`Sync failed for ${supplier}`, e);
                    }
                }

                // Reload products from DB
                await loadProducts(1, true);
                if (!silent && data.count > 0) {
                    setToast(`${data.count} products synced 🚀`);
                    if (wasEmpty && data.count > 0) {
                        setIsFirstImport(true);
                        setTimeout(() => setIsFirstImport(false), 6000);
                    }
                }
            }
        } catch (e) {
            if (!silent) setToast('Rescan failed. Connection error.');
        } finally {
            setIsRescanning(false);
            setIsSyncing(false);
            if (!silent) setTimeout(() => setToast(''), 4000);
        }
    };

    const handleSearch = async (s: string) => {
        setQuery(s);
        if (viewMode === 'store') {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/shopify/products?page=1&limit=${PAGE_SIZE}&query=${encodeURIComponent(s)}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProducts(data);
                    setPage(1);
                    setHasMore(data.length === PAGE_SIZE);
                }
            } catch (e) {
                console.error('Search failed', e);
            } finally {
                setIsSearching(false);
            }
        } else {
            // Supplier search is triggered by query state change + loadSupplierProducts
            // We can call it here explicitly for immediate feedback
            loadSupplierProducts();
        }
    };

    const handleImportToShopify = async (supplierProduct: SupplierProduct) => {
        if (plan === 'free') {
            openUpgrade();
            return;
        }
        if (!shopifyConnected) {
            setToast("⚠️ Connect your Shopify store first!");
            setTimeout(() => setToast(''), 4000);
            return;
        }
        setIsImporting(supplierProduct.id);
        try {
            const res = await fetch('/api/suppliers/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    supplierSource: supplierProduct.supplier.toUpperCase(),
                    supplierProduct: {
                        id: supplierProduct.id,
                        title: supplierProduct.title,
                        imageUrl: supplierProduct.image,
                        cost: supplierProduct.cost,
                        suggestedPrice: supplierProduct.price_suggestion,
                        vendor: supplierProduct.supplier,
                        niche: supplierProduct.niche
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                if (data.alreadyImported) {
                    setToast(`ℹ️ ${data.message}`);
                } else {
                    setToast(`Imported! Syncing store... 🚀`);
                    setIsFirstImport(true);
                    setTimeout(() => setIsFirstImport(false), 6000);
                }
                setTimeout(() => setToast(''), 4000);
                handleRescan(true); // silent rescan
            } else {
                alert(data.error || "Failed to import product.");
            }
        } catch (e) {
            console.error("Import failed", e);
        } finally {
            setIsImporting(null);
        }
    };

    const handlePushToStore = async (productId: string | number) => {
        if (plan === 'free') {
            openUpgrade();
            return;
        }
        try {
            const res = await fetch('/api/shopify/push-to-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopifyProductId: productId })
            });
            const data = await res.json();
            if (data.success) {
                setToast('Product published! 🚀');
                setTimeout(() => setToast(''), 3000);
                // Update product status locally
                setProducts(prev => prev.map(p =>
                    p.id === productId ? { ...p, status: 'active' } : p
                ));
            }
        } catch (e) {
            console.error('Push to store failed', e);
        }
    };

    // UX STATE MACHINE
    // A - No Shopify
    if (!shopifyConnected) {
        return (
            <div className="p-8 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
                <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-10">
                    <AlertTriangle className="w-12 h-12 text-yellow-500" />
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Connect Shopify First</h1>
                <p className="text-xl text-gray-500 font-bold max-w-lg mb-12">Empire requires a Shopify connection to scan imports and calculate winner margins.</p>
                <Link href="/dashboard/integrations" className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-2xl">Go to Integrations</Link>
            </div>
        );
    }

    // B - Shopify Connected but absolutely nothing imported (First time user)
    // We only show this if they are on 'store' view and have no products.
    const isActuallyEmpty = products.length === 0 && !isSyncing && viewMode === 'store' && query === '';

    if (isActuallyEmpty) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                {toast && (
                    <div className="fixed top-24 right-8 z-[100] animate-fade-in-up bg-black/90 text-white px-6 py-4 rounded-xl border border-primary shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center gap-3">
                        <CheckCircle2 className="text-green-400 w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-widest">{toast}</span>
                    </div>
                )}
                {showTemuModal && <TemuModal onClose={() => setShowTemuModal(false)} onRescan={() => handleRescan()} />}

                {/* Unified Supplier Wizard */}
                <SupplierWizardModal
                    isOpen={!!wizardSupplier}
                    onClose={() => setWizardSupplier(null)}
                    supplierName={wizardSupplier || 'DSers'}
                    onRescan={handleRescan}
                />

                {/* Onboarding in empty state */}
                {showOnboarding && (
                    <OnboardingFlow
                        shopifyConnected={shopifyConnected}
                        productsCount={products.length}
                        onRescan={() => handleRescan()}
                        isRescanning={isRescanning}
                        onDismiss={() => setShowOnboarding(false)}
                    />
                )}

                <div className="mb-20">
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">Supplier Import Mode</h1>
                    <p className="text-xl text-gray-500 font-bold">Your store is empty. Import products from suppliers to begin.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="glass-card p-10 border-white/10 hover:border-primary/40 transition-all group">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <Rocket className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">DSers</h3>
                        <p className="text-gray-500 font-bold mb-10">Import AliExpress products with 1-click sync.</p>
                        <button onClick={() => setWizardSupplier('DSers')} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl">Connect DSers</button>
                    </div>

                    <div className="glass-card p-10 border-white/10 hover:border-primary/40 transition-all group shrink-0 w-80 md:w-auto">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">CJ Dropshipping</h3>
                        <p className="text-gray-500 font-bold mb-10">Exclusive fast-shipping items and global sourcing.</p>
                        <button onClick={() => setWizardSupplier('CJ')} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl">Connect CJ</button>
                    </div>

                    <div className="glass-card p-10 border-white/10 hover:border-primary/40 transition-all group shrink-0 w-80 md:w-auto">
                        <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Temu via DSers</h3>
                        <p className="text-gray-500 font-bold mb-10">Manual link import via DSers AliExpress list.</p>
                        <button onClick={() => setWizardSupplier('Temu')} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl">Import from Temu</button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 p-12 glass-card border-primary/20 bg-primary/5 rounded-[3rem]">
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Finished Sourcing?</h2>
                    <button
                        onClick={() => handleRescan()}
                        disabled={isRescanning}
                        className="px-16 py-6 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(34,197,94,0.3)] flex items-center gap-4 text-xl"
                    >
                        {isRescanning ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Layers className="w-6 h-6" />}
                        I Imported Products
                    </button>
                </div>
            </div>
        );
    }

    // C - Shopify Connected + Products (or syncing)
    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#050505]">
            {!isPro && !subLoading && (
                <div className="mb-8 p-6 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in group">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                            <Rocket className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">Free Plan: Explorer Mode</h4>
                            <p className="text-gray-400 font-bold">Upgrade to unlock Import to Shopify, AI Product Optimization, and TikTok Video Export.</p>
                        </div>
                    </div>
                    <button
                        onClick={openUpgrade}
                        className="px-10 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl whitespace-nowrap"
                    >
                        See Pro Plans
                    </button>
                </div>
            )}

            {/* Toast notifications */}
            {toast && (
                <div className="fixed top-24 right-8 z-[100] animate-fade-in-up bg-black/90 text-white px-6 py-4 rounded-xl border border-primary shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center gap-3">
                    <CheckCircle2 className="text-green-400 w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-widest">{toast}</span>
                </div>
            )}

            {/* NUCLEAR 13 PART 7: Failsafe syncing indicator */}
            {isSyncing && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-black/90 text-white px-8 py-3 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl backdrop-blur-md">
                    <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                    <span className="font-bold text-sm uppercase tracking-widest">Syncing products...</span>
                </div>
            )}

            {/* First import success banner */}
            {isFirstImport && (
                <div className="mb-6 p-6 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-4 animate-fade-in-up">
                    <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-black">Product imported successfully 🎉</h3>
                        <p className="text-green-400 text-sm font-bold">You can now optimize and sell. Use "AI Optimize" and "Push to Store".</p>
                    </div>
                </div>
            )}

            {/* SOURCE TOGGLE */}
            <div className="flex justify-center mb-10">
                <div className="p-1 px-1 bg-white/[0.03] border border-white/10 rounded-2xl flex gap-1">
                    <button
                        onClick={() => setViewMode('store')}
                        className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${viewMode === 'store' ? 'bg-primary text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <ShoppingBag className="w-4 h-4" /> My Store
                    </button>
                    <button
                        onClick={() => setViewMode('suppliers')}
                        className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${viewMode === 'suppliers' ? 'bg-primary text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Globe className="w-4 h-4" /> Suppliers
                    </button>
                </div>
            </div>

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-10">
                <div>
                    <h1 className="text-6xl font-black mb-4 text-white uppercase tracking-tighter flex items-center gap-5">
                        <Zap className="w-12 h-12 text-primary" />
                        {viewMode === 'store' ? 'Product Finder' : 'Supplier Discovery'}
                    </h1>
                    <div className="flex items-center gap-6">
                        <p className="text-xl text-gray-500 font-bold">
                            {viewMode === 'store'
                                ? <>Scanning <span className="text-white">{products.length} products</span>.</>
                                : <>Discovering <span className="text-white">{supplierProducts.length} top products</span>.</>
                            }
                        </p>
                        {viewMode === 'store' && (
                            <button onClick={() => handleRescan()} disabled={isRescanning} className="text-[11px] font-black uppercase text-primary border-b border-primary/20 hover:border-primary transition-all flex items-center gap-2">
                                {isRescanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : null} Rescan Store
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative group w-full lg:w-auto">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={viewMode === 'store' ? "Search your store..." : "Search global suppliers..."}
                        className="w-full lg:w-80 pl-14 pr-6 py-4 rounded-2xl bg-white/[0.04] border border-white/8 text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 transition-all font-bold"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {isSearching && <RefreshCw className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 animate-spin" />}
                </div>
            </div>

            {/* SUPPLIER FILTERS */}
            {viewMode === 'suppliers' && (
                <div className="flex flex-wrap gap-6 mb-8 p-6 bg-white/[0.02] border border-white/5 rounded-3xl items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Provider:</span>
                        <div className="flex gap-2">
                            {['All', 'DSers', 'CJ', 'Temu'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setActiveSupplier(s)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${activeSupplier === s ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 lg:ml-auto">
                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Niche:</span>
                        <div className="flex gap-2">
                            {['All', 'Pets', 'Beauty', 'Fitness'].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setActiveNiche(n)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${activeNiche === n ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Onboarding overlay (for users who connected but haven't fully completed) */}
            {showOnboarding && (
                <OnboardingFlow
                    shopifyConnected={shopifyConnected}
                    productsCount={products.length}
                    onRescan={() => handleRescan()}
                    isRescanning={isRescanning}
                    onDismiss={() => setShowOnboarding(false)}
                />
            )}

            {/* MODALS */}
            {selectedMarketingProduct && (
                <MarketingModal
                    product={selectedMarketingProduct}
                    onClose={() => setSelectedMarketingProduct(null)}
                />
            )}

            {/* GRID CONTAINER */}
            <div className="min-h-[400px]">
                {isSyncing ? (
                    <ProductGridSkeleton count={8} />
                ) : viewMode === 'store' ? (
                    products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onPushToStore={handlePushToStore}
                                    onOpenMarketing={(p) => setSelectedMarketingProduct(p)}
                                    plan={plan}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Package className="w-12 h-12" />}
                            title="Nenhum produto na sua loja"
                            message="Sua loja Shopify está conectada, mas não encontramos produtos importados. Tente scanear novamente ou importar via DSers/CJ."
                            action={
                                <button onClick={() => setViewMode('suppliers')} className="mt-4 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/20 transition-all flex items-center gap-2">
                                    <Globe className="w-4 h-4" /> Explorar Fornecedores
                                </button>
                            }
                        />
                    )
                ) : (
                    supplierProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {supplierProducts.map((p) => (
                                <SupplierProductCard
                                    key={p.id}
                                    product={p}
                                    onImport={handleImportToShopify}
                                    isImporting={isImporting === p.id}
                                    plan={plan}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Search className="w-12 h-12" />}
                            title="Nenhum fornecedor encontrado"
                            message="Não encontramos produtos de fornecedores para essa busca."
                        />
                    )
                )}
            </div>

            {/* NUCLEAR 13 PART 6: Lazy load trigger */}
            <div ref={loaderRef} className="mt-12 flex justify-center">
                {isLoadingMore && (
                    <div className="flex items-center gap-3 text-gray-500">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span className="font-bold">Loading more products...</span>
                    </div>
                )}
                {!hasMore && products.length > 0 && (
                    <p className="text-gray-700 font-bold text-sm">All {products.length} products loaded.</p>
                )}
            </div>

            {showTemuModal && <TemuModal onClose={() => setShowTemuModal(false)} onRescan={() => handleRescan()} />}
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => showUpgradeModal(false)}
                featureName="Premium Feature"
            />
        </div>
    );
}
