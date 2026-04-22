import Link from 'next/link';
import { Ghost, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
            <div className="max-w-md w-full text-center flex flex-col items-center">
                <div className="h-24 w-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative">
                    <Ghost className="w-12 h-12 text-gray-400 animate-bounce" />
                    <div className="absolute inset-0 blur-2xl bg-white/5 rounded-full" />
                </div>

                <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-4">
                    404
                </h1>
                <h2 className="text-xl font-black text-primary uppercase tracking-widest mb-4">
                    Página Quântica
                </h2>
                <p className="text-gray-500 font-bold mb-8">
                    Esta página pode existir em outro universo, mas não neste.
                </p>

                <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all hover:scale-[1.02]"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar para o Dashboard
                </Link>
            </div>
        </div>
    );
}
