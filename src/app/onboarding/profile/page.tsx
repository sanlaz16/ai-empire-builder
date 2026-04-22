'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, MapPin, Building, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingProfile() {
    const router = useRouter();
    const { user } = useAuth();

    // UI States
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form Fields
    const [formData, setFormData] = useState({
        full_name: '',
        phone_br: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        company_name: ''
    });

    // Auto-fill full_name from Auth metadata if available
    useEffect(() => {
        if (user && user.user_metadata?.full_name && !formData.full_name) {
            setFormData(prev => ({ ...prev, full_name: user.user_metadata.full_name }));
        }
    }, [user]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateStep1 = () => {
        if (!formData.full_name || formData.full_name.trim().length < 3) return "Nome completo é obrigatório.";
        if (!formData.phone_br || formData.phone_br.trim().length < 10) return "Telefone válido é obrigatório.";
        return null;
    };

    const validateStep2 = () => {
        if (!formData.postal_code || formData.postal_code.trim().length < 8) return "CEP é obrigatório.";
        if (!formData.address_line || formData.address_line.trim().length < 5) return "Endereço é obrigatório.";
        if (!formData.city || formData.city.trim().length < 2) return "Cidade é obrigatória.";
        if (!formData.state || formData.state.trim().length < 2) return "Estado é obrigatório.";
        return null;
    };

    const handleNext = () => {
        const err = step === 1 ? validateStep1() : null;
        if (err) {
            setError(err);
            return;
        }
        setStep(2);
    };

    const handleComplete = async () => {
        const err = validateStep2();
        if (err) {
            setError(err);
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                // Force a hard navigation to dashboard to re-run middleware
                window.location.href = '/dashboard';
            } else {
                setError(data.error || 'Erro ao salvar perfil. Tente novamente.');
                setSaving(false);
            }

        } catch (e: any) {
            setError('Erro de conexão. Verifique sua internet.');
            setSaving(false);
        }
    };

    const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">

                <div className="flex justify-center mb-8">
                    <img src="/logo.svg" alt="Empire" className="h-10 opacity-90" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Completar Perfil</h1>
                    <p className="text-gray-400 font-bold text-sm">
                        Precisamos de alguns detalhes básicos para configurar sua conta antes de acessar o Dashboard.
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-2 mb-8">
                    <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
                    <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold text-center mb-6 animate-fade-in-up">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => handleChange('full_name', e.target.value)}
                                className={inputClasses}
                                placeholder="João Silva"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">WhatsApp / Telefone</label>
                            <input
                                type="text"
                                value={formData.phone_br}
                                onChange={(e) => handleChange('phone_br', e.target.value)}
                                className={inputClasses}
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                                Empresa <span className="text-[10px] text-gray-600">(Opcional)</span>
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={formData.company_name}
                                    onChange={(e) => handleChange('company_name', e.target.value)}
                                    className={`${inputClasses} pl-10`}
                                    placeholder="Minha Loja LLC"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full mt-6 bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            Próximo Passo <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">CEP</label>
                            <input
                                type="text"
                                value={formData.postal_code}
                                onChange={(e) => handleChange('postal_code', e.target.value)}
                                className={inputClasses}
                                placeholder="00000-000"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Endereço Completo</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={formData.address_line}
                                    onChange={(e) => handleChange('address_line', e.target.value)}
                                    className={`${inputClasses} pl-10`}
                                    placeholder="Rua Exemplo, 123 - Apto 4"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cidade</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleChange('city', e.target.value)}
                                    className={inputClasses}
                                    placeholder="São Paulo"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Estado</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => handleChange('state', e.target.value)}
                                    className={inputClasses}
                                    placeholder="SP"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={saving}
                                className="flex-1 bg-primary text-black py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? 'Salvando...' : 'Finalizar Cadastro'}
                                {!saving && <CheckCircle2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-gray-600 font-bold">
                    <Shield className="w-3 h-3" />
                    Seus dados estão protegidos e criptografados.
                </div>
            </div>
        </div>
    );
}
