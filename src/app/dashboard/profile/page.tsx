'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    User,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Share2,
    Copy,
    Mail,
    Phone,
    MapPin,
    Shield,
    Lock,
    Save,
    DollarSign,
    Zap,
    LogOut,
    Bell
} from 'lucide-react';

interface Profile {
    name: string;
    phone_br: string;
    address_line: string;
    city: string;
    state: string;
    postal_code: string;
    company_name?: string;
    referral_code: string;
    referred_by: string | null;
    twofa_enabled: boolean;
    default_cost_percentage?: string | number;
    default_shipping_cost?: string | number;
    fee_percentage?: string | number;
    fee_fixed?: string | number;
    push_enabled: boolean;
}

const BR_STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export default function ProfilePage() {
    const sub = useSubscription();
    const { signOut } = useAuth();
    const [profile, setProfile] = useState<Profile>({
        name: '',
        phone_br: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        company_name: '',
        referral_code: '',
        referred_by: null,
        twofa_enabled: false,
        default_cost_percentage: 40.0,
        default_shipping_cost: 0.0,
        fee_percentage: 3.0,
        fee_fixed: 0.30,
        push_enabled: true,
    });
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            if (data.profile) {
                setProfile({
                    name: data.profile.name || '',
                    phone_br: data.profile.phone_br || '',
                    address_line: data.profile.address_line || '',
                    city: data.profile.city || '',
                    state: data.profile.state || '',
                    postal_code: data.profile.postal_code || '',
                    company_name: data.profile.company_name || '',
                    referral_code: data.profile.referral_code || '',
                    referred_by: data.profile.referred_by || null,
                    twofa_enabled: data.profile.twofa_enabled || false,
                    default_cost_percentage: data.profile.default_cost_percentage ?? 40.0,
                    default_shipping_cost: data.profile.default_shipping_cost ?? 0.0,
                    fee_percentage: data.profile.fee_percentage ?? 3.0,
                    fee_fixed: data.profile.fee_fixed ?? 0.30,
                    push_enabled: data.profile.push_enabled ?? true,
                });
            }
            setEmail(data.email || '');
        } catch (e) {
            setError('Falha ao carregar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Erro ao salvar.');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const referralLink = profile.referral_code
        ? `${typeof window !== 'undefined' ? window.location.origin : 'https://empirebuilder.ai'}/signup?ref=${profile.referral_code}`
        : '';

    const handleCopyLink = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const field = (
        label: string,
        key: keyof Profile,
        opts: { type?: string; placeholder?: string; icon?: React.ReactNode } = {}
    ) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                {opts.icon} {label}
            </label>
            <input
                type={opts.type || 'text'}
                value={profile[key] as string}
                onChange={(e) => setProfile(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={opts.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
            />
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 max-w-3xl mx-auto flex items-center justify-center min-h-[60vh]">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            {/* HEADER */}
            <div className="mb-10">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4 mb-2">
                    <User className="w-9 h-9 text-primary" /> Meu Perfil
                </h1>
                <p className="text-gray-500 font-bold">Gerencie suas informações e código de indicação.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Perfil salvo com sucesso!
                </div>
            )}

            {/* SUBSCRIPTION CARD */}
            <div className="glass-card p-8 mb-8 border-primary/20 bg-primary/[0.03] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3">Plano Atual</div>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${sub.plan === 'elite' ? 'text-purple-400' : 'text-primary'}`}>
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {sub.plan.toUpperCase()}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        {sub.status === 'trialing' ? 'Período de Teste' : sub.isActive ? 'Assinatura Ativa' : 'Inativo / Pendente'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {sub.plan === 'free' ? (
                            <Link
                                href="/dashboard/pricing"
                                className="px-8 py-3 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-xs hover:scale-105 transition-all text-center shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                            >
                                Upgrade Agora
                            </Link>
                        ) : (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/billing/portal');
                                        const data = await res.json();
                                        if (data.url) window.location.href = data.url;
                                        else alert(data.error || 'Erro ao acessar portal');
                                    } catch (e) {
                                        console.error('Portal error', e);
                                    }
                                }}
                                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all text-center"
                            >
                                Gerenciar Assinatura
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* REFERRAL CARD */}
            {profile.referral_code && (
                <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-8 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1 text-primary">
                            <Share2 className="w-5 h-5" />
                            <span className="font-black text-sm uppercase tracking-widest">Seu Código de Indicação</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl font-black text-white tracking-widest">{profile.referral_code}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold mb-4 truncate">{referralLink}</p>
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${copied
                                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                : 'bg-primary text-black hover:scale-[1.02]'
                                }`}
                        >
                            {copied ? <><CheckCircle2 className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Link</>}
                        </button>
                    </div>
                </div>
            )}

            {/* PROFILE FORM */}
            <form onSubmit={handleSave} className="space-y-6">
                {/* Account Info */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <User className="w-4 h-4 text-primary" /> Informações da Conta
                    </h2>

                    {field('Nome Completo', 'name', { placeholder: 'João Silva', icon: <User className="w-3 h-3 text-gray-600" /> })}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-gray-600" /> E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            readOnly
                            className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-3 text-gray-500 text-sm cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-700 mt-1">E-mail não pode ser alterado aqui.</p>
                    </div>

                    {field('Telefone', 'phone_br', { type: 'tel', placeholder: '+55 11 99999-9999', icon: <Phone className="w-3 h-3 text-gray-600" /> })}
                </div>

                {/* Address */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-primary" /> Endereço
                    </h2>

                    {field('Endereço', 'address_line', { placeholder: 'Rua das Flores, 123' })}

                    <div className="grid grid-cols-2 gap-4">
                        {field('Cidade', 'city', { placeholder: 'São Paulo' })}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Estado</label>
                            <select
                                value={profile.state}
                                onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-all text-sm"
                            >
                                <option value="">UF</option>
                                {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    {field('CEP', 'postal_code', { placeholder: '00000-000' })}

                    {/* Row 4 */}
                    {field('Empresa (Opcional)', 'company_name', { placeholder: 'Minha Loja' })}
                </div>

                {/* Margins & Sourcing Defaults */}
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                        <DollarSign className="w-4 h-4 text-primary" /> Configurações de Lucro e Custo (Padrão)
                    </h2>
                    <p className="text-xs text-gray-500 font-bold mb-4">
                        Usado para calcular a margem de lucro sugerida ao importar produtos via DSers ou quando o custo não é informado pela Shopify.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                Custo Estimado (%)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={profile.default_cost_percentage}
                                onChange={(e) => setProfile(prev => ({ ...prev, default_cost_percentage: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                placeholder="Ex: 40"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">% sobre o preço de venda</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                Frete Padrão (R$)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={profile.default_shipping_cost}
                                onChange={(e) => setProfile(prev => ({ ...prev, default_shipping_cost: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                placeholder="Ex: 15.00"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Custo fixo de envio</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                Taxa Cartão (%)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={profile.fee_percentage}
                                onChange={(e) => setProfile(prev => ({ ...prev, fee_percentage: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                placeholder="Ex: 3.0"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Ex: Stripe, Pagar.me</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                Taxa Fixa por Pedido (R$)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={profile.fee_fixed}
                                onChange={(e) => setProfile(prev => ({ ...prev, fee_fixed: parseFloat(e.target.value) }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                placeholder="Ex: 0.30"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Tarifa fixa do gateway</p>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="glass-card p-6 space-y-6">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" /> Segurança e Acesso
                    </h2>

                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" /> Autenticação de 2 Fatores (2FA)
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                Proteja sua conta com um código de segurança enviado por E-mail.
                            </p>
                        </div>
                        <button
                            onClick={() => setProfile(prev => ({ ...prev, twofa_enabled: !prev.twofa_enabled }))}
                            className={`w-12 h-6 rounded-full transition-all relative ${profile.twofa_enabled ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.twofa_enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mt-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <Bell className="w-4 h-4 text-primary" /> Notificações Push
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                Receba alertas em tempo real sobre tendências e novos produtos.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setProfile(prev => ({ ...prev, push_enabled: !prev.push_enabled }))}
                            className={`w-12 h-6 rounded-full transition-all relative ${profile.push_enabled ? 'bg-primary' : 'bg-white/10'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profile.push_enabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Seu Código de Indicação
                            </h3>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(profile.referral_code);
                                    setSuccess(true);
                                    setTimeout(() => setSuccess(false), 3000);
                                }}
                                className="text-[10px] font-black text-white uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition-all"
                            >
                                Copiar
                            </button>
                        </div>
                        <div className="text-2xl font-black text-white tracking-[0.2em] font-mono">
                            {profile.referral_code || 'EMPIRE-XXXX'}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">
                            Compartilhe este código e ganhe créditos quando seus amigos assinarem.
                        </p>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="glass-card p-6 border-red-500/10 bg-red-500/[0.02]">
                    <h2 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Zona de Perigo</h2>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Sair da Conta (Logout)
                    </button>
                </div>

                {/* Save */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 rounded-2xl bg-primary text-black font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                >
                    {saving
                        ? <><RefreshCw className="w-5 h-5 animate-spin" /> Salvando...</>
                        : <><Save className="w-5 h-5" /> Salvar Perfil</>
                    }
                </button>
            </form>
        </div>
    );
}
