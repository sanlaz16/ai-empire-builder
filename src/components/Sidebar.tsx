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
    Wand2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/lib/subscription/useSubscription';

export default function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const { plan, loading, isPro } = useSubscription();

    const links = [
        { name: 'Painel', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Desempenho', href: '/dashboard/performance', icon: Activity },
        { name: 'Perfil da Loja', href: '/dashboard/store-profile', icon: Store },
        { name: 'Buscar Produtos', href: '/dashboard/product-finder', icon: Package },
        { name: 'Pesquisa com IA', href: '/dashboard/product-research', icon: Sparkles },
        { name: 'Conteúdo da Loja', href: '/dashboard/store-content', icon: Wand2 },
        { name: 'Meus Posts TikTok', href: '/dashboard/tiktok-posts', icon: Video },
        { name: 'Radar de Tendências', href: '/dashboard/trends', icon: Zap },
        { name: 'Meus Nichos', href: '/dashboard/niches', icon: Layers },
        { name: 'Construtor de Loja IA', href: '/dashboard/builder', icon: Store },
        { name: 'Integrações', href: '/dashboard/integrations', icon: LinkIcon },
        { name: 'Faturamento', href: '/dashboard/billing', icon: CreditCard },
        { name: 'Indique & Ganhe', href: '/dashboard/referrals', icon: Gift },
        { name: 'Meu Perfil', href: '/dashboard/profile', icon: User },
        { name: 'Configurações', href: '#', icon: Settings },
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
                                Upgrade →
                            </Link>
                        )}
                    </div>
                )}
            </div>

            <nav className="flex-grow p-6 space-y-2 relative z-10">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${isActive
                                ? 'bg-primary/10 text-primary font-bold border border-primary/20 shadow-[0_0_20px_-5px_rgba(0,240,255,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
                            {link.name}
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
                    Sair
                </button>
            </div>
        </aside>
    );
}
