'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Store,
    Settings,
    LogOut,
    Layers,
    Package,
    Link as LinkIcon,
    Video,
    Zap,
    CreditCard,
    Activity,
    User,
    Gift,
    Sparkles,
    Wand2,
    Megaphone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/lib/subscription/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';

export default function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const { plan, loading, isPro } = useSubscription();
    const { t } = useTranslation();

    const links = [
        { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('sidebar.performance'), href: '/dashboard/performance', icon: Activity },
        { name: t('sidebar.storeProfile'), href: '/dashboard/store-profile', icon: Store },
        { name: t('sidebar.productFinder'), href: '/dashboard/product-finder', icon: Package },
        { name: t('sidebar.productResearch'), href: '/dashboard/product-research', icon: Sparkles },
        { name: t('sidebar.storeContent'), href: '/dashboard/store-content', icon: Wand2 },
        { name: t('sidebar.tiktokPosts'), href: '/dashboard/tiktok-posts', icon: Video },
        { name: t('sidebar.trends'), href: '/dashboard/trends', icon: Zap },
        { name: t('sidebar.myNiches'), href: '/dashboard/niches', icon: Layers },
        { name: t('sidebar.aiBuilder'), href: '/dashboard/builder', icon: Store },
        { name: t('sidebar.adGenerator'), href: '/dashboard/ad-generator', icon: Megaphone },
        { name: t('sidebar.integrations'), href: '/dashboard/integrations', icon: LinkIcon },
        { name: t('sidebar.billing'), href: '/dashboard/billing', icon: CreditCard },
        { name: t('sidebar.referrals'), href: '/dashboard/referrals', icon: Gift },
        { name: t('sidebar.profile'), href: '/dashboard/profile', icon: User },
        { name: t('sidebar.settings'), href: '#', icon: Settings },
    ];

    return (
        <aside className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

            <div className="p-8 border-b border-white/5 relative z-10">
                <div className="font-bold text-xl tracking-tight flex items-center gap-3">
                    <span className="bg-primary/20 h-8 w-8 rounded-lg flex items-center justify-center text-xs text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">AI</span>
                    <span className="text-white">EmpireBuilder</span>
                </div>
                {!loading && (
                    <div className="mt-4 flex items-center gap-2">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${plan === 'pro' || plan === 'elite'
                            ? 'bg-primary/20 text-primary border-primary/30'
                            : plan === 'enterprise'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                : 'bg-gray-500/10 text-gray-500 border-white/10'
                            }`}>
                            {plan === 'elite' ? 'ELITE' : plan.toUpperCase()} PLAN
                        </div>
                        {!isPro && (
                            <Link href="/dashboard/pricing" className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter">
                                {t('sidebar.upgradeCta')}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <nav className="flex-grow p-6 space-y-1 relative z-10 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className="text-sm">{link.name}</span>
                            {link.href === '/dashboard/ad-generator' && (
                                <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-black uppercase tracking-wider border border-primary/20">NEW</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/5 relative z-10">
                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-4 px-4 py-3.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    {t('sidebar.logout')}
                </button>
            </div>
        </aside>
    );
}
