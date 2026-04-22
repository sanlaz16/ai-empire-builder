'use client';

import { useRouter } from 'next/navigation';

export function useUpgrade() {
    const router = useRouter();

    const openUpgrade = () => {
        router.push('/dashboard/pricing');
    };

    return { openUpgrade };
}
