import type { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';

export const metadata: Metadata = {
    title: 'EmpireBuilder — Encontre Produtos Vencedores com IA',
    description: 'Automatize sua loja dropshipping com IA. Detecte produtos vencedores, otimize listings, exporte para TikTok e calcule margens em tempo real.',
    openGraph: {
        title: 'EmpireBuilder — Dropshipping com IA',
        description: 'Encontre produtos vencedores, otimize com IA, e escale sua loja em dias.',
        images: ['/og-image.jpg'],
    },
};

export default function HomePage() {
    return <LandingPage />;
}
