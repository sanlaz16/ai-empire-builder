'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type PageState = 'loading' | 'ready' | 'success' | 'error';

export default function ResetPassword() {
    const router = useRouter();
    const [pageState, setPageState] = useState<PageState>('loading');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Supabase sends the recovery token as a hash fragment:
        // /reset-password#access_token=...&type=recovery
        // We listen for the PASSWORD_RECOVERY event which fires automatically
        // when the page loads with that hash present.
        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setPageState('ready');
            }
        });

        // Fallback: if the page is loaded without a valid token the event
        // never fires. Give it 3 s then show an error.
        const timeout = setTimeout(() => {
            setPageState((prev) => {
                if (prev === 'loading') return 'error';
                return prev;
            });
        }, 3000);

        return () => {
            listener.subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('As senhas não coincidem.');
            return;
        }

        setSubmitting(true);
        const { error } = await supabase.auth.updateUser({ password });
        setSubmitting(false);

        if (error) {
            setError(error.message);
        } else {
            setPageState('success');
            setTimeout(() => router.push('/dashboard'), 2500);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container max-w-md relative z-10 px-4">
                <div className="card backdrop-blur-xl border-white/10 p-8 shadow-2xl">

                    {/* ── Loading ── */}
                    {pageState === 'loading' && (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Validando link de redefinição...</p>
                        </div>
                    )}

                    {/* ── Invalid / expired token ── */}
                    {pageState === 'error' && (
                        <div className="text-center py-4">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold mb-2">Link Inválido ou Expirado</h1>
                            <p className="text-gray-400 mb-6">
                                Este link de redefinição de senha não é mais válido. Solicite um novo link na página de login.
                            </p>
                            <Link
                                href="/signin"
                                className="btn btn-primary py-3 px-6 inline-block"
                            >
                                Voltar ao Login
                            </Link>
                        </div>
                    )}

                    {/* ── Reset form ── */}
                    {pageState === 'ready' && (
                        <>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2">Nova Senha</h1>
                                <p className="text-gray-400">Escolha uma senha forte para sua conta.</p>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Confirmar Nova Senha
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full btn btn-primary py-3 mt-4 ${submitting ? 'opacity-80 cursor-wait' : ''}`}
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Salvando...
                                        </span>
                                    ) : (
                                        'Salvar Nova Senha'
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ── Success ── */}
                    {pageState === 'success' && (
                        <div className="text-center py-4">
                            <div className="text-5xl mb-4">✅</div>
                            <h1 className="text-2xl font-bold mb-2">Senha Atualizada!</h1>
                            <p className="text-gray-400">
                                Sua senha foi redefinida com sucesso. Redirecionando para o painel...
                            </p>
                            <div className="mt-6">
                                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/signin" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
                            ← Voltar ao Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
