'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function SignIn() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signInWithGoogle, signInWithDev, user, signOut } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        setIsDev(window.location.hostname === 'localhost');

        const params = new URLSearchParams(window.location.search);
        if (params.get('logged_out') === '1') {
            // Force clear storage
            localStorage.clear();
            sessionStorage.clear();
            return;
        }

        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container max-w-md relative z-10 px-4">
                <div className="card backdrop-blur-xl border-white/10 p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Bem-vindo de Volta</h1>
                        <p className="text-gray-400">Continue construindo seu império.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Endereço de E-mail</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="voce@exemplo.com"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-300">Senha</label>
                                <a href="#" className="text-xs text-primary hover:text-primary-hover">Esqueceu a senha?</a>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full btn btn-primary py-3 mt-4 ${loading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Entrando...
                                </span>
                            ) : (
                                'Entrar com E-mail'
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-[1px] bg-white/10 flex-grow"></div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Ou</div>
                        <div className="h-[1px] bg-white/10 flex-grow"></div>
                    </div>

                    <button
                        onClick={async () => {
                            const { error } = await signInWithGoogle();
                            if (error) setError(error.message);
                        }}
                        type="button"
                        className="w-full btn bg-white text-black hover:bg-gray-200 border border-gray-200 flex items-center gap-3 py-3 justify-center"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continuar com Google
                    </button>

                    <button
                        onClick={signInWithDev}
                        type="button"
                        className="w-full mt-3 btn bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 flex items-center gap-3 py-3 justify-center font-bold"
                    >
                        🛠️ Login Dev (Bypass)
                    </button>

                    {isDev && (
                        <button
                            onClick={async () => {
                                const { logout } = await import('@/lib/auth/logout');
                                await logout();
                            }}
                            type="button"
                            className="w-full mt-3 text-xs text-red-500/50 hover:text-red-500 transition-colors uppercase font-black tracking-widest"
                        >
                            [Dev] Force Logout (Clear All)
                        </button>
                    )}

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Não tem uma conta?{' '}
                        <Link href="/signup" className="text-primary font-bold hover:underline">
                            Iniciar Teste Grátis
                        </Link>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Voltar ao Início</Link>
                </div>
            </div>
        </div>
    );
}
