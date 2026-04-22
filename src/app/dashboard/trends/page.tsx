'use client';

import { useState, useEffect } from 'react';
import { generateProducts } from '@/lib/mock/productGenerator'; // Reuse existing mock generator
import { calculateTrendScore, TrendData } from '@/lib/mock/trendRadar';
import { generateThumbnail, ThumbnailResult } from '@/lib/mock/generateThumbnail';
import { Product } from '@/lib/db';
import { ShoppingBag, Zap, Image as ImageIcon, Flame, ArrowUpRight, TrendingUp, Download, RefreshCw, X } from 'lucide-react';

export default function TrendsPage() {
    const [trendingProducts, setTrendingProducts] = useState<(Product & TrendData)[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Thumbnail Modal State
    const [showThumbnailModal, setShowThumbnailModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [generatedThumbnail, setGeneratedThumbnail] = useState<ThumbnailResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [thumbnailStyle, setThumbnailStyle] = useState<'neon' | 'clean' | 'luxury' | 'viral'>('neon');

    useEffect(() => {
        loadTrends();
    }, []);

    const loadTrends = async () => {
        setIsLoading(true);
        // Simulate fetching "Global Trends"
        const products = await generateProducts('Global Trends', 'Mixed');

        const ranked = products.map(p => ({
            ...p,
            ...calculateTrendScore(p)
        })).sort((a, b) => b.trendScore - a.trendScore).slice(0, 20); // Top 20

        setTrendingProducts(ranked);
        setIsLoading(false);
    };

    const handleGenerateThumbnail = async () => {
        if (!selectedProduct) return;
        setIsGenerating(true);
        const result = await generateThumbnail(selectedProduct, thumbnailStyle);
        setGeneratedThumbnail(result);
        setIsGenerating(false);
    };

    const openThumbnailModal = (product: Product) => {
        setSelectedProduct(product);
        setGeneratedThumbnail(null);
        setShowThumbnailModal(true);
        // Auto-generate first one? No, let user choose style.
    };

    const getTrendColor = (label: string) => {
        if (label === 'Exploding') return 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse';
        if (label === 'Hot') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        if (label === 'Rising') return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">

            {/* HEADER */}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-black/50 border border-primary/30 mb-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                    <Zap className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-purple-500 mb-4">
                    Viral Trend Radar
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Real-time AI analysis of products about to <span className="text-white font-bold">explode</span> on TikTok.
                </p>
            </div>

            {/* PRODUCT GRID */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-96 bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingProducts.map((product, idx) => (
                        <div key={product.id} className="glass-card p-5 group relative overflow-hidden transition-all hover:border-primary/50 hover:translate-y-[-5px]">

                            {/* RANK */}
                            <div className="absolute top-0 right-0 p-4 font-black text-6xl text-white/5 group-hover:text-primary/10 transition-colors pointer-events-none">
                                #{idx + 1}
                            </div>

                            {/* TREND BADGE */}
                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 ${getTrendColor(product.trendLabel)}`}>
                                <Flame className="w-3 h-3" /> {product.trendLabel}
                            </div>

                            <div className="mt-12 mb-4">
                                <div className="text-xs text-primary font-bold mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Score: {product.trendScore}/100
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 leading-tight pr-8">{product.name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2 min-h-[2.5em]">{product.reason}</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                                <div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold">Price</div>
                                    <div className="text-green-400 font-mono font-bold">${product.sellingPrice}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openThumbnailModal(product)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                                        title="Generate AI Thumbnail"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </button>
                                    <button className="px-4 py-2 rounded-lg bg-primary text-black font-bold hover:bg-primary/80 transition-all flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* THUMBNAIL MODAL */}
            {showThumbnailModal && selectedProduct && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
                    <div className="glass-card max-w-4xl w-full p-0 overflow-hidden flex flex-col md:flex-row relative border-primary/30">
                        <button
                            onClick={() => setShowThumbnailModal(false)}
                            className="absolute top-4 right-4 z-10 text-white/50 hover:text-white bg-black/50 p-2 rounded-full backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* LEFT: Controls */}
                        <div className="p-8 w-full md:w-1/3 border-r border-white/10 bg-black/20 flex flex-col">
                            <h2 className="text-2xl font-bold text-white mb-1">AI Thumbnail</h2>
                            <p className="text-sm text-gray-400 mb-6">{selectedProduct.name}</p>

                            <div className="space-y-6 flex-grow">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-3 block">Choose Style</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['neon', 'clean', 'luxury', 'viral'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setThumbnailStyle(style as any)}
                                                className={`p-3 rounded-xl border text-sm font-bold capitalize transition-all ${thumbnailStyle === style
                                                        ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateThumbnail}
                                disabled={isGenerating}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-8 shadow-lg shadow-primary/20"
                            >
                                {isGenerating ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-current" /> Generate Cover
                                    </>
                                )}
                            </button>
                        </div>

                        {/* RIGHT: Preview */}
                        <div className="w-full md:w-2/3 p-8 bg-[#0a0a0a] flex items-center justify-center relative">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />

                            {generatedThumbnail ? (
                                <div className="relative group max-w-xs mx-auto animate-fade-in-up">
                                    <div className="aspect-[9/16] rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative">
                                        <img src={generatedThumbnail.imageUrl} alt="AI Thumbnail" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-50" />
                                    </div>

                                    <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button className="p-3 rounded-full bg-white text-black hover:scale-110 transition-transform shadow-lg">
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button className="px-6 py-3 rounded-full bg-[#00f2ea] text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,242,234,0.4)]">
                                            Use for TikTok
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-600 max-w-sm">
                                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                                        <ImageIcon className="w-10 h-10 opacity-50" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Ready to Generate</h3>
                                    <p>Select a style and click Generate to create a scroll-stopping TikTok cover.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
