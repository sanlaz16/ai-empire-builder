'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { addToWaitlist } from '@/lib/db';
import { ArrowRight, CheckCircle2, Star, Zap, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';

export default function LaunchPage() {
    const searchParams = useSearchParams();
    const refId = searchParams.get('ref');

    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myWaitlistId, setMyWaitlistId] = useState('');
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { data, error: err } = await addToWaitlist(email, refId as string);

        if (err) {
            if (err.code === '23505') {
                setError('You are already on the waitlist! 🚀');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } else if (data) {
            setJoined(true);
            setMyWaitlistId(data.id);
        }

        setLoading(false);
    };

    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/launch?ref=${myWaitlistId}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Referral link copied!');
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">

            {/* NAV */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                    EmpireBuilder
                </div>
                <Link href="/signin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    Login
                </Link>
            </nav>

            {/* HERO */}
            <div className="max-w-4xl mx-auto px-6 py-20 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary mb-8 animate-fade-in-up">
                    <Star className="w-3 h-3 fill-primary" /> Early Access — Limited Spots
                </div>

                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                    Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ea] to-[#ff0050]">AI Store</span> <br /> in Minutes.
                </h1>

                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    One prompt. One niche. AI finds the products, builds the store, and helps you sell.
                    Join the revolution of automated ecommerce.
                </p>

                {!joined ? (
                    <form onSubmit={handleJoin} className="max-w-md mx-auto flex flex-col md:flex-row gap-3">
                        <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(0,242,234,0.3)] whitespace-nowrap"
                        >
                            {loading ? 'Joining...' : 'Get Early Access'}
                        </button>
                    </form>
                ) : (
                    <div className="max-w-md mx-auto bg-white/5 border border-primary/30 rounded-2xl p-6 transform animate-scale-in">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">You're on the list!</h3>
                        <p className="text-gray-400 text-sm mb-4">We'll notify you when your spot opens up.</p>

                        <div className="bg-black/30 p-3 rounded-xl flex items-center gap-2 border border-white/10 mb-2">
                            <div className="flex-1 text-xs text-gray-500 truncate font-mono text-left pl-2">
                                {referralLink}
                            </div>
                            <button onClick={handleCopy} className="text-xs font-bold text-primary hover:text-white px-2">
                                Copy
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Invite friends to skip the line</p>
                    </div>
                )}

                {error && <p className="mt-4 text-red-400 text-sm font-bold">{error}</p>}

                <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm font-bold">
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> AI Product Finder</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Auto-Fulfillment</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Viral Radar</span>
                </div>
            </div>

            {/* FEATURES / HOW IT WORKS */}
            <div className="py-20 bg-white/5 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-4">How It Works</h2>
                        <p className="text-gray-400">Launch your empire in three simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="w-8 h-8 text-yellow-400" />}
                            title="1. Choose Your Niche"
                            desc="Select from trending categories or let our AI analyze market gaps for you."
                        />
                        <FeatureCard
                            icon={<ShoppingBag className="w-8 h-8 text-purple-400" />}
                            title="2. AI Builds the Store"
                            desc="We generate your products, descriptions, pricing, and website instantly."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-green-400" />}
                            title="3. Scale & Sell"
                            desc="Use our viral trend radar and auto-scheduler to drive traffic and sales."
                        />
                    </div>
                </div>
            </div>

            {/* PLANS PREVIEW */}
            <div className="py-20 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black mb-12">Choose Your Path</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto opacity-70 hover:opacity-100 transition-opacity">
                        <PlanPreview name="Starter" price="$19" />
                        <PlanPreview name="Pro" price="$49" highlight />
                        <PlanPreview name="Empire" price="$149" />
                    </div>
                    <div className="mt-12">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                            Join Early Access <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="py-8 border-t border-white/10 text-center text-gray-600 text-sm">
                <p>&copy; {new Date().getFullYear()} EmpireBuilder. All rights reserved.</p>
            </footer>

        </div>
    );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="p-8 rounded-3xl bg-black border border-white/10 hover:border-primary/50 transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    );
}

function PlanPreview({ name, price, highlight }: any) {
    return (
        <div className={`p-8 rounded-3xl border flex flex-col items-center ${highlight ? 'bg-primary/5 border-primary/30 scale-105' : 'bg-white/5 border-white/10'}`}>
            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{name}</div>
            <div className="text-3xl font-black text-white mb-6">{price}<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <div className="space-y-2 w-full">
                <div className="h-2 bg-white/10 rounded-full w-full" />
                <div className="h-2 bg-white/10 rounded-full w-3/4" />
                <div className="h-2 bg-white/10 rounded-full w-1/2" />
            </div>
        </div>
    );
}
