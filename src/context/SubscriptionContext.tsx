'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { canUseFeature, FeatureKey, PlanLevel } from '@/lib/planGate';

interface SubscriptionContextValue {
    plan: PlanLevel;
    status: string;
    isActive: boolean;
    loading: boolean;
    can: (feature: FeatureKey) => boolean;
    checkFeature: (feature: FeatureKey) => boolean;
    refresh: () => Promise<void>;
    isUpgradeModalOpen: boolean;
    showUpgradeModal: (open: boolean) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
    plan: 'free',
    status: 'inactive',
    isActive: false,
    loading: true,
    can: () => false,
    checkFeature: () => false,
    refresh: async () => { },
    isUpgradeModalOpen: false,
    showUpgradeModal: () => { },
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [plan, setPlan] = useState<PlanLevel>('free');
    const [status, setStatus] = useState<string>('inactive');
    const [loading, setLoading] = useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/billing/status');
            if (!res.ok) return;
            const data = await res.json();
            setPlan((data.plan || 'free') as PlanLevel);
            setStatus(data.status || 'inactive');
        } catch {
            setPlan('free');
            setStatus('inactive');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStatus(); }, []);

    const isActive = status === 'active' || status === 'trialing';

    const can = (feature: FeatureKey) => {
        return canUseFeature(plan, feature);
    };

    const checkFeature = (feature: FeatureKey) => {
        const allowed = can(feature);
        if (!allowed) setIsUpgradeModalOpen(true);
        return allowed;
    };

    return (
        <SubscriptionContext.Provider value={{
            plan,
            status,
            isActive,
            loading,
            can,
            checkFeature,
            refresh: fetchStatus,
            isUpgradeModalOpen,
            showUpgradeModal: setIsUpgradeModalOpen
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export const useSubscription = () => useContext(SubscriptionContext);
