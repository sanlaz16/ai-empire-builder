'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import Cookies from 'js-cookie';

export default function DevResetButton() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show on localhost
        if (window.location.hostname === 'localhost') {
            setIsVisible(true);
        }
    }, []);

    const handleReset = async () => {
        if (!confirm('DEBUG: Deseja limpar todos os cookies e localStorage? Isso force o logout total.')) return;

        // 1. Clear Cookies
        const allCookies = Cookies.get();
        for (const cookie in allCookies) {
            Cookies.remove(cookie);
        }

        // 2. Clear Storage
        localStorage.clear();
        sessionStorage.clear();

        // 3. Force Refresh
        window.location.href = '/signin?logged_out=1';
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleReset}
            className="fixed bottom-4 right-4 z-[9999] bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-500 p-3 rounded-full shadow-lg transition-all flex items-center gap-2 group"
            title="Dev Reset Session"
        >
            <Trash2 className="w-4 h-4" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                Reset Session
            </span>
        </button>
    );
}
