'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // In production, send to error tracking (Sentry, etc.)
        // Only log in dev (next.config.js strips console.log in prod)
        console.error('[EmpireBuilder Error]', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center">
                <div className="relative mb-8 inline-block">
                    <div className="h-24 w-24 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>
                    <div className="absolute inset-0 blur-2xl bg-red-500/10 rounded-full" />
                </div>

                <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">
                    Algo deu errado
                </h1>
                <p className="text-gray-500 font-bold mb-2">
                    {error.message || 'Ocorreu um erro inesperado.'}
                </p>
                {error.digest && (
                    <p className="text-gray-700 text-xs font-mono mb-8">
                        ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all"
                    >
                        <RefreshCw className="w-4 h-4" /> Tentar Novamente
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all justify-center"
                    >
                        <Home className="w-4 h-4" /> Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
