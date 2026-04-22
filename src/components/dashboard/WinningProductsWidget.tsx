'use client';

import { useState, useEffect } from 'react';
import { Flame, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface WinningProduct {
    id: string;
    title: string;
    overall_score: number;
    niche: string;
    image_url: string;
}

export default function WinningProductsWidget() {
    const [winners, setWinners] = useState<WinningProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWinners() {
            try {
                // Fetch products with scores > 80
                const res = await fetch('/api/shopify/products?limit=5');
                const data = await res.json();

                if (Array.isArray(data)) {
                    const topWinners = data
                        .filter(p => p.aiScore && p.aiScore.overall_score >= 80)
                        .map(p => ({
                            id: p.id,
                            title: p.title,
                            overall_score: p.aiScore.overall_score,
                            niche: p.aiScore.niche,
                            image_url: p.imageUrl
                        }));
                    setWinners(topWinners);
                }
            } catch (e) {
                console.error('Failed to fetch winning products', e);
            } finally {
                setLoading(false);
            }
        }
        fetchWinners();
    }, []);

    if (loading) return <div className="h-48 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs">AI Scanning for Winners...</div>;

    if (winners.length === 0) return (
        <div className="p-6 text-center border border-white/5 rounded-2xl bg-white/[0.02]">
            <p className="text-gray-500 font-bold text-sm mb-4">No winning products detected yet.</p>
            <Link href="/dashboard/product-finder" className="text-primary text-xs font-black uppercase tracking-widest hover:underline">
                Start Scanning →
            </Link>
        </div>
    );

    return (
        <div className="space-y-4">
            {winners.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group">
                    <img src={product.image_url} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-white truncate group-hover:text-primary transition-colors">{product.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{product.niche}</span>
                            <div className="flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded text-[9px] font-black text-red-400">
                                <Flame className="w-2.5 h-2.5" /> {product.overall_score}%
                            </div>
                        </div>
                    </div>
                    <Link href="/dashboard/product-finder" className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-gray-500 hover:text-primary transition-all">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ))}
            <Link href="/dashboard/product-finder" className="flex items-center justify-center gap-2 py-3 w-full rounded-xl border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest">
                View All Winners <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}
