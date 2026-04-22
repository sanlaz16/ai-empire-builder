'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSellerProfile, upsertSellerProfile, SellerProfile, getUserSubscription } from '@/lib/db';
import { canUseFeature } from '@/lib/planGate';
import { Save, Store, Globe, Lock, AlertTriangle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function StoreProfilePage() {
    const { user } = useAuth();

    // State
    const [profile, setProfile] = useState<Partial<SellerProfile>>({
        store_name: '',
        tagline: '',
        about_us: '',
        contact_email: '',
        phone: '',
        location: '',
        logo_url: '',
        instagram_url: '',
        facebook_url: '',
        x_url: '',
        tiktok_url: '',
        youtube_url: '',
        is_public: true,
        public_slug: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userPlan, setUserPlan] = useState<any>('starter');
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        // Parallel load
        const [subFn, profFn] = await Promise.all([
            getUserSubscription(user.id),
            getSellerProfile(user.id)
        ]);

        if (subFn) setUserPlan(subFn.plan);
        if (profFn) {
            setProfile(profFn);
        } else {
            // Default slug if new
            const slug = `store-${user.id.slice(0, 6)}`;
            setProfile(prev => ({ ...prev, public_slug: slug }));
        }

        setLoading(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        // Generate slug if empty or just confirm it exists
        let currentSlug = profile.public_slug;
        if (!currentSlug && profile.store_name) {
            currentSlug = profile.store_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + user.id.slice(0, 4);
        }

        const updates: Partial<SellerProfile> = {
            ...profile,
            public_slug: currentSlug,
            verified_badge: userPlan === 'empire' // Update badge based on current plan
        };

        const { error } = await upsertSellerProfile(user.id, updates);

        if (error) {
            setToast('Failed to save profile ❌');
        } else {
            setToast('Profile saved successfully ✅');
            // Optimistic update
            setProfile(prev => ({ ...prev, ...updates }));
        }
        setSaving(false);
        setTimeout(() => setToast(''), 3000);
    };

    // Plan Gating Helpers
    const socialLocked = userPlan === 'starter';
    const isEmpire = userPlan === 'empire';

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen pb-20">
            {toast && (
                <div className="fixed top-24 right-8 z-[100] animate-fade-in-up bg-black/90 text-white px-6 py-4 rounded-xl border border-primary shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center gap-3">
                    <Store className="text-green-400" />
                    <span className="font-bold">{toast}</span>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                        Store Profile <Store className="text-primary w-8 h-8" />
                    </h1>
                    <p className="text-gray-400">Manage your public brand and customer trust.</p>
                </div>
                {profile.public_slug && (
                    <Link href={`/store/${profile.public_slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-primary font-bold hover:bg-white/10 transition-colors">
                        <Globe className="w-4 h-4" /> View Public Page <ExternalLink className="w-3 h-3" />
                    </Link>
                )}
            </div>

            <div className="grid gap-8">

                {/* 1. BRAND */}
                <div className="glass-card p-6 border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">Brand Identity</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label>
                                <input
                                    type="text"
                                    value={profile.store_name || ''}
                                    onChange={e => setProfile({ ...profile, store_name: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                    placeholder="e.g. Neon Dreams"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tagline</label>
                                <input
                                    type="text"
                                    value={profile.tagline || ''}
                                    onChange={e => setProfile({ ...profile, tagline: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                    placeholder="e.g. Future tech for modern pets"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo URL</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={profile.logo_url || ''}
                                        onChange={e => setProfile({ ...profile, logo_url: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none text-sm font-mono"
                                        placeholder="https://..."
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Paste an image URL for now.</p>
                                </div>
                                <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                    {profile.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-600" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. ABOUT & CONTACT */}
                <div className="glass-card p-6 border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4">About & Contact</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">About Us</label>
                            <textarea
                                value={profile.about_us || ''}
                                onChange={e => setProfile({ ...profile, about_us: e.target.value })}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none h-24"
                                placeholder="Tell your story..."
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    value={profile.contact_email || ''}
                                    onChange={e => setProfile({ ...profile, contact_email: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={profile.phone || ''}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location (Optional)</label>
                                <input
                                    type="text"
                                    value={profile.location || ''}
                                    onChange={e => setProfile({ ...profile, location: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SOCIAL LINKS (GATED) */}
                <div className={`glass-card p-6 border-white/10 relative ${socialLocked ? 'opacity-70' : ''}`}>
                    {socialLocked && (
                        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                            <div className="text-center p-6 bg-black border border-primary/30 rounded-xl shadow-[0_0_30px_rgba(0,242,234,0.1)]">
                                <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                                <h3 className="text-lg font-bold text-white">Pro Feature</h3>
                                <p className="text-gray-400 mb-4 text-sm">Upgrade to add social links to your store.</p>
                                <Link href="/dashboard/billing" className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors">
                                    Upgrade to Pro
                                </Link>
                            </div>
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-white mb-4">Social Links</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { label: 'Instagram', key: 'instagram_url', placeholder: 'https://instagram.com/...' },
                            { label: 'Facebook', key: 'facebook_url', placeholder: 'https://facebook.com/...' },
                            { label: 'X (Twitter)', key: 'x_url', placeholder: 'https://x.com/...' },
                            { label: 'TikTok', key: 'tiktok_url', placeholder: 'https://tiktok.com/@...' },
                            { label: 'YouTube', key: 'youtube_url', placeholder: 'https://youtube.com/...' },
                        ].map((field) => (
                            <div key={field.key}>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{field.label}</label>
                                <input
                                    type="text"
                                    value={(profile as any)[field.key] || ''}
                                    onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                                    disabled={socialLocked}
                                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none disabled:cursor-not-allowed"
                                    placeholder={field.placeholder}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. VISIBILITY */}
                <div className="glass-card p-6 border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Public Visibility</h3>
                        <p className="text-gray-400 text-sm">Allow customers to view your store profile.</p>
                    </div>
                    <button
                        onClick={() => setProfile({ ...profile, is_public: !profile.is_public })}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${profile.is_public ? 'bg-green-500' : 'bg-gray-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${profile.is_public ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex justify-end gap-4">
                    <button className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/80 shadow-[0_0_20px_rgba(0,242,234,0.3)] disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>

            </div>
        </div>
    );
}
