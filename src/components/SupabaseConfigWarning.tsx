'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SupabaseConfigWarning() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if env vars are missing
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Basic check for placeholder or empty
        if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
            setIsVisible(true);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-yellow-500 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Supabase Not Configured - Data will not persist</span>
            </div>
        </div>
    );
}
