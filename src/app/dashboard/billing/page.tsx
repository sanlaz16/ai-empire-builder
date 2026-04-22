'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { CreditCard, CheckCircle2, AlertCircle, Zap, Shield, ArrowUpRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 'R$0',
        features: ['10 AI Searches/day', '3 Store Pushes/day', 'Standard Support'],
        priceId: null
    },
    {
        id: 'starter10k',
        name: 'Starter (10k)',
        price: 'R$39.00',
        features: ['50 AI Searches/day', '25 Store Pushes/day', 'Priority Support', 'Trend Analytics'],
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER // Configured in env
    },
    {
        id: 'growth25k',
        name: 'Growth (25k)',
        price: 'R$99.00',
        features: ['200 AI Searches/day', '100 Store Pushes/day', 'Live Chat Support', 'Supplier DB Access'],
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH // Configured in env
    }
];

export default function BillingPage() {
    const sub = useSubscription();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Handle incoming redirect messages
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            setSuccessMessage("Checkout concluído! Sua assinatura foi atualizada com sucesso.");
        }
        if (query.get('canceled')) {
            setErrorMessage("O checkout foi cancelado.");
        }
    }, []);

    const handleUpgrade = async (planId: string, priceId: string | null) => {
        if (!priceId) return; // Free plan
        setLoadingPlan(planId);
        setErrorMessage(null);

        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, priceId })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            if (data.url) {
                // Redirect user to the Stripe / Pagar.me hosted checkout
                window.location.href = data.url;
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Falha ao iniciar checkout.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleManageBilling = async () => {
        setPortalLoading(true);
        try {
            const res = await fetch('/api/billing/portal', { method: 'POST' });
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Falha ao carregar portal de cliente. Sua assinatura está ativa?');
        } finally {
            setPortalLoading(false);
        }
    };

    const UsageBar = ({ label, current, max }: { label: string, current: number, max: number }) => {
        const percentage = Math.min((current / max) * 100, 100);
        const isWarning = percentage > 85;
        return (
            <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">
                    <span>{label}</span>
                    <span className={isWarning ? 'text-yellow-500' : 'text-primary'}>{current} / {max}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${isWarning ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 'bg-primary shadow-[0_0_10px_rgba(0,242,234,0.4)]'}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-12 pb-32">

            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-primary" />
                    Faturamento e Planos
                </h1>
                <p className="text-gray-400">Gerencie sua assinatura, limites de uso e métodos de pagamento.</p>
            </div>

            {/* Toasts */}
            {successMessage && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <strong>Sucesso:</strong> {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <strong>Erro:</strong> {errorMessage}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">

                {/* Active Plan / Usage Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card p-6 border-primary/20 bg-primary/[0.02]">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Shield className="w-4 h-4 text-primary" /> Visão Geral
                        </h2>

                        <div className="mb-8">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Plano Atual</div>
                            <div className="text-3xl font-black text-white flex items-center gap-2">
                                {sub.plan.toUpperCase()}
                            </div>
                            <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold ${sub.isActive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/20'}`}>
                                Status: {sub.status || 'Ativo'}
                            </div>
                        </div>

                        {/* Dummy Usage Bars - In a real scenario these would be fetched from /api/usage */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Uso Diário</h3>
                            <UsageBar label="Tokens IA (Seed/Rescan)" current={8} max={sub.plan === 'free' ? 10 : 50} />
                            <UsageBar label="Produtos Adicionados" current={2} max={sub.plan === 'free' ? 3 : 25} />
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={handleManageBilling}
                                disabled={portalLoading}
                                className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {portalLoading ? 'Direcionando...' : 'Gerenciar Faturamento ↗'}
                            </button>
                            <p className="text-[10px] text-gray-500 mt-3 text-center uppercase tracking-widest font-bold">Via Portal Seguro</p>
                        </div>
                    </div>
                </div>

                {/* Pricing Tiers */}
                <div className="lg:col-span-2">
                    <div className="grid md:grid-cols-3 gap-4">
                        {PLANS.map((plan) => (
                            <div key={plan.id} className={`glass-card p-6 rounded-2xl flex flex-col relative transition-all ${sub.plan === plan.id ? 'border-primary/50 bg-primary/[0.05] shadow-[0_0_30px_rgba(0,242,234,0.1)]' : 'border-white/10 hover:border-white/20'}`}>

                                {sub.plan === plan.id && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        Seu Plano
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-3xl font-black text-white">{plan.price}</span>
                                        <span className="text-gray-500 font-bold mb-1">/mês</span>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-300 font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleUpgrade(plan.id, plan.priceId as string | null)}
                                    disabled={sub.plan === plan.id || loadingPlan === plan.id || (!plan.priceId && plan.id !== 'free')}
                                    className={`w-full py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 
                                        ${sub.plan === plan.id ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10' :
                                            plan.id === 'growth25k' ? 'bg-primary text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,234,0.3)]' :
                                                'bg-white text-black hover:bg-gray-200'}`}
                                >
                                    {loadingPlan === plan.id ? 'Processando...' :
                                        sub.plan === plan.id ? 'Plano Atual' :
                                            'Fazer Upgrade'}
                                </button>

                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
