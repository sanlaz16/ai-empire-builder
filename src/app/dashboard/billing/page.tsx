'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { CreditCard, CheckCircle2, AlertCircle, Shield, Crown, Sparkles, Zap, Star } from 'lucide-react';
import { PLANS } from '@/lib/plans';
import { trackEvent } from '@/lib/analytics/trackEvent';

const PLAN_ICONS = {
    free: <Sparkles className="w-5 h-5" />,
    pro: <Zap className="w-5 h-5" />,
    elite: <Crown className="w-5 h-5" />,
};

const PLAN_COLORS = {
    free: 'border-white/10',
    pro: 'border-primary/50 bg-primary/[0.03] shadow-[0_0_40px_rgba(0,242,234,0.08)]',
    elite: 'border-purple-500/40 bg-purple-500/[0.03]',
};

export default function BillingPage() {
    const sub = useSubscription();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        trackEvent('pricing_viewed', { currentPlan: sub.plan });
    }, []);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            setSuccessMessage('Checkout concluído! Sua assinatura foi atualizada com sucesso.');
        }
        if (query.get('canceled')) {
            setErrorMessage('O checkout foi cancelado. Nenhuma cobrança foi realizada.');
        }
    }, []);

    const handleUpgrade = async (planId: string, priceId: string | null) => {
        if (!priceId) return;
        setLoadingPlan(planId);
        setErrorMessage(null);
        trackEvent('checkout_started', { planId, priceId });

        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, priceId }),
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (data.url) window.location.href = data.url;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Falha ao iniciar checkout.';
            setErrorMessage(msg);
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
            if (data.url) window.location.href = data.url;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Falha ao carregar portal.';
            setErrorMessage(msg);
        } finally {
            setPortalLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10 pb-32">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-primary" />
                    Faturamento e Planos
                </h1>
                <p className="text-gray-400">Gerencie sua assinatura e desbloqueie mais recursos.</p>
            </div>

            {/* Alerts */}
            {successMessage && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span><strong>Sucesso:</strong> {successMessage}</span>
                </div>
            )}
            {errorMessage && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span><strong>Erro:</strong> {errorMessage}</span>
                </div>
            )}

            {/* Beta notice */}
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
                <Star className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                    <p className="text-yellow-400 font-black text-sm">Acesso Beta Ativo</p>
                    <p className="text-yellow-400/60 text-xs mt-0.5 font-bold">
                        Durante o beta, você tem 14 dias de acesso gratuito completo. Pagamentos serão ativados em breve.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Current Plan Summary */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 border-primary/20 bg-primary/[0.02] h-full flex flex-col">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                            <Shield className="w-4 h-4 text-primary" /> Seu Plano Atual
                        </h2>

                        <div className="mb-6">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Plano</div>
                            <div className="text-3xl font-black text-white capitalize">{sub.plan.toUpperCase()}</div>
                            <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold ${sub.isActive
                                ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                                : 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/20'}`}>
                                {sub.isActive ? '● Ativo' : '○ Inativo'}
                            </div>
                        </div>

                        {/* Limits display */}
                        <div className="space-y-3 mb-8">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Limites do Plano</div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Anúncios por sessão</span>
                                <span className="font-black text-white">{sub.plan === 'free' ? '3' : '10'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Análises de loja/dia</span>
                                <span className="font-black text-white">{sub.plan === 'elite' ? '∞' : sub.plan === 'pro' ? '20' : '2'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Importação de produtos</span>
                                <span className="font-black text-white">{sub.plan === 'elite' ? '∞' : sub.plan === 'pro' ? '100' : '10'}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5">
                            <button
                                onClick={handleManageBilling}
                                disabled={portalLoading}
                                className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {portalLoading ? 'Redirecionando...' : 'Gerenciar Faturamento ↗'}
                            </button>
                            <p className="text-[10px] text-gray-600 mt-3 text-center uppercase tracking-widest font-bold">Via Portal Seguro Stripe</p>
                        </div>
                    </div>
                </div>

                {/* Plan Cards */}
                <div className="lg:col-span-2">
                    <div className="grid md:grid-cols-3 gap-4">
                        {PLANS.map((plan) => {
                            const isCurrent = sub.plan === plan.id;
                            const isPopular = plan.highlighted;

                            return (
                                <div
                                    key={plan.id}
                                    className={`glass-card p-6 rounded-2xl flex flex-col relative transition-all ${isCurrent
                                        ? PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS]
                                        : 'border-white/8 hover:border-white/15'}`}
                                >
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                                            Seu Plano
                                        </div>
                                    )}
                                    {isPopular && !isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap border border-white/20">
                                            Mais Popular
                                        </div>
                                    )}

                                    <div className="mb-5">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.id === 'elite' ? 'bg-purple-500/20 text-purple-400' : plan.id === 'pro' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-400'}`}>
                                            {PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS]}
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-1">{plan.name}</h3>
                                        <p className="text-xs text-gray-500 font-bold mb-3">{plan.description}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white">{plan.priceDisplay}</span>
                                            <span className="text-gray-500 text-sm font-bold">/mês</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 flex-1 mb-6">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-300 font-bold">
                                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.id === 'elite' ? 'text-purple-400' : 'text-primary'}`} />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => handleUpgrade(plan.id, plan.stripePriceId || null)}
                                        disabled={isCurrent || loadingPlan === plan.id || !plan.stripePriceId}
                                        className={`w-full py-3 rounded-xl font-black transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2
                                            ${isCurrent
                                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                                : plan.id === 'elite'
                                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                                                    : plan.id === 'pro'
                                                        ? 'bg-primary text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(0,242,234,0.25)]'
                                                        : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100`}
                                    >
                                        {loadingPlan === plan.id ? 'Processando...' :
                                            isCurrent ? '✓ Plano Atual' :
                                                !plan.stripePriceId ? 'Em Breve' :
                                                    'Fazer Upgrade'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-center text-xs text-gray-600 font-bold mt-6">
                        🔒 Pagamentos seguros via Stripe • Cancele quando quiser • Sem taxas ocultas
                    </p>
                </div>
            </div>
        </div>
    );
}
