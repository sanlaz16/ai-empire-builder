import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Política de Privacidade | EmpireBuilder AI',
    description: 'Nossa política de privacidade e uso de dados.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white flex flex-col">
            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 block">Política de Privacidade</h1>
                    
                    <div className="prose prose-invert max-w-none text-gray-400 font-bold space-y-6">
                        <p>Última atualização: Março de 2026</p>
                        
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">1. Coleta de Dados</h2>
                        <p>
                            Coletamos dados analíticos essenciais e dados de uso da plataforma com o único propósito de melhorar a experiência do usuário e otimizar nossas ferramentas de Inteligência Artificial.
                        </p>
                        
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">2. Processamento Financeiro</h2>
                        <p>
                            Todos os pagamentos e informações de cartão de crédito são processados e armazenados com segurança por provedores terceirizados certificados (Stripe / Pagar.me). O EmpireBuilder AI não armazena dados de cartão de crédito em seus servidores.
                        </p>
                        
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">3. Compartilhamento de Dados</h2>
                        <p>
                            Nós não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros sob nenhuma circunstância.
                        </p>

                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">4. Seus Direitos</h2>
                        <p>
                            Você tem o direito de solicitar a exclusão total da sua conta e de todos os dados associados a ela através do painel de configurações ou entrando em contato com nosso suporte.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
