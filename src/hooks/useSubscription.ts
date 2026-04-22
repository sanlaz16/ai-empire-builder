'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { canUseFeature, FeatureKey, PlanLevel } from '@/lib/planGate';

export function useSubscription() {
    const [plan, setPlan] = useState<PlanLevel>('free');
    const [status, setStatus] = useState<string>('inactive');
    const [loading, setLoading] = useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    useEffect(() => {
        async function loadSubscription() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setLoading(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan_id, subscription_status')
                    .eq('user_id', user.id)
                    .single();

                if (profile) {
                    setPlan((profile.plan_id || 'free') as PlanLevel);
                    setStatus(profile.subscription_status || 'inactive');
                }
            } catch (error) {
                console.error('Error loading subscription:', error);
            } finally {
                setLoading(false);
            }
        }

        loadSubscription();

        // Optional: Listen for profile changes
        const channel = supabase
            .channel('profile_changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles'
            }, (payload: any) => {
                const { new: newProfile } = payload;
                if (newProfile.plan_id) setPlan(newProfile.plan_id as PlanLevel);
                if (newProfile.subscription_status) setStatus(newProfile.subscription_status);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const checkFeature = (feature: FeatureKey) => {
        const allowed = canUseFeature(plan, feature);
        if (!allowed) {
            setIsUpgradeModalOpen(true);
        }
        return allowed;
    };

    return {
        plan,
        status,
        loading,
        isActive: status === 'active' || status === 'trialing',
        can: (feature: FeatureKey) => canUseFeature(plan, feature),
        checkFeature,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen
    };
}
