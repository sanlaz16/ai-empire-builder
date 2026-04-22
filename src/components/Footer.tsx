'use client';

import Link from 'next/link';
import { Instagram, Smartphone, Mail, Globe } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-[#020202] border-t border-white/5 pt-20 pb-10 px-6 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand Info */}
                    <div className="col-span-1 md:col-span-1 border-r-0 md:border-r border-white/5 pr-8">
                        <div className="font-black text-2xl tracking-tight flex items-center gap-2 mb-6">
                            <span className="bg-primary/20 h-8 w-8 rounded-lg flex items-center justify-center text-xs text-primary border border-primary/30">AI</span>
                            EmpireBuilder
                        </div>
                        <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
                            Ferramenta de e-commerce com IA para criar e crescer seu negócio online.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" aria-label="TikTok" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Smartphone className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="col-span-1 md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Produto</h4>
                            <ul className="space-y-4 text-sm font-bold text-gray-500">
                                <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                                <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                                <li><a href="#how-it-works" className="hover:text-primary transition-colors">Como funciona</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Empresa</h4>
                            <ul className="space-y-4 text-sm font-bold text-gray-500">
                                <li><Link href="/about" className="hover:text-primary transition-colors">Sobre</Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors">Contato</Link></li>
                                <li><Link href="/support" className="hover:text-primary transition-colors">Suporte</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm font-bold text-gray-500">
                                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
                                <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 font-bold">
                        &copy; 2026 EmpireBuilder AI. Todos os direitos reservados.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-600 tracking-widest border border-white/5 px-3 py-1.5 rounded-full">
                        <Globe className="w-3 h-3" /> Brasil
                    </div>
                </div>
            </div>
        </footer>
    );
}
