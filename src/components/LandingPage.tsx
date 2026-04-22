'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    Zap, Package, Wand2, Video, TrendingUp, ArrowRight, Check,
    Star, Sparkles, ChevronDown, Play, Shield, Clock, BarChart3,
    Crown, Globe, ExternalLink
} from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { TrustSection } from '@/components/TrustSection';
import { FaqSection } from '@/components/FaqSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { Footer } from '@/components/Footer';

// ─── PRICING CARD ────────────────────────────────────────────────────────────
function PricingCard({ plan, onSelect }: { plan: typeof PLANS[0]; onSelect: () => void }) {
    const isPopular = plan.highlighted;
    const isEmpire = plan.id === 'elite';

    return (
        <div
            className={`relative rounded-3xl p-8 border flex flex-col transition-transform hover:-translate-y-2 duration-300 ${isPopular
                    ? 'border-primary/60 bg-primary/5 shadow-[0_0_60px_rgba(34,197,94,0.1)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Mais Popular
                </div>
            )}
            {isEmpire && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-yellow-500 text-black font-black text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5">
                    <Crown className="w-3 h-3" /> Profissional
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-xl font-black uppercase tracking-tighter mb-1 ${isPopular ? 'text-primary' : 'text-white'}`}>
                    {plan.name}
                </h3>
                {plan.description && (
                    <p className="text-sm text-gray-400 font-bold mb-4">{plan.description}</p>
                )}
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white">${plan.priceMonthly}</span>
                    <span className="text-gray-500">/mo</span>
                </div>
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPopular ? 'bg-primary/20' : 'bg-white/10'}`}>
                            <Check className={`w-3 h-3 ${isPopular ? 'text-primary' : 'text-white'}`} />
                        </div>
                        {f}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 ${isPopular
                        ? 'bg-primary text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                        : 'bg-white/8 text-white border border-white/10 hover:bg-white/15'
                    }`}
            >
                Start Free Trial <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── FEATURE CARD ────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="group p-8 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/[0.04] transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-black text-white mb-2">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}

// ─── MAIN LANDING ─────────────────────────────────────────────────────────────
export default function LandingPage() {

    return (
        <div className="min-h-screen bg-[#020202] text-white">
            {/* NAV */}
            <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/60">
                <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-black text-xl tracking-tight flex items-center gap-2">
                        <span className="bg-primary/20 h-7 w-7 rounded-lg flex items-center justify-center text-xs text-primary border border-primary/30">AI</span>
                        EmpireBuilder
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
                        <a href="#features" className="hover:text-white transition-colors">Recursos</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/signin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors px-4 py-2">Log In</Link>
                        <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-primary text-sm py-2 px-5 font-black">
                            Start Free Trial
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="relative pt-32 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="container max-w-5xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8">
                        <Sparkles className="w-3 h-3" /> Novo: AI Optimize v2 com TikTok Export
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8">
                        Encontre produtos{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                            vencedores
                        </span>{' '}
                        com IA
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 font-bold max-w-2xl mx-auto mb-12 leading-relaxed">
                        Importe de DSers, CJ e Temu. Otimize com IA. Exporte para TikTok. Calcule margens em tempo real. Tudo em uma plataforma.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-primary text-base px-10 py-5 font-black tracking-widest group flex items-center justify-center gap-3 shadow-[0_0_60px_rgba(34,197,94,0.3)] w-full sm:w-auto"
                        >
                            Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center justify-center gap-3 text-gray-400 hover:text-white font-bold transition-colors w-full sm:w-auto"
                        >
                            <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <Play className="w-4 h-4 ml-0.5" />
                            </div>
                            See How It Works
                        </button>
                    </div>

                    <div className="mt-10 flex items-center justify-center gap-8 text-sm text-gray-600 font-bold">
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 7 dias grátis</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Sem cartão de crédito</div>
                        <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Cancele quando quiser</div>
                    </div>
                </div>

                {/* Social proof strip */}
                <div className="mt-20 border-y border-white/5 py-4 bg-white/[0.01] overflow-hidden">
                    <div className="flex gap-10 w-max animate-marquee">
                        {['DSers', 'CJ Dropshipping', 'Temu', 'Shopify', 'TikTok', 'AliExpress', 'DSers', 'CJ Dropshipping', 'Temu', 'Shopify', 'TikTok', 'AliExpress'].map((s, i) => (
                            <span key={i} className="text-gray-700 font-black text-sm uppercase tracking-widest whitespace-nowrap">{s}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TRUST SECTION ─── */}
            <TrustSection />

            {/* ─── FEATURES ─── */}
            <section id="features" className="py-28 px-6">
                <div className="container max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Tudo que você precisa.</h2>
                        <p className="text-xl text-gray-500 font-bold">Do produto à venda, sem sair da plataforma.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<Package className="w-6 h-6 text-primary" />}
                            title="Importação de Fornecedores"
                            desc="Conecte DSers, CJ e Temu. Importe produtos com 1 clique e sincronize automaticamente."
                        />
                        <FeatureCard
                            icon={<Wand2 className="w-6 h-6 text-primary" />}
                            title="AI Optimize"
                            desc="Nossa IA reescreve título, descrição e tags para maximizar conversão e SEO na Shopify."
                        />
                        <FeatureCard
                            icon={<Video className="w-6 h-6 text-primary" />}
                            title="TikTok Export"
                            desc="Exporte produtos prontos para TikTok Shop com conteúdo otimizado para o algoritmo."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-6 h-6 text-primary" />}
                            title="Margem Engine"
                            desc="Calcule custo, lucro e margem em tempo real. Saiba exatamente o que escalar."
                        />
                    </div>
                </div>
            </section>

            {/* ─── PRICING ─── */}
            <section id="pricing" className="py-28 px-6">
                <div className="container max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Simple, transparent pricing.</h2>
                        <p className="text-xl text-gray-500 font-bold">Start free. Upgrade only when you’re ready.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        {PLANS.map(plan => (
                            <PricingCard key={plan.id} plan={plan} onSelect={() => { }} />
                        ))}
                    </div>
                    
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.02] border border-white/5 text-sm font-bold text-gray-400">
                            <Shield className="w-4 h-4 text-green-500" />
                            Sem compromisso. Cancele quando quiser.
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <FaqSection />
            <TestimonialsSection />

            {/* ─── FINAL CTA ─── */}
            <section className="py-28 px-6 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/15 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">
                        Pronto para construir<br />seu império?
                    </h2>
                    <p className="text-xl text-gray-500 font-bold mb-8">7 dias grátis. Sem cartão de crédito. Setup em 5 minutos.</p>
                    
                    <div className="mb-6">
                        <span className="inline-block bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                            Pagamentos Seguros • Fácil para Iniciantes • IA Avançada • Funciona no Celular
                        </span>
                    </div>

                    <p className="text-sm font-black text-green-400 uppercase tracking-widest mb-4">Comece grátis — sem risco</p>

                    <button
                        onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary text-lg px-16 py-5 font-black tracking-widest inline-flex items-center justify-center gap-3 shadow-[0_0_80px_rgba(34,197,94,0.4)]"
                    >
                        Start Free Trial <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
