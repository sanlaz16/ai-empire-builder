'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubscriptionProvider, useSubscription } from '@/context/SubscriptionContext';
import DevResetButton from '@/components/DevResetButton';
import FeedbackWidget from '@/components/FeedbackWidget';
import { useTranslation } from '@/hooks/useTranslation';
import { X } from 'lucide-react';

function PlanBadge() {
    const { plan, isActive, loading } = useSubscription();
    if (loading) return null;
    return (
        <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive
            ? 'text-primary bg-primary/10 border border-primary/20'
            : 'text-gray-500 bg-white/5 border border-white/10'
            }`}>
            {plan.toUpperCase()}
        </div>
    );
}

function BetaBanner() {
    const { t } = useTranslation();
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('empire-beta-banner-dismissed');
        if (stored === '1') setDismissed(true);
    }, []);

    const dismiss = () => {
        setDismissed(true);
        localStorage.setItem('empire-beta-banner-dismissed', '1');
    };

    if (dismissed) return null;

    return (
        <div className="bg-primary/5 border-b border-primary/10 px-6 py-2 flex items-center justify-between text-xs font-bold text-primary/80">
            <span>{t('layout.betaBannerText')}</span>
            <button
                onClick={dismiss}
                className="ml-4 text-primary/50 hover:text-primary transition-colors flex items-center gap-1 shrink-0"
            >
                {t('layout.betaBannerDismiss')} <X className="w-3 h-3" />
            </button>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { t } = useTranslation();
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/signin');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-primary">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="animate-pulse">{t('layout.verifyingAccess')}</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <SubscriptionProvider>
            <div className="flex min-h-screen bg-background text-foreground font-sans">
                <Sidebar />

                <div className="flex-grow flex flex-col">
                    {/* Top Header */}
                    <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-surface/50 backdrop-blur-md sticky top-0 z-40">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-lg hidden md:block">EmpireBuilder</h2>
                            {/* Beta badge — short on mobile, full on desktop */}
                            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">{t('layout.betaFull')}</span>
                            </div>
                            <div className="flex md:hidden items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-wider">{t('layout.betaBadge')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold">{user.user_metadata.full_name || user.email}</div>
                                    <PlanBadge />
                                </div>
                                <div className="h-10 w-10 bg-gradient-to-br from-primary/60 to-emerald-600 rounded-full border-2 border-white/10 flex items-center justify-center text-black font-black">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Beta disclaimer banner */}
                    <BetaBanner />

                    {/* Main Content */}
                    <main className="flex-grow bg-background relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid opacity-[0.3] pointer-events-none"></div>
                        {children}
                    </main>
                    <DevResetButton />
                    <FeedbackWidget />
                </div>
            </div>
        </SubscriptionProvider>
    );
}
