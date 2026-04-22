import { createClient } from '@/lib/supabase/server';
import { canUseFeature, FeatureKey, PlanLevel } from '@/lib/planGate';
import { NextResponse } from 'next/server';

export async function verifyPlan(feature?: FeatureKey) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized', status: 401 };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, plan_id')
        .eq('user_id', user.id)
        .single();

    const plan = (profile?.plan || profile?.plan_id || 'free').toLowerCase() as PlanLevel;

    if (feature && !canUseFeature(plan, feature)) {
        return {
            error: `Upgrade required for feature: ${feature}. Your current plan is ${plan.toUpperCase()}.`,
            status: 403,
            plan
        };
    }

    return { user, plan };
}

export function planErrorResponse(result: { error: string, status: number }) {
    return NextResponse.json({ error: result.error }, { status: result.status });
}
