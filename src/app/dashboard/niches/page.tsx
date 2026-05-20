'use client';

import { Plus, MoreHorizontal, Layers, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MyNiches() {
    const [niches, setNiches] = useState<any[]>([]);

    useEffect(() => {
        // Load niches from localStorage or use defaults
        const storedNiches = localStorage.getItem('empire_niches');
        if (storedNiches) {
            setNiches(JSON.parse(storedNiches));
        } else {
            const defaults = [
                {
                    id: 1,
                    name: 'Acessórios Pet Cyberpunk',
                    audience: 'Donos de pets antenados em tecnologia',
                    date: '24 out. 2024',
                    status: 'Ativo',
                    statusColor: 'text-green-400 bg-green-500/10 border-green-500/20'
                },
                {
                    id: 2,
                    name: 'Tapetes de Yoga Ecológicos',
                    audience: 'Mulheres 25-40, foco em sustentabilidade',
                    date: '02 dez. 2024',
                    status: 'Rascunho',
                    statusColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                },
                {
                    id: 3,
                    name: 'Setups Minimalistas de Mesa',
                    audience: 'Trabalhadores remotos, Desenvolvedores',
                    date: '06 dez. 2024',
                    status: 'Analisando',
                    statusColor: 'text-primary bg-primary/10 border-primary/20 animate-pulse'
                }
            ];
            setNiches(defaults);
            localStorage.setItem('empire_niches', JSON.stringify(defaults));
        }
    }, []);

    const handleAddNiche = () => {
        alert("Use o Criador de Loja com IA para criar um novo nicho. Em versões futuras você poderá salvar e editar nichos aqui.");
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <span className="bg-primary/20 p-2 rounded-lg text-primary">
                            <Layers className="w-6 h-6" />
                        </span>
                        Meus Nichos
                    </h1>
                    <p className="text-gray-400">Gerencie seus segmentos de mercado gerados e conceitos de loja.</p>
                </div>

                <button
                    onClick={handleAddNiche}
                    className="btn btn-primary px-6 py-3 flex items-center gap-2 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Adicionar Novo Nicho</span>
                </button>
            </div>

            <div className="grid gap-6">
                {niches.map((niche) => (
                    <div key={niche.id} className="glass-card hover:border-primary/30 transition-all p-0 overflow-hidden group">
                        <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">

                            {/* Icon / Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                <Layers className="w-6 h-6" />
                            </div>

                            {/* Info */}
                            <div className="flex-grow space-y-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{niche.name}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                                    {niche.audience}
                                </p>
                            </div>

                            {/* Meta Data */}
                            <div className="flex items-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {niche.date}
                                </div>

                                <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-2 ${niche.statusColor}`}>
                                    {niche.status === 'Ativo' && <CheckCircle2 className="w-3 h-3" />}
                                    {niche.status}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State / Upsell */}
            <div className="mt-8 border border-dashed border-white/10 rounded-2xl p-12 text-center bg-white/[0.01]">
                <p className="text-gray-500 mb-4">Quer dominar mais mercados?</p>
                <div className="inline-flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider cursor-pointer hover:underline">
                    Gerar Próximo Nicho <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
