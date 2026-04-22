import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Termos de Uso | EmpireBuilder AI',
    description: 'Termos de serviço e condições de uso da plataforma EmpireBuilder AI.',
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white flex flex-col">
            <main className="flex-grow pt-32 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 block">Termos de Serviço</h1>
                    
                    <div className="prose prose-invert max-w-none text-gray-400 font-bold space-y-6">
                        <p>Última atualização: Março de 2026</p>
                        
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e utilizar a plataforma EmpireBuilder AI, você concorda em cumprir e estar vinculado a estes Termos de Serviço e a todas as leis e regulamentos aplicáveis.
                        </p>
                        
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">2. Assinaturas e Pagamentos</h2>
                        <p>
                            O EmpireBuilder AI é uma plataforma baseada em modelo de assinatura SaaS (Software as a Service). O faturamento é realizado de forma recorrente. Você pode cancelar sua assinatura a qualquer momento através do painel da sua conta. O cancelamento interrompe cobranças futuras, mas não gera reembolso pro-rata do ciclo atual.
                        </p>

                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">3. Ausência de Garantias Financeiras</h2>
                        <p>
                            Nós fornecemos ferramentas de inteligência artificial e facilitação de e-commerce. No entanto, não garantimos resultados financeiros, lucros ou sucesso em suas operações de vendas. O desempenho da sua loja depende exclusivamente da sua execução, tráfego de marketing e dinâmica de mercado.
                        </p>

                        <h2 className="text-2xl font-black text-white uppercase tracking-widest mt-12 mb-4">4. Restrições de Uso</h2>
                        <p>
                            Você concorda em não automatizar a raspagem de dados (scraping) excessiva da plataforma, realizar engenharia reversa nas nossas integrações e modelos de IA, ou utilizar o sistema para práticas ilícitas e de fraude contra consumidores finais. O descumprimento pode causar banimento perene sem direito a estorno.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
