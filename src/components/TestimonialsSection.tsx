'use client';

import { Star } from 'lucide-react';

const TESTIMONIALS = [
    { 
        name: 'Usuário inicial', 
        text: 'Me ajudou a entender como montar minha loja muito mais rápido do que tudo que já tentei.' 
    },
    { 
        name: 'Testador beta', 
        text: 'É simples de usar e tira muita dúvida de quem está começando.' 
    },
    { 
        name: 'Primeiro usuário', 
        text: 'Parece que você tem alguém te guiando enquanto monta sua loja.' 
    },
];

export function TestimonialsSection() {
    return (
        <section className="py-24 bg-white/[0.01] border-y border-white/5 relative overflow-hidden" id="testimonials">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl mb-4 uppercase">
                        Usuários já estão testando
                    </h2>
                    <p className="text-gray-500 font-bold text-lg">
                        Junte-se aos primeiros usuários construindo suas lojas com IA.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.1)] group flex flex-col h-full">
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, j) => (
                                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                                ))}
                            </div>
                            <p className="text-gray-300 font-bold mb-8 leading-relaxed flex-grow">"{t.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 text-primary font-black uppercase">
                                    {t.name.charAt(0)}
                                </div>
                                <div className="text-white font-black text-sm">{t.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
