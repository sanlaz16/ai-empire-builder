'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
            <div className="max-w-sm w-full text-center">
                <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Erro no Painel</h2>
                <p className="text-gray-500 font-bold text-sm mb-6">
                    {error.message || 'Falha ao carregar esta seção.'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Tentar Novamente
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
