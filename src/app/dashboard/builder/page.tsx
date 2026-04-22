'use client';

import { useState } from 'react';
import { Sparkles, ShoppingBag, FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function AIStoreBuilder() {
    const [formData, setFormData] = useState({
        niche: '',
        description: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const niches = [
        'Pets', 'Sports', 'Fashion', 'Beauty', 'Tech',
        'Gaming', 'Home & Decor', 'Supplements', 'Kids', 'Custom'
    ];

    const [error, setError] = useState('');
    const [generatedResult, setGeneratedResult] = useState<any>(null);

    const handleGenerate = () => {
        setError('');

        // 1. Validation
        if (!formData.niche || !formData.description) {
            setError('Please choose a niche and describe your store idea before generating.');
            return;
        }

        setIsGenerating(true);
        setShowPreview(false);

        // 2. Simulate AI Generation Delay
        setTimeout(() => {
            setIsGenerating(false);

            // 3. Generate Mock Data based on Niche
            const mockBrandName = `Nova${formData.niche} ${['Lab', 'Studio', 'Co', 'Systems', 'X'][Math.floor(Math.random() * 5)]}`;

            const result = {
                brandName: mockBrandName,
                tagline: `Redefining ${formData.niche} for the Modern Era.`,
                brandStory: `Born from a desire to revolutionize the ${formData.niche} industry, ${mockBrandName} bridges the gap between premium aesthetics and everyday utility. We don't just sell products; we curate a lifestyle for the forward-thinking individual.`,
                pages: ['Home (High Conversion)', `Shop All ${formData.niche}`, 'Our Story', 'Sustainability', 'Contact & Support'],
                products: [
                    { name: `Signature ${formData.niche} Pro`, desc: 'Flagship model with premium finish.', price: '$89.00', margin: '75%' },
                    { name: `${formData.niche} Essentials Kit`, desc: 'Everything needed to get started.', price: '$145.00', margin: '60%' },
                    { name: 'Accessory Pack V2', desc: 'High-margin add-ons for recurring revenue.', price: '$29.99', margin: '85%' },
                ]
            };

            setGeneratedResult(result);
            setShowPreview(true);

            // 4. Save to My Niches (LocalStorage Mock)
            const newNiche = {
                id: Date.now(),
                name: result.brandName,
                audience: `Fans of ${formData.niche}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                status: 'Generated',
                statusColor: 'text-primary bg-primary/10 border-primary/20'
            };

            const existingNiches = JSON.parse(localStorage.getItem('empire_niches') || '[]');
            localStorage.setItem('empire_niches', JSON.stringify([newNiche, ...existingNiches]));

        }, 2500);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto min-h-screen pb-20">
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-4 flex items-center gap-4 text-white">
                    <span className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <Sparkles className="w-6 h-6" />
                    </span>
                    <span className="gradient-text">AI Store Builder</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                    Describe your dream brand logic. Our neural engine will generate the infrastructure, products, and marketing strategy in <span className="text-white font-bold">60 seconds</span>.
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="glass-card">
                        <div className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm font-bold flex items-center gap-2 animate-fade-in">
                                    ⚠️ {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Target Industry / Niche</label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <select
                                        className="relative w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer hover:border-white/20"
                                        value={formData.niche}
                                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                        style={{ backgroundImage: 'none' }} // Remove default arrow in some browsers
                                    >
                                        <option value="" className="text-gray-500">Select a niche...</option>
                                        {niches.map(n => <option key={n} value={n} className="bg-black py-2">{n}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-baseline mb-3">
                                    <label className="block text-sm font-bold text-gray-300 uppercase tracking-wider">
                                        Vision & Strategy
                                    </label>
                                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">AI Optimized</span>
                                </div>
                                <div className="relative group">
                                    <textarea
                                        className="w-full h-72 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none text-base leading-relaxed placeholder:text-gray-600"
                                        placeholder="I want to build a premium brand for eco-friendly yoga mats. The target audience is women aged 25-40 who value sustainability and aesthetics. The tone should be calm, inspiring, and earthy..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                    <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                                        {formData.description.length} chars
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                                    <span className="text-primary">💡 Tip:</span> Be specific about your target audience and brand personality for better results.
                                </p>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !formData.niche}
                                className={`w-full py-5 text-lg font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isGenerating
                                    ? 'bg-primary/20 text-primary cursor-wait border border-primary/20'
                                    : 'btn-primary'
                                    }`}
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                        <span className="animate-pulse">Architecting Empire...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate My Store with AI
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview / Results Section */}
                <div className="relative">
                    {!showPreview && !isGenerating && (
                        <div className="h-full min-h-[500px] border border-white/5 bg-white/[0.02] rounded-2xl flex flex-col items-center justify-center p-12 text-center text-gray-500 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-grid opacity-[0.4] pointer-events-none"></div>
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 group-hover:border-primary/30 group-hover:bg-primary/10">
                                <Sparkles className="w-8 h-8 opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </div>
                            <p className="text-xl font-medium text-gray-300 mb-2">Awaiting Instructions</p>
                            <p className="text-sm max-w-xs mx-auto opacity-60">Complete the briefing on the left to initialize the construction engine.</p>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="h-full min-h-[500px] bg-black/40 rounded-2xl flex flex-col items-center justify-center p-12 text-center border border-primary/20 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                            <div className="relative z-10 w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-4 bg-primary/20 rounded-full blur-md animate-pulse"></div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI Processing</h3>
                            <div className="text-base text-primary/80 font-mono tracking-wider">
                                <p className="animate-fade-in-up">&gt;&gt; Analyzing Market Vectors...</p>
                            </div>
                        </div>
                    )}

                    {showPreview && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="text-green-500 w-5 h-5" />
                                <span className="text-green-200 font-medium">Store Strategy Generated Successfully</span>
                            </div>

                            {/* Pages Preview */}
                            <div className="glass-card">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                                    Suggested Site Structure
                                </h3>
                                <div className="space-y-3">
                                    {['Home (Landing)', 'Product Collection (Best Sellers)', 'Product Page (Conversion Optimized)', 'FAQ & Support', 'About Our Mission', 'Contact Us'].map((page, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/5 hover:bg-white/[0.05] transition-colors group">
                                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm text-gray-200 font-medium">{page}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Preview */}
                            <div className="glass-card">
                                <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-secondary"></div>
                                    Initial Product Lineup
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-5 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-secondary/50 transition-all cursor-pointer group hover:bg-secondary/5">
                                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center shadow-lg border border-white/5">
                                            <ShoppingBag className="w-8 h-8 text-gray-400 group-hover:text-secondary transition-colors" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-white group-hover:text-secondary transition-colors">Premium {formData.niche} Essential</div>
                                            <div className="text-xs text-gray-400 mt-1 flex gap-2">
                                                <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded">High Margin</span>
                                                <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded">Viral Potential</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-5 p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-secondary/50 transition-all cursor-pointer group hover:bg-secondary/5">
                                        <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg flex items-center justify-center shadow-lg border border-white/5">
                                            <ShoppingBag className="w-8 h-8 text-gray-400 group-hover:text-secondary transition-colors" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg text-white group-hover:text-secondary transition-colors">The "Everyday" {formData.niche} Kit</div>
                                            <div className="text-xs text-gray-400 mt-1 flex gap-2">
                                                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Bundle Offer</span>
                                                <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded">High AOV</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full btn btn-secondary">
                                Customize Design Layout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
