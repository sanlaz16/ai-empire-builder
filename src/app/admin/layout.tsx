import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin | EmpireBuilder',
    description: 'Internal admin panel.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <div className="border-b border-white/5 bg-black/60 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 text-xs font-black">
                        A
                    </div>
                    <span className="font-black text-white uppercase tracking-widest text-sm">Admin</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">Internal</span>
                </div>
                <nav className="flex items-center gap-1">
                    <Link href="/admin/feedback" className="px-3 py-1.5 rounded-lg text-xs font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider">
                        Feedback
                    </Link>
                    <Link href="/admin/analytics" className="px-3 py-1.5 rounded-lg text-xs font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider">
                        Analytics
                    </Link>
                </nav>
            </div>
            {children}
        </div>
    );
}
