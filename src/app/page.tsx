import Link from 'next/link';
import { PlayCircle, Globe, ShoppingBag, TrendingUp, Zap, CheckCircle, ArrowRight, Shield, Award } from 'lucide-react';

interface Plan {
    name: string;
    price: string;
    features: string[];
    recommended: boolean;
    color?: string;
    borderColor?: string;
}

export default function Home() {
    const plans: Plan[] = [
        {
            name: 'Inicial',
            price: 'R$19,90',
            features: ['Construtor de Loja Básico', '500 Sugestões IA/mês', 'Temas Padrão', 'Suporte Básico'],
            recommended: false,
        },
        {
            name: 'Crescimento',
            price: 'R$49,90',
            features: ['Tudo do Inicial', 'Estúdio de Fotos IA', 'Criador de Logo Avançado', 'Suporte Prioritário', '3 Lojas Conectadas'],
            recommended: true,
            color: 'shadow-[0_0_50px_-10px_rgba(112,0,255,0.3)]',
            borderColor: 'border-secondary'
        },
        {
            name: 'Império',
            price: 'R$149,90',
            features: ['Tudo do Crescimento', 'Gerador de Vídeo Ads IA (Veo3)', 'Automação de Dropshipping', 'Gerente de Sucesso Dedicado', 'Lojas Ilimitadas'],
            recommended: false,
        }
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30 selection:text-white">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-grid opacity-[0.2]"></div>
            </div>

            {/* Navigation */}
            <nav className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-background/70 supports-[backdrop-filter]:bg-background/60">
                <div className="container flex items-center justify-between h-20">
                    <div className="font-bold text-2xl tracking-tighter flex items-center gap-2 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-md opacity-50 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                            <span className="relative bg-black h-8 w-8 rounded-lg flex items-center justify-center text-xs border border-white/20">AI</span>
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">EmpireBuilder</span>
                    </div>
                    <div className="hidden md:flex gap-10 text-sm font-medium text-gray-400">
                        <a href="#features" className="hover:text-primary transition-colors hover:shadow-[0_20px_40px_-10px_rgba(0,240,255,0.5)]">Recursos</a>
                        <a href="#how-it-works" className="hover:text-primary transition-colors">Como Funciona</a>
                        <a href="#pricing" className="hover:text-primary transition-colors">Preços</a>
                        <a href="#about" className="hover:text-primary transition-colors">Sobre</a>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="/signin" className="text-sm font-medium hover:text-white text-gray-400 py-2 transition-colors">Entrar</Link>
                        <Link href="/signup" className="btn btn-primary text-sm py-2.5 px-6">
                            Começar Agora
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative pt-32 pb-32 text-center overflow-hidden">
                    <div className="container relative z-10 px-4">
                        {/* New Feature Pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-xs font-bold text-primary mb-10 animate-fade-in-up backdrop-blur-sm cursor-pointer hover:bg-primary/10 transition-colors">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            V2.0 AO VIVO: VÍDEO ADS AUTO-ESCALÁVEIS
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter max-w-5xl mx-auto leading-[1.05] animate-fade-in-up [animation-delay:100ms]">
                            Crie sua loja com IA e transforme sua ideia em um negócio online.
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:200ms]">
                            Simples, acessível e orientado por dados. Nossa IA estrutura seu e-commerce, sugere produtos e orienta você do nicho à primeira venda.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fade-in-up [animation-delay:300ms]">
                            <Link href="/signup" className="btn btn-primary text-lg h-16 px-10 w-full md:w-auto group">
                                <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Começar Grátis
                            </Link>
                            <button className="btn btn-secondary text-lg h-16 px-10 w-full md:w-auto group backdrop-blur-sm">
                                <PlayCircle className="w-5 h-5 mr-3 group-hover:text-primary transition-colors" />
                                Ver Demo de 2 Min
                            </button>
                        </div>
                    </div>
                </section>

                {/* Simulated Interface / Video Placeholder */}
                <section className="pb-32 relative">
                    <div className="container relative z-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-black/40 shadow-2xl group cursor-pointer backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>

                            {/* Glass Control Bar */}
                            <div className="absolute bottom-8 left-8 right-8 z-20 flex items-end justify-between">
                                <div>
                                    <div className="text-primary font-bold tracking-wider text-xs mb-2">PRÉVIA AO VIVO</div>
                                    <h3 className="text-3xl font-bold mb-2">Veja o Motor em Ação</h3>
                                    <p className="text-lg text-gray-300 max-w-md">Assista a IA construir uma marca de streetwear do zero em tempo real.</p>
                                </div>
                                <div className="h-16 w-16 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md transition-all group-hover:scale-110">
                                    <PlayCircle className="w-8 h-8 text-white fill-white" />
                                </div>
                            </div>

                            {/* Decorative UI Elements inside placeholder */}
                            <div className="absolute top-8 right-8 z-20 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                        </div>

                        <div className="mt-20 text-center">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-8">Impulsionando o Comércio de Nova Geração</p>
                            <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                                <span className="text-2xl font-black text-white">SHOPIFY<span className="font-light">PLUS</span></span>
                                <span className="text-2xl font-black text-white">WIRED</span>
                                <span className="text-2xl font-black text-white">TechCrunch</span>
                                <span className="text-2xl font-black text-white">FORBES</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="section-padding relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent pointer-events-none"></div>
                    <div className="container relative z-10">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Não Apenas um Construtor de Páginas. <br /> <span className="gradient-text">Um Construtor de Impérios.</span></h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Ferramentas padrão fazem você arrastar e soltar. Nós fazemos você lucrar e escalar.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="glass-card group">
                                <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-8 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                    <Globe className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Configuração Autônoma</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Chega de "personalizar temas". A IA gera um design único e premium baseado na sua visão de 500 palavras. Ela escreve o texto, escolhe as fontes e conecta ao Shopify instantaneamente.
                                </p>
                            </div>

                            <div className="glass-card group">
                                <div className="h-14 w-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-8 border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                                    <ShoppingBag className="w-7 h-7 text-secondary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Caçador de Produtos</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Comece com vendas, não com palpites. Nosso motor escaneia milhões de dados de vendas para encontrar produtos com margens &gt;30% que estão virais <i>agora mesmo</i>.
                                </p>
                            </div>

                            <div className="glass-card group">
                                <div className="h-14 w-14 bg-accent/10 rounded-xl flex items-center justify-center mb-8 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                                    <TrendingUp className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Gerador de Ads Virais</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    A parte mais difícil é o marketing. Nosso plano premium gera vídeo ads prontos para TikTok automaticamente usando tecnologia Veo3.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="section-padding border-t border-white/5 bg-white/[0.01]">
                    <div className="container">
                        <div className="flex flex-col md:flex-row items-center gap-16">
                            <div className="w-full md:w-1/2">
                                <h2 className="text-4xl md:text-5xl font-bold mb-10">De "Ideia" para "Conta Bancária" em 3 Passos</h2>
                                <div className="space-y-10">
                                    <div className="flex gap-6 group">
                                        <div className="h-12 w-12 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xl shrink-0 shadow-lg text-primary group-hover:border-primary transition-colors">1</div>
                                        <div>
                                            <h4 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">Briefing Detalhado</h4>
                                            <p className="text-gray-400 text-lg">Conte-nos seu nicho (ex: "Brinquedos ecológicos para pets"). Quanto mais detalhes, melhor a IA pode personalizar o DNA da sua marca.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 group">
                                        <div className="h-12 w-12 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xl shrink-0 shadow-lg text-secondary group-hover:border-secondary transition-colors">2</div>
                                        <div>
                                            <h4 className="text-2xl font-bold mb-3 group-hover:text-secondary transition-colors">Construção IA</h4>
                                            <p className="text-gray-400 text-lg">Nós construímos o site, escrevemos as páginas legais, encontramos os produtos e configuramos os gateways de pagamento. Trabalho real, feito em minutos.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 group">
                                        <div className="h-12 w-12 rounded-full bg-surface border border-white/10 flex items-center justify-center font-bold text-xl shrink-0 shadow-lg text-accent group-hover:border-accent transition-colors">3</div>
                                        <div>
                                            <h4 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">Lançar e Escalar</h4>
                                            <p className="text-gray-400 text-lg">Use nosso painel para rastrear vendas, cumprir pedidos automaticamente e gerar novo conteúdo viral puramente a partir de dados.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-1/2">
                                <div className="bg-surface border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                    {/* Visual simulation list */}
                                    <div className="relative space-y-4 z-10">
                                        <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md hover:translate-x-2 transition-transform duration-300">
                                            <CheckCircle className="text-green-400 w-6 h-6" />
                                            <span className="font-medium">Encontrados 12 Produtos de Alta Margem</span>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md hover:translate-x-2 transition-transform duration-300 delay-75">
                                            <CheckCircle className="text-blue-400 w-6 h-6" />
                                            <span className="font-medium">Sistema de Identidade Visual Gerado</span>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md hover:translate-x-2 transition-transform duration-300 delay-150">
                                            <CheckCircle className="text-purple-400 w-6 h-6" />
                                            <span className="font-medium">Integração Shopify Completa</span>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border border-primary/30 backdrop-blur-md animate-pulse">
                                            <span className="animate-spin mr-1">⚡</span>
                                            <span className="font-bold text-primary">Renderizando Criativo de Ad Viral...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="section-padding relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none"></div>
                    <div className="container relative z-10 text-center">
                        <div className="mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Escolha Seu <span className="gradient-text">Nível de Poder</span></h2>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Comece pequeno ou vá direto para a dominação mundial. Todos os planos incluem nosso Motor IA principal.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`glass-card flex flex-col items-center ${plan.color || ''} ${plan.borderColor || 'border-white/10'}`}
                                >
                                    {plan.recommended && (
                                        <div className="absolute top-0 right-0 bg-secondary text-white font-bold px-4 py-1.5 rounded-bl-xl text-xs uppercase tracking-wider">
                                            Mais Popular
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="text-5xl font-black mb-8 tracking-tight">{plan.price}<span className="text-lg font-medium text-gray-500">/mês</span></div>

                                    <ul className="text-left w-full space-y-4 mb-10 flex-grow">
                                        {plan.features.map((f, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                <div className="mt-1"><CheckCircle className="w-4 h-4 text-primary" /></div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link href="/signup" className={`w-full py-4 rounded-xl font-bold transition-all text-center ${plan.recommended ? 'btn-primary' : 'btn-secondary text-gray-300'}`}>
                                        Escolher {plan.name}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-24 border-t border-white/5 bg-surface/30">
                    <div className="container max-w-5xl text-center">
                        <div className="flex justify-center mb-8">
                            <Award className="w-12 h-12 text-primary opacity-80" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-8">Sobre o EmpireBuilder</h2>
                        <div className="space-y-8 text-gray-400 leading-relaxed text-lg max-w-3xl mx-auto">
                            <p>
                                Acreditamos que construir um negócio não deveria exigir um diploma em ciência da computação ou R$50 mil em taxas de agência.
                                Em 2024, a barreira de entrada não é capital—é <span className="text-white font-medium">complexidade</span>.
                            </p>
                            <p>
                                O EmpireBuilder IA remove o atrito técnico do e-commerce.
                                Ao combinar IA generativa com dados de mercado em tempo real, capacitamos empreendedores
                                a lançar marcas de classe mundial em minutos, não em meses.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-black to-black"></div>
                    <div className="container text-center relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Pronto para conquistar seu <br /> pedaço da internet?</h2>
                        <p className="text-2xl text-gray-400 mb-12">Junte-se à revolução. É grátis para testar.</p>
                        <Link href="/signup" className="btn btn-primary text-xl hidden md:inline-flex h-20 px-12 shadow-[0_0_50px_rgba(0,240,255,0.4)] hover:shadow-[0_0_100px_rgba(0,240,255,0.6)]">
                            Começar a Construir Meu Império <ArrowRight className="ml-3 w-6 h-6" />
                        </Link>
                        {/* Mobile Button Variant */}
                        <Link href="/signup" className="btn btn-primary text-lg md:hidden h-16 w-full px-8">
                            Começar a Construir Meu Império
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10 py-16 bg-black z-10 relative">
                <div className="container grid md:grid-cols-4 gap-12 text-sm">
                    <div className="col-span-1 md:col-span-1">
                        <div className="font-bold text-2xl mb-6 tracking-tighter text-white">EmpireBuilder</div>
                        <p className="text-gray-500 leading-relaxed">A primeira infraestrutura movida por IA para marcas modernas de e-commerce.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-xs">Produto</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
                            <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Portfólio</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-xs">Empresa</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="#about" className="hover:text-primary transition-colors">Sobre</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-white uppercase tracking-wider text-xs">Legal</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
