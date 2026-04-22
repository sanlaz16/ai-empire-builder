'use client';

import React, { useState } from 'react';
import { Check, Zap, Star, ShieldCheck, Rocket, Crown, ArrowRight, Loader2 } from 'lucide-react';
import { PLANS, PlanId } from '@/lib/plans';
import { useSubscription } from '@/hooks/useSubscription';

export default function PricingPage() {
    const { plan: currentPlan, loading } = useSubscription();
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleUpgrade = async (planId: PlanId) => {
        if (planId === currentPlan) return;

        setIsProcessing(planId);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to start checkout');
            }
        } catch (error) {
            console.error('Upgrade failed', error);
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#050505]">
            <div className="text-center mb-20 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -z-10" />
                <h1 className="text-7xl font-black text-white uppercase tracking-tighter mb-6">Choose Your Plan</h1>
                <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto">
                    Select the perfect plan to grow your dropshipping empire. Scale from a side-hustle to a $100k/mo operation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    const Icon = plan.id === 'free' ? Rocket : plan.id === 'pro' ? Zap : Crown;

                    return (
                        <div
                            key={plan.id}
                            className={`relative glass-card flex flex-col p-10 transition-all duration-500 hover:-translate-y-4 border-white/5 ${plan.highlighted ? 'border-primary/40 shadow-[0_20px_60px_rgba(34,197,94,0.15)] ring-1 ring-primary/20' : 'hover:border-white/20'}`}
                        >
                            {plan.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-10 text-center">
                                <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 border ${plan.id === 'elite' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-primary/10 border-primary/30'}`}>
                                    <Icon className={`w-8 h-8 ${plan.id === 'elite' ? 'text-purple-400' : 'text-primary'}`} />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black text-white">${plan.priceMonthly}</span>
                                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">/mo</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-12 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-gray-400 font-bold text-sm tracking-wide group-hover:text-white transition-colors">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isCurrent || !!isProcessing || plan.id === 'free'}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${isCurrent
                                        ? 'bg-white/5 border border-white/10 text-gray-500 cursor-default'
                                        : plan.id === 'elite'
                                            ? 'bg-purple-500 text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:bg-purple-400'
                                            : 'bg-primary text-black shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:scale-[1.03]'
                                    }`}
                            >
                                {isProcessing === plan.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCurrent ? (
                                    'Current Plan'
                                ) : (
                                    <>
                                        Upgrade Now <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 p-12 glass-card border-white/5 rounded-[3rem]">
                {[
                    { title: "Secure Checkout", desc: "Enterprise-grade encryption via Stripe & Pagarme", icon: ShieldCheck },
                    { title: "Global Payments", desc: "Pay with Credit Card, Pix, or Local payment methods", icon: Globe },
                    { title: "Cancel Anytime", desc: "No long-term contracts. Manage via billing portal", icon: RefreshCw }
                ].map((item, i) => (
                    <div key={i} className="flex gap-6 items-start">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <item.icon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-2">{item.title}</h4>
                            <p className="text-gray-500 font-bold text-xs leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Missing icons from lucide-react list above
import { Globe, RefreshCw } from 'lucide-react';
