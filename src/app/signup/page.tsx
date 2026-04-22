'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Check, AlertCircle, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export default function SignUp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const referralCode = searchParams.get('ref') || searchParams.get('referral') || '';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showOptional, setShowOptional] = useState(false);
    const { signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPwd = formData.get('confirm_password') as string;
        const name = formData.get('full_name') as string;
        const phone_br = formData.get('phone_br') as string;
        const address_line = formData.get('address_line') as string;
        const city = formData.get('city') as string;
        const state = formData.get('state') as string;
        const postal_code = formData.get('postal_code') as string;
        const enable2fa = formData.get('enable_2fa') === 'on';

        if (password !== confirmPwd) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            // 1. Sign up with Supabase Auth
            // We pass all profile data in metadata so the DB trigger can handle it atomically
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        phone_br: phone_br || null,
                        address_line: address_line || null,
                        city: city || null,
                        state: state || null,
                        postal_code: postal_code || null,
                        country: 'Brasil', // Default
                        referred_by: referralCode || null
                    }
                },
            });

            if (signUpError) throw signUpError;

            if (data.session) {
                router.push('/onboarding');
            } else {
                setSuccessMessage('Conta criada! Verifique seu e-mail para ativar a conta.');
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.message || 'Falha ao criar conta.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="container max-w-lg relative z-10 px-4">
                <div className="card backdrop-blur-xl border-white/10 p-8 shadow-2xl">

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black mb-2">Comece Seu Império</h1>
                        <p className="text-gray-400">7 Dias Grátis. Sem Cartão de Crédito.</p>
                        {referralCode && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary text-sm font-bold">
                                <Check className="w-4 h-4" /> Código de indicação: <span className="font-black">{referralCode}</span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                            <Check className="w-4 h-4 shrink-0" /> {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* REQUIRED FIELDS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nome Completo *</label>
                            <input name="full_name" type="text" required
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="João Silva" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">E-mail *</label>
                            <input name="email" type="email" required
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                placeholder="voce@exemplo.com" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Senha *</label>
                                <input name="password" type="password" required minLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="••••••••" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar *</label>
                                <input name="confirm_password" type="password" required minLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="••••••••" />
                            </div>
                        </div>

                        {/* OPTIONAL FIELDS TOGGLE */}
                        <button
                            type="button"
                            onClick={() => setShowOptional(v => !v)}
                            className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-300 transition-colors py-1 border-t border-white/5 pt-3"
                        >
                            <span className="font-bold">Informações Opcionais (Endereço, Telefone)</span>
                            {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showOptional && (
                            <div className="space-y-3 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                                    <input name="phone_br" type="tel"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="+55 11 99999-9999" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
                                    <input name="address_line" type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="Rua das Flores, 123" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                                        <input name="city" type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                            placeholder="São Paulo" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                                        <select name="state"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all">
                                            <option value="">UF</option>
                                            {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">CEP</label>
                                    <input name="postal_code" type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                        placeholder="00000-000" maxLength={9} />
                                </div>
                            </div>
                        )}

                        {/* 2FA TOGGLE */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                            <input id="enable_2fa" name="enable_2fa" type="checkbox"
                                className="mt-0.5 accent-green-500 w-4 h-4 cursor-pointer" />
                            <label htmlFor="enable_2fa" className="text-sm text-gray-300 cursor-pointer">
                                <span className="font-bold flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-primary" /> Ativar Autenticação 2FA
                                </span>
                                <span className="text-gray-500 text-xs mt-0.5 block">Adiciona uma camada extra de segurança. (SMS em breve)</span>
                            </label>
                        </div>

                        {/* TRUST BADGES */}
                        <div className="text-sm text-gray-500 py-1 flex flex-col gap-1">
                            <div className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /><span>7 dias grátis no Plano Básico</span></div>
                            <div className="flex items-center gap-2"><Check className="w-3 h-3 text-green-500" /><span>Cancele quando quiser</span></div>
                        </div>

                        <button type="submit" disabled={loading}
                            className={`w-full btn btn-primary py-3 mt-2 ${loading ? 'opacity-80 cursor-wait' : ''}`}>
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                                    Criando Conta...
                                </span>
                            ) : 'Criar Conta'}
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
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuar com Google
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-400">
                        Já tem uma conta?{' '}
                        <Link href="/signin" className="text-primary font-bold hover:underline">Entrar</Link>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Voltar ao Início</Link>
                </div>
            </div>
        </div>
    );
}
