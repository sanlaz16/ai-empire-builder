'use client';

import { useEffect, useMemo } from 'react';
import { CheckCircle2, Circle, ExternalLink, RefreshCw, Zap, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

interface OnboardingFlowProps {
    shopifyConnected: boolean;
    productsCount: number;
    optimizedCount?: number;
    onRescan: () => void;
    isRescanning: boolean;
    onDismiss: () => void;
}

export default function OnboardingFlow({
    shopifyConnected,
    productsCount,
    optimizedCount = 0,
    onRescan,
    isRescanning,
    onDismiss,
}: OnboardingFlowProps) {
    const { t } = useTranslation();

    const STEPS = useMemo(() => [
        {
            id: 1,
            title: t('onboarding.connectShopify'),
            description: t('onboarding.connectShopifyDesc'),
            action: null,
            actionLabel: t('onboarding.goToIntegrations'),
            actionHref: '/dashboard/integrations',
        },
        {
            id: 2,
            title: t('onboarding.importProducts'),
            description: t('onboarding.importProductsDesc'),
            action: null,
            actionLabel: t('onboarding.openDsers'),
            actionHref: 'https://admin.shopify.com/apps/dsers',
            external: true,
        },
        {
            id: 3,
            title: t('onboarding.scanStore'),
            description: t('onboarding.scanStoreDesc'),
            action: 'rescan',
            actionLabel: t('onboarding.rescanNow'),
        },
        {
            id: 4,
            title: t('onboarding.optimizePublish'),
            description: t('onboarding.optimizePublishDesc'),
            action: null,
            actionLabel: null,
        },
    ], [t]);

    // Step completion state
    const completedSteps = useMemo(() => {
        const steps = new Set<number>();
        if (shopifyConnected) steps.add(1);
        if (productsCount > 0) steps.add(2);
        if (productsCount > 0) steps.add(3);
        if (optimizedCount > 0) steps.add(4);
        return steps;
    }, [shopifyConnected, productsCount, optimizedCount]);

    const currentStep = STEPS.find(s => !completedSteps.has(s.id))?.id ?? 4;

    // Auto-dismiss when Shopify connected AND products > 0
    useEffect(() => {
        if (shopifyConnected && productsCount > 0) {
            const timer = setTimeout(onDismiss, 4000);
            return () => clearTimeout(timer);
        }
    }, [shopifyConnected, productsCount, onDismiss]);

    if (shopifyConnected && productsCount > 0) return null;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-black to-primary/5 p-8 mb-12 shadow-[0_0_60px_rgba(34,197,94,0.08)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <button
                onClick={onDismiss}
                className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors z-10"
            >
                <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-2 relative z-10">
                <Zap className="w-5 h-5 text-primary" />
                {t('onboarding.gettingStarted')}
            </h2>
            <p className="text-sm text-gray-500 font-bold mb-8 relative z-10">
                {t('onboarding.followSteps')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {STEPS.map((step) => {
                    const done = completedSteps.has(step.id);
                    const active = step.id === currentStep;
                    return (
                        <div
                            key={step.id}
                            className={`p-5 rounded-2xl border transition-all duration-300 ${done
                                ? 'border-green-500/30 bg-green-500/5'
                                : active
                                    ? 'border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                                    : 'border-white/5 bg-white/[0.02]'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {done
                                    ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                    : <Circle className={`w-5 h-5 shrink-0 ${active ? 'text-primary' : 'text-gray-700'}`} />
                                }
                                <span className={`text-[11px] font-black uppercase tracking-widest ${done ? 'text-green-400' : active ? 'text-primary' : 'text-gray-600'}`}>
                                    {t('onboarding.step')} {step.id}
                                </span>
                            </div>
                            <h3 className={`font-black text-sm mb-1 ${done ? 'text-gray-400 line-through' : active ? 'text-white' : 'text-gray-600'}`}>
                                {step.title}
                            </h3>
                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">{step.description}</p>

                            {!done && active && step.action === 'rescan' && (
                                <button
                                    onClick={onRescan}
                                    disabled={isRescanning}
                                    className="w-full py-2 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isRescanning
                                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> {t('onboarding.scanning')}</>
                                        : t('onboarding.rescanNow')
                                    }
                                </button>
                            )}

                            {!done && active && !step.action && step.actionHref && (
                                (step as { external?: boolean }).external
                                    ? <a
                                        href={step.actionHref}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full py-2 rounded-xl bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {step.actionLabel} <ExternalLink className="w-3 h-3" />
                                    </a>
                                    : <Link
                                        href={step.actionHref}
                                        className="w-full py-2 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        {step.actionLabel}
                                    </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
