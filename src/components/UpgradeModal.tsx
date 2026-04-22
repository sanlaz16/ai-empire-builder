'use client';

import React from 'react';
import { X, Zap, Check, Star, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export const UpgradeModal = ({ isOpen, onClose, featureName }: UpgradeModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl glass-card border-primary/20 p-10 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                        <Zap className="w-10 h-10 text-primary" />
                    </div>

                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        Unlock {featureName || 'Premium Features'}
                    </h2>

                    <p className="text-gray-400 font-bold text-lg max-w-md mb-10 leading-relaxed">
                        Join the ELITE to scale your empire. Get unlimited imports, AI optimization, and TikTok automation.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12">
                        {[
                            { icon: Check, label: "Unlimited Shopify Imports", desc: "No limits on your growth" },
                            { icon: Star, label: "AI Listing Optimization", desc: "Convert 3x more visitors" },
                            { icon: Video, label: "TikTok Video Export", desc: "Viral marketing in 1-click" },
                            { icon: ShieldCheck, label: "Empire Elite Support", desc: "Priority 24/7 assistance" }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                                <item.icon className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <div>
                                    <div className="text-sm font-black text-white uppercase tracking-wide">{item.label}</div>
                                    <div className="text-xs text-gray-500 font-bold">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <Link
                            href="/dashboard/pricing"
                            onClick={onClose}
                            className="flex-1 py-5 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all text-center shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                        >
                            View Plans
                        </Link>
                        <button
                            onClick={onClose}
                            className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                        >
                            Maybe Later
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-gray-600 font-bold uppercase tracking-widest">
                        Trusted by 5,000+ dropshippers worldwide
                    </p>
                </div>
            </div>
        </div>
    );
};

// Internal Import for Video icon which was missing from lucide list above
import { Video } from 'lucide-react';
