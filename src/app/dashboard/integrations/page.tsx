'use client';

import { useState } from 'react';
import { useIntegration } from '@/context/IntegrationContext';
import { ShoppingBag, Globe, Zap, CheckCircle2, X, AlertTriangle, Link as LinkIcon, Lock, Video } from 'lucide-react';

export default function IntegrationsPage() {
    // Context
    const {
        shopifyConnected, connectShopify, disconnectShopify, shopifyDomain,
        amazonConnected, connectAmazon, disconnectAmazon,
        tikTokConnected, connectTikTok, disconnectTikTok
    } = useIntegration();

    // Modals
    const [showShopifyModal, setShowShopifyModal] = useState(false);
    const [showAmazonModal, setShowAmazonModal] = useState(false);
    const [showTikTokModal, setShowTikTokModal] = useState(false);

    // Form State (Shopify)
    const [shopifyUrl, setShopifyUrl] = useState('');
    const [shopifyApiKey, setShopifyApiKey] = useState('');
    const [shopifyApiSecret, setShopifyApiSecret] = useState('');
    const [isShopifyConnecting, setIsShopifyConnecting] = useState(false);

    // Form State (Amazon)
    const [amazonId, setAmazonId] = useState('');
    const [amazonTracking, setAmazonTracking] = useState('');
    const [isAmazonConnecting, setIsAmazonConnecting] = useState(false);

    // Form State (TikTok)
    const [tikTokSellerId, setTikTokSellerId] = useState('');
    const [tikTokAccessToken, setTikTokAccessToken] = useState('');
    const [tikTokRegion, setTikTokRegion] = useState('US');
    const [isTikTokConnecting, setIsTikTokConnecting] = useState(false);

    // Handlers
    const handleConnectShopify = () => {
        if (!shopifyUrl) return;
        setIsShopifyConnecting(true);
        connectShopify(shopifyUrl);
    };

    const handleConnectAmazon = () => {
        setIsAmazonConnecting(true);
        setTimeout(() => {
            connectAmazon({
                associateId: amazonId,
                trackingCode: amazonTracking
            });
            setIsAmazonConnecting(false);
            setShowAmazonModal(false);
        }, 1500);
    };

    const handleConnectTikTok = () => {
        setIsTikTokConnecting(true);
        setTimeout(() => {
            connectTikTok({
                sellerId: tikTokSellerId,
                accessToken: tikTokAccessToken,
                region: tikTokRegion
            });
            setIsTikTokConnecting(false);
            setShowTikTokModal(false);
        }, 1500);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen pb-48">

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-4 flex items-center gap-4 text-white">
                    <span className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <LinkIcon className="w-6 h-6" />
                    </span>
                    <span className="gradient-text">Integrations</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Connect your external platforms to synchronize products and automate fulfillment.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* SHOPIFY CARD */}
                <div className="glass-card p-8 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBag className="w-32 h-32" />
                    </div>

                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#95BF47]/20 rounded-xl flex items-center justify-center border border-[#95BF47]/30">
                                <ShoppingBag className="w-8 h-8 text-[#95BF47]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Shopify</h3>
                                <p className="text-gray-400 text-sm">E-Commerce Platform</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${shopifyConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                            {shopifyConnected ? shopifyDomain || 'Active' : 'Not Connected'}
                        </div>
                    </div>

                    <p className="text-gray-400 mb-8 relative z-10 h-12">
                        Connect your real store to synchronize products, fulfill orders, and optimize listings with IA.
                    </p>

                    <div className="relative z-10">
                        {shopifyConnected ? (
                            <button
                                onClick={disconnectShopify}
                                className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-all"
                            >
                                Disconnect Store
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowShopifyModal(true)}
                                className="w-full py-4 rounded-xl bg-[#95BF47] text-black font-bold hover:bg-[#85AB3E] transition-all shadow-[0_0_20px_rgba(149,191,71,0.3)]"
                            >
                                Connect Shopify
                            </button>
                        )}
                    </div>
                </div>

                {/* AMAZON CARD */}
                <div className="glass-card p-8 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe className="w-32 h-32" />
                    </div>

                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#FF9900]/20 rounded-xl flex items-center justify-center border border-[#FF9900]/30">
                                <Globe className="w-8 h-8 text-[#FF9900]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Amazon Affiliate</h3>
                                <p className="text-gray-400 text-sm">Affiliate Revenue</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${amazonConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                            {amazonConnected ? 'Active' : 'Not Connected'}
                        </div>
                    </div>

                    <p className="text-gray-400 mb-8 relative z-10 h-12">
                        Generate affiliate links automatically for finding products. Monetize your research flow.
                    </p>

                    <div className="relative z-10">
                        {amazonConnected ? (
                            <button
                                onClick={disconnectAmazon}
                                className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-all"
                            >
                                Disconnect ID
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAmazonModal(true)}
                                className="w-full py-4 rounded-xl bg-[#FF9900] text-black font-bold hover:bg-[#E68A00] transition-all shadow-[0_0_20px_rgba(255,153,0,0.3)]"
                            >
                                Connect Amazon
                            </button>
                        )}
                    </div>
                </div>

                {/* TIKTOK CARD */}
                <div className="glass-card p-8 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Video className="w-32 h-32" />
                    </div>

                    <div className="flex items-start justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#000000] rounded-xl flex items-center justify-center border border-[#00f2ea]/30 shadow-[0_0_10px_rgba(0,242,234,0.3)]">
                                <Video className="w-8 h-8 text-[#ff0050]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">TikTok Shop</h3>
                                <p className="text-gray-400 text-sm">Viral Commerce</p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${tikTokConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                            {tikTokConnected ? 'Active' : 'Not Connected'}
                        </div>
                    </div>

                    <p className="text-gray-400 mb-8 relative z-10 h-12">
                        Export products and generate TikTok-ready metadata using AI.
                    </p>

                    <div className="relative z-10">
                        {tikTokConnected ? (
                            <button
                                onClick={disconnectTikTok}
                                className="w-full py-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-all"
                            >
                                Disconnect Shop
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowTikTokModal(true)}
                                className="w-full py-4 rounded-xl bg-black text-white border border-[#00f2ea]/50 font-bold hover:bg-[#00f2ea]/10 transition-all shadow-[0_0_20px_rgba(0,242,234,0.3)]"
                            >
                                Connect TikTok
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* --- MODALS --- */}

            {/* Shopify Modal */}
            {showShopifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="glass-card max-w-md w-full p-8 border-primary/30 relative">
                        <button
                            onClick={() => setShowShopifyModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#95BF47]/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#95BF47]/30">
                                <ShoppingBag className="w-8 h-8 text-[#95BF47]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Connect Shopify</h2>
                            <p className="text-sm text-gray-400 mt-2">Enter your store details to enable mock sync.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store URL</label>
                                <input
                                    type="text"
                                    placeholder="my-store.myshopify.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#95BF47]"
                                    value={shopifyUrl}
                                    onChange={(e) => setShopifyUrl(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleConnectShopify}
                                disabled={isShopifyConnecting}
                                className="w-full py-3 rounded-lg bg-[#95BF47] text-black font-bold hover:bg-[#85AB3E] transition-all flex items-center justify-center gap-2"
                            >
                                {isShopifyConnecting ? (
                                    <>Redirecting...</>
                                ) : (
                                    <>Connect via Shopify OAuth</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Amazon Modal */}
            {showAmazonModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="glass-card max-w-md w-full p-8 border-primary/30 relative">
                        <button
                            onClick={() => setShowAmazonModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#FF9900]/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#FF9900]/30">
                                <Globe className="w-8 h-8 text-[#FF9900]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Connect Amazon</h2>
                            <p className="text-sm text-gray-400 mt-2">Enable affiliate link generation.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Associate Tag ID</label>
                                <input
                                    type="text"
                                    placeholder="store-20"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FF9900]"
                                    value={amazonId}
                                    onChange={(e) => setAmazonId(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tracking Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="campaign_1"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#FF9900]"
                                    value={amazonTracking}
                                    onChange={(e) => setAmazonTracking(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleConnectAmazon}
                                disabled={isAmazonConnecting}
                                className="w-full py-3 rounded-lg bg-[#FF9900] text-black font-bold hover:bg-[#E68A00] transition-all flex items-center justify-center gap-2"
                            >
                                {isAmazonConnecting ? (
                                    <>Verifying...</>
                                ) : (
                                    <>Simulate Connection</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TikTok Modal */}
            {showTikTokModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="glass-card max-w-md w-full p-8 border-primary/30 relative">
                        <button
                            onClick={() => setShowTikTokModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#000000] rounded-xl flex items-center justify-center mx-auto mb-4 border border-[#00f2ea]/30 shadow-[0_0_15px_rgba(0,242,234,0.3)]">
                                <Video className="w-8 h-8 text-[#ff0050]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Connect TikTok Shop</h2>
                            <p className="text-sm text-gray-400 mt-2">Unlock viral commerce potential.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seller ID</label>
                                <input
                                    type="text"
                                    placeholder="US-89231..."
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f2ea]"
                                    value={tikTokSellerId}
                                    onChange={(e) => setTikTokSellerId(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Access Token (Mock)</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                                    <input
                                        type="password"
                                        placeholder="ttk_xxxxxxxx"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-[#00f2ea]"
                                        value={tikTokAccessToken}
                                        onChange={(e) => setTikTokAccessToken(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Region</label>
                                <select
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f2ea]"
                                    value={tikTokRegion}
                                    onChange={(e) => setTikTokRegion(e.target.value)}
                                >
                                    <option value="US">United States (US)</option>
                                    <option value="UK">United Kingdom (UK)</option>
                                    <option value="EU">Europe (EU)</option>
                                    <option value="BR">Brazil (BR)</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={handleConnectTikTok}
                                disabled={isTikTokConnecting}
                                className="w-full py-3 rounded-lg bg-black border border-[#00f2ea]/50 text-white font-bold hover:bg-[#00f2ea]/20 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,234,0.2)]"
                            >
                                {isTikTokConnecting ? (
                                    <>Connecting...</>
                                ) : (
                                    <>Simulate Connection</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
