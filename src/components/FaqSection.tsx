'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const FAQS = [
    { 
        q: 'O que é o EmpireBuilder IA?', 
        a: 'O EmpireBuilder IA é uma plataforma que ajuda você a criar e crescer uma loja de e-commerce usando inteligência artificial.' 
    },
    { 
        q: 'Preciso de experiência com e-commerce?', 
        a: 'Não. A plataforma é desenvolvida para iniciantes e te orienta durante todo o processo.' 
    },
    { 
        q: 'Preciso saber programar?', 
        a: 'Nenhum conhecimento de código é necessário para usar o EmpireBuilder IA.' 
    },
    { 
        q: 'Como os produtos vão parar na minha loja?', 
        a: 'Você conecta sua plataforma de e-commerce e importa os produtos, e o EmpireBuilder te ajuda a otimizar e gerenciá-los.' 
    },
    { 
        q: 'Vocês oferecem teste grátis?', 
        a: 'Sim. Você pode começar com um teste gratuito antes de assinar.' 
    },
    { 
        q: 'Posso usar no celular?', 
        a: 'Sim. A plataforma funciona em navegadores móveis, e aplicativos para celular estão planejados após o beta.' 
    },
    { 
        q: 'O pagamento é seguro?', 
        a: 'Sim. Os pagamentos são processados através de provedores seguros como Stripe e Pagar.me.' 
    },
    { 
        q: 'Isso é apenas para dropshipping?', 
        a: 'Não. É construído para criação e otimização de e-commerce em geral, sendo especialmente útil para iniciantes e negócios de produtos físicos.' 
    },
];

export function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-24 bg-[#020202] relative" id="faq">
            <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                        <MessageCircleQuestion className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter sm:text-5xl mb-4 uppercase">
                        Perguntas Frequentes
                    </h2>
                    <p className="text-gray-500 font-bold">
                        Tudo que você precisa saber sobre o produto e faturamento.
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div 
                                key={index} 
                                className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-primary/50 bg-primary/[0.02]' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-white transition-colors"
                                    aria-expanded={isOpen}
                                >
                                    <span className="pr-4">{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                                </button>
                                <div 
                                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                >
                                    <div className="px-6 pb-6 pt-2 text-gray-400 font-bold text-sm leading-relaxed border-t border-white/5">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
