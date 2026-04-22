'use client';

import { useState } from 'react';
import { DEMO_PRODUCTS, DEMO_PERFORMANCE, DEMO_PROFILE, DEMO_TIKTOK_POSTS } from '@/lib/mock/vipDemoData';
import { SITE_URL } from '@/lib/site';
import {
    LayoutDashboard, Package, Video, Zap, Store, Activity,
    ArrowRight, CheckCircle2, Flame, TrendingUp, Copy, ShieldCheck, Lock
} from 'lucide-react';
import Link from 'next/link';

export default function VipDemoPage() {
    const [activeTab, setActiveTab] = useState('products');
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans">

            {/* STICKY BANNER */}
            <div className="sticky top-0 z-50 bg-primary/10 backdrop-blur-md border-b border-primary/20 text-center py-2 px-4 shadow-[0_0_20px_rgba(0,242,234,0.1)]">
                <p className="text-xs md:text-sm font-bold text-primary flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    VIP DEMO MODE — No login required.
                    <span className="opacity-70 font-normal hidden md:inline">Real customer data is not shown.</span>
                </p>
            </div>

            {/* HEADER */}
            <header className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            EmpireBuilder AI
                        </h1>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-400 uppercase tracking-widest border border-white/5">
                            Demo
                        </span>
                    </div>
                    <p className="text-gray-400 max-w-lg">
                        Experience the power of automated e-commerce. Explore products, analytics, and AI tools in this interactive simulation.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all"
                    >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Share Demo'}
                    </button>
                    <Link
                        href="/launch"
                        className="px-6 py-2 rounded-xl bg-primary text-black font-bold hover:bg-primary/80 transition-all shadow-[0_0_15px_rgba(0,242,234,0.3)]"
                    >
                        Join Early Access
                    </Link>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-4 gap-8">

                {/* SIDEBAR SIMULATION */}
                <aside className="hidden lg:block space-y-2">
                    <DemoSidebarItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={Package} label="Product Finder" />
                    <DemoSidebarItem active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} icon={Activity} label="Performance" />
                    <DemoSidebarItem active={activeTab === 'tiktok'} onClick={() => setActiveTab('tiktok')} icon={Video} label="TikTok Manager" />
                    <DemoSidebarItem active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={Store} label="Store Profile" />
                    <div className="pt-4 border-t border-white/5 mt-4">
                        <div className="px-4 py-2 text-xs font-bold text-gray-600 uppercase">Integrations</div>
                        <div className="flex items-center gap-3 px-4 py-2 text-gray-500 opacity-50"><Link href="#" className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Shopify</Link></div>
                    </div>
                </aside>

                {/* DASHBOARD AREA */}
                <div className="lg:col-span-3 space-y-8">

                    {/* 1. PRODUCT FINDER DEMO */}
                    {activeTab === 'products' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="text-primary" /> Trending Products
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {DEMO_PRODUCTS.map((p) => (
                                    <div key={p.id} className="glass-card p-5 group hover:border-primary/50 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{p.name}</h3>
                                                <div className="text-xs text-gray-500 bg-white/5 inline-block px-2 py-1 rounded mt-1">{p.niche}</div>
                                            </div>
                                            {p.trendLabel && (
                                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${p.trendLabel === 'Exploding' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                    <Flame className="w-3 h-3" /> {p.trendLabel}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{p.description}</p>
                                        <div className="flex items-center justify-between text-sm mb-4 bg-black/20 p-3 rounded-lg">
                                            <div>
                                                <div className="text-gray-500 text-xs">Cost</div>
                                                <div className="font-mono text-white">${p.costPrice}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-xs">Sell</div>
                                                <div className="font-mono text-green-400 font-bold">${p.sellingPrice}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 text-xs">Margin</div>
                                                <div className="font-mono text-primary">{p.profitMargin}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors">
                                                add to Store
                                            </button>
                                            <button className="px-3 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                                                <Zap className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. PERFORMANCE DEMO */}
                    {activeTab === 'performance' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="text-green-400" /> Live Analytics
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <DemoKPI label="Total Revenue" value={DEMO_PERFORMANCE.revenue} trend="+12%" />
                                <DemoKPI label="Orders" value={DEMO_PERFORMANCE.orders} trend="+8%" />
                                <DemoKPI label="AOV" value={DEMO_PERFORMANCE.aov} trend="+2%" />
                                <DemoKPI label="Conversion" value={DEMO_PERFORMANCE.conversion} trend="-0.5%" down />
                            </div>
                            <div className="h-64 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
                                    {/* Mock Bar Chart */}
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/50 transition-all rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                    ))}
                                </div>
                                <div className="z-10 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 text-sm font-bold">
                                    Demo View Only
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. TIKTOK DEMO */}
                    {activeTab === 'tiktok' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Video className="text-[#00f2ea]" /> TikTok Posts
                            </h2>
                            <div className="space-y-4">
                                {DEMO_TIKTOK_POSTS.map((post: any) => (
                                    <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 bg-gray-800 rounded-md flex items-center justify-center text-gray-600">
                                                <Video className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{post.caption}</p>
                                                <p className="text-xs text-gray-500">{post.status} {post.date && `• ${post.date}`}</p>
                                            </div>
                                        </div>
                                        {post.views && (
                                            <div className="px-3 py-1 rounded-full bg-black/30 text-xs font-bold text-white border border-white/10 flex items-center gap-1">
                                                👀 {post.views}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4. PROFILE DEMO */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Store className="text-purple-400" /> Store Profile
                            </h2>
                            <div className="glass-card p-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
                                <div className="relative z-10">
                                    <img src={DEMO_PROFILE.logo_url} className="w-24 h-24 rounded-full border-4 border-black mx-auto mb-4" />
                                    <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                                        {DEMO_PROFILE.store_name}
                                        {DEMO_PROFILE.verified && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                                    </h3>
                                    <p className="text-gray-400 mb-6">{DEMO_PROFILE.tagline}</p>
                                    <div className="flex justify-center gap-4">
                                        {['Instagram', 'TikTok', 'YouTube'].map(s => (
                                            <div key={s} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 cursor-pointer">
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MOBILE NAV (Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-black/90 backdrop-blur-md border-t border-white/10 flex justify-around p-4 z-40">
                <button onClick={() => setActiveTab('products')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'products' ? 'text-primary' : 'text-gray-500'}`}><Package className="w-5 h-5" /> Products</button>
                <button onClick={() => setActiveTab('performance')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'performance' ? 'text-green-400' : 'text-gray-500'}`}><Activity className="w-5 h-5" /> Stats</button>
                <button onClick={() => setActiveTab('tiktok')} className={`text-xs flex flex-col items-center gap-1 ${activeTab === 'tiktok' ? 'text-[#00f2ea]' : 'text-gray-500'}`}><Video className="w-5 h-5" /> TikTok</button>
            </div>
        </div>
    );
}

function DemoSidebarItem({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
        >
            <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
            {label}
        </button>
    );
}

function DemoKPI({ label, value, trend, down }: any) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-black text-white mb-1">{value}</div>
            <div className={`text-xs font-bold flex items-center gap-1 ${down ? 'text-red-400' : 'text-green-400'}`}>
                {down ? <TrendingUp className="w-3 h-3 rotate-180" /> : <TrendingUp className="w-3 h-3" />}
                {trend}
            </div>
        </div>
    );
}
