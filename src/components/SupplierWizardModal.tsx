'use client';

import { useState } from 'react';
import {
    X, ArrowRight, CheckCircle2, ShoppingBag, Store,
    RefreshCw, DollarSign, ExternalLink
} from 'lucide-react';

interface SupplierWizardModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplierName: 'DSers' | 'CJ' | 'Temu';
    onRescan: () => Promise<void>;
}

export default function SupplierWizardModal({ isOpen, onClose, supplierName, onRescan }: SupplierWizardModalProps) {
    const [step, setStep] = useState(1);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);

    if (!isOpen) return null;

    const handleRescan = async () => {
        setIsScanning(true);
        try {
            await onRescan();
            setScanComplete(true);
            setTimeout(() => setStep(4), 1500);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const getSupplierUrl = () => {
        switch (supplierName) {
            case 'DSers': return 'https://admin.shopify.com/apps/dsers';
            case 'CJ': return 'https://admin.shopify.com/apps/cjdropshipping';
            case 'Temu': return 'https://admin.shopify.com/apps/dsers'; // Using DSers for Temu MVP
            default: return 'https://admin.shopify.com';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                {/* Header */}
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 md:p-12">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Conectar {supplierName}
                    </h2>
                    <p className="text-gray-400 font-bold mb-8">
                        Siga os passos abaixo para importar produtos e calcular suas margens de lucro automaticamente.
                    </p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-white/10'}`} />
                        ))}
                    </div>

                    {/* Step 1: Install App */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                                    <Store className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">1. Instale o App</h3>
                                <p className="text-gray-400 font-bold text-sm mb-6">
                                    Abra a loja da Shopify e certifique-se de que o aplicativo {supplierName} está instalado.
                                </p>
                                <a
                                    href={getSupplierUrl()}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                                    onClick={() => setTimeout(() => setStep(2), 1000)}
                                >
                                    Abrir {supplierName} <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Import Products */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">2. Importe Produtos</h3>
                                <p className="text-gray-400 font-bold text-sm mb-6">
                                    Use o {supplierName} para encontrar produtos e enviá-los para sua loja Shopify (Push to Store).
                                    Quando terminar as importações, avance.
                                </p>
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full py-4 bg-primary text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                                >
                                    Já Importei os Produtos <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Rescan */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                    {scanComplete ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    ) : (
                                        <RefreshCw className={`w-8 h-8 ${isScanning ? 'animate-spin' : ''}`} />
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                                    {scanComplete ? 'Sincronização Concluída!' : '3. Sincronizar Loja'}
                                </h3>
                                <p className="text-gray-400 font-bold text-sm mb-8">
                                    {scanComplete
                                        ? 'Seus produtos foram encontrados e as margens foram calculadas.'
                                        : 'Vamos escanear sua loja Shopify para encontrar os novos produtos importados.'
                                    }
                                </p>
                                <button
                                    onClick={handleRescan}
                                    disabled={isScanning || scanComplete}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${scanComplete ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                            'bg-primary text-black hover:scale-[1.02]'
                                        }`}
                                >
                                    {isScanning ? 'Sincronizando...' : scanComplete ? 'Concluído' : 'Sincronizar Agora'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Cost Configuration */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">4. Ajuste seus Custos</h3>
                                <p className="text-gray-400 font-bold text-sm mb-6">
                                    Muitos produtos importados não trazem o custo exato do fornecedor. Você pode definir regras padrão (ex: Custo é 40% da Venda) no seu Perfil para que nosso simulador de lucros seja hiper realista.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={onClose}
                                        className="py-4 bg-white/5 text-white hover:bg-white/10 rounded-xl font-black uppercase tracking-widest transition-colors"
                                    >
                                        Fechar
                                    </button>
                                    <a
                                        href="/dashboard/profile"
                                        className="py-4 bg-primary text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform text-center"
                                    >
                                        Configurar Lucros
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
