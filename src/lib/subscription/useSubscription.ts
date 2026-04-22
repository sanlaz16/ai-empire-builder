'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { canUseFeature, FeatureKey } from '@/lib/planGate';

export type PlanLevel = 'free' | 'pro' | 'enterprise' | 'elite';

export function useSubscription() {
    const [plan, setPlan] = useState<PlanLevel>('free');
    const [loading, setLoading] = useState(true);
    const supabaseClient = supabase;

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan, plan_id')
                    .eq('user_id', user.id)
                    .single();

                if (profile) {
                    const activePlan = (profile.plan || profile.plan_id || 'free').toLowerCase() as PlanLevel;
                    setPlan(activePlan);
                }
            }
            setLoading(false);
        };

        getProfile();

        // Optional: Realtime sync
        const channel = supabase
            .channel('profile_changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'profiles' },
                (payload: any) => {
                    if (payload.new && payload.new.plan) {
                        setPlan(payload.new.plan.toLowerCase() as PlanLevel);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const can = (feature: FeatureKey) => canUseFeature(plan, feature);

    return {
        plan,
        isPro: plan === 'pro' || plan === 'elite' || plan === 'enterprise',
        isEnterprise: plan === 'enterprise' || plan === 'elite',
        can,
        loading
    };
}
