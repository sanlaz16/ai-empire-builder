'use client';

import { useState } from 'react';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const FAQS = [
    { 
        q: 'What is EmpireBuilder AI?', 
        a: 'EmpireBuilder AI is a platform that helps you create and grow an ecommerce store using artificial intelligence.' 
    },
    { 
        q: 'Do I need experience with ecommerce?', 
        a: 'No. The platform is built for beginners and guides you through the process.' 
    },
    { 
        q: 'Do I need coding skills?', 
        a: 'No coding is required to use EmpireBuilder AI.' 
    },
    { 
        q: 'How do products get into my store?', 
        a: 'You connect your ecommerce stack and import products, then EmpireBuilder helps you optimize and manage them.' 
    },
    { 
        q: 'Do you offer a free trial?', 
        a: 'Yes. Users can start with a free trial before subscribing.' 
    },
    { 
        q: 'Can I use it on mobile?', 
        a: 'Yes. The platform works on mobile browsers, and mobile apps are planned after beta.' 
    },
    { 
        q: 'Is payment secure?', 
        a: 'Yes. Payments are processed through secure providers like Stripe and Pagar.me.' 
    },
    { 
        q: 'Is this only for dropshipping?', 
        a: 'No. It is built for ecommerce store creation and optimization, especially helpful for beginners and product-based businesses.' 
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
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-500 font-bold">
                        Everything you need to know about the product and billing.
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
