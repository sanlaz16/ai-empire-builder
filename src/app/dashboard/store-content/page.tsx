'use client';

import { useState } from 'react';
import {
    Wand2, Copy, Check, RefreshCw, AlertTriangle, Store,
    Tag, FileText, List, Percent, ShieldCheck, Sparkles,
    ChevronDown, ChevronUp, Package, ArrowRight
} from 'lucide-react';

interface StoreContentOutput {
    store_names: string[];
    product_title: string;
    product_description: {
        problem: string;
        solution: string;
        benefits: string;
        social_proof: string;
    };
    bullet_points: string[];
    offers: {
        discount: string;
        bundle: string;
        urgency: string;
    };
    trust_elements: {
        guarantee: string;
        shipping: string;
        security: string;
    };
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text, className = '' }: { text: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            title="Copiar"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${copied
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            } ${className}`}
        >
            {copied ? <><Check className="w-3 h-3" /> Copiado!</> : <><Copy className="w-3 h-3" /> Copiar</>}
        </button>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Section({
    icon: Icon,
    title,
    color,
    children,
    copyText,
    defaultOpen = true,
}: {
    icon: React.ElementType;
    title: string;
    color: string;
    children: React.ReactNode;
    copyText?: string;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-card overflow-hidden border-white/10">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${color}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-widest">{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {copyText && open && <CopyButton text={copyText} />}
                    {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </div>
            </button>
            {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
        </div>
    );
}

// ─── Copy Text Box ────────────────────────────────────────────────────────────
function CopyBox({ label, value, highlight = false }: { label?: string; value: string; highlight?: boolean }) {
    return (
        <div className="space-y-1.5">
            {label && <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{label}</p>}
            <div className={`flex items-start justify-between gap-3 p-4 rounded-xl border group ${highlight
                ? 'bg-primary/5 border-primary/20'
                : 'bg-white/[0.03] border-white/5 hover:border-white/10'
            }`}>
                <p className={`text-sm leading-relaxed flex-1 ${highlight ? 'text-white font-bold' : 'text-gray-300'}`}>{value}</p>
                <CopyButton text={value} className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
            </div>
        </div>
    );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Wand2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-2">
                <p className="text-primary font-black text-sm uppercase tracking-widest animate-pulse">
                    Criando Conteúdo da Loja...
                </p>
                <p className="text-gray-500 text-xs">IA escrevendo textos de alta conversão...</p>
            </div>
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: `${i * 200}ms` }} />
                ))}
            </div>
        </div>
    );
}

// ─── Result Display ───────────────────────────────────────────────────────────
function ResultDisplay({ data, product }: { data: StoreContentOutput; product: string }) {
    const fullDescription = [
        data.product_description.problem,
        data.product_description.solution,
        data.product_description.benefits,
        data.product_description.social_proof,
    ].join('\n\n');

    const fullBullets = data.bullet_points.join('\n');
    const fullOffers = `${data.offers.discount}\n${data.offers.bundle}\n${data.offers.urgency}`;
    const fullTrust = `${data.trust_elements.guarantee}\n${data.trust_elements.shipping}\n${data.trust_elements.security}`;

    return (
        <div className="space-y-4">
            {/* Summary bar */}
            <div className="glass-card p-4 border-primary/20 flex items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <div>
                        <p className="text-sm font-black text-white">Conteúdo gerado para: <span className="text-primary">{product}</span></p>
                        <p className="text-xs text-gray-500">Clique em "Copiar" em qualquer seção para usar na sua loja</p>
                    </div>
                </div>
                <CopyButton
                    text={[
                        `NOME DA LOJA\n${data.store_names.join(' | ')}`,
                        `\nTÍTULO DO PRODUTO\n${data.product_title}`,
                        `\nDESCRIÇÃO\n${fullDescription}`,
                        `\nBULLET POINTS\n${fullBullets}`,
                        `\nOFERTAS\n${fullOffers}`,
                        `\nCONFIANÇA\n${fullTrust}`,
                    ].join('\n')}
                    className="shrink-0"
                />
            </div>

            {/* 1. Store Names */}
            <Section
                icon={Store}
                title="Nome da Loja (3 opções)"
                color="bg-blue-400/10 border-blue-400/20 text-blue-400"
                copyText={data.store_names.join(' | ')}
            >
                <div className="grid grid-cols-3 gap-3">
                    {data.store_names.map((name, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-400/20 group transition-all">
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Opção {i + 1}</p>
                                <p className="text-white font-black">{name}</p>
                            </div>
                            <CopyButton text={name} className="opacity-0 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
            </Section>

            {/* 2. Product Title */}
            <Section
                icon={Tag}
                title="Título do Produto"
                color="bg-primary/10 border-primary/20 text-primary"
                copyText={data.product_title}
            >
                <CopyBox value={data.product_title} highlight />
                <p className="text-[10px] text-gray-600 italic">{data.product_title.length} caracteres · Ideal: menos de 70</p>
            </Section>

            {/* 3. Description */}
            <Section
                icon={FileText}
                title="Descrição do Produto"
                color="bg-purple-400/10 border-purple-400/20 text-purple-400"
                copyText={fullDescription}
            >
                <CopyBox label="🔴 Problema" value={data.product_description.problem} />
                <CopyBox label="✅ Solução" value={data.product_description.solution} />
                <CopyBox label="⭐ Benefícios" value={data.product_description.benefits} />
                <CopyBox label="👥 Prova Social" value={data.product_description.social_proof} />
            </Section>

            {/* 4. Bullet Points */}
            <Section
                icon={List}
                title="Bullet Points (5)"
                color="bg-green-400/10 border-green-400/20 text-green-400"
                copyText={fullBullets}
            >
                <div className="space-y-2">
                    {data.bullet_points.map((bp, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-green-400/20 group transition-all">
                            <p className="text-sm text-gray-300 flex-1">{bp}</p>
                            <CopyButton text={bp} className="opacity-0 group-hover:opacity-100 shrink-0" />
                        </div>
                    ))}
                </div>
            </Section>

            {/* 5. Offers */}
            <Section
                icon={Percent}
                title="Ideias de Oferta"
                color="bg-orange-400/10 border-orange-400/20 text-orange-400"
                copyText={fullOffers}
            >
                <CopyBox label="🔥 Desconto" value={data.offers.discount} />
                <CopyBox label="🎁 Kit / Bundle" value={data.offers.bundle} />
                <CopyBox label="⚠️ Urgência" value={data.offers.urgency} />
            </Section>

            {/* 6. Trust Elements */}
            <Section
                icon={ShieldCheck}
                title="Elementos de Confiança"
                color="bg-teal-400/10 border-teal-400/20 text-teal-400"
                copyText={fullTrust}
            >
                <CopyBox label="🛡️ Garantia" value={data.trust_elements.guarantee} />
                <CopyBox label="🚚 Entrega" value={data.trust_elements.shipping} />
                <CopyBox label="🔒 Segurança" value={data.trust_elements.security} />
            </Section>

            {/* Next step CTA */}
            <div className="glass-card p-5 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                        <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-white">Próximo passo: importe o produto</p>
                        <p className="text-xs text-gray-400">Busque o produto no catálogo e importe direto para a sua loja Shopify</p>
                    </div>
                </div>
                <a
                    href="/dashboard/product-finder"
                    className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                >
                    Buscar Produto
                </a>
            </div>
        </div>
    );
}

// ─── PRODUCT SUGGESTIONS ─────────────────────────────────────────────────────
const PRODUCT_EXAMPLES = [
    'Massageador de pescoço com calor',
    'Organizador de cabos magnético',
    'Luz LED para aquário portátil',
    'Mini projetor portátil',
    'Máscara de olhos elétrica anti-olheiras',
    'Escova elétrica para animais de estimação',
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StoreContentPage() {
    const [product, setProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<StoreContentOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!product.trim() || product.trim().length < 3) {
            setError('Descreva o produto (mínimo 3 caracteres).');
            return;
        }
        setError(null);
        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai/store-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product: product.trim() }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Erro desconhecido');
            setResult(data.data);
        } catch (e: any) {
            setError(e.message || 'Falha ao gerar conteúdo. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                    <Wand2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white">Criador de Conteúdo de Loja</h1>
                    <p className="text-gray-400 text-sm">Digite um produto — a IA gera tudo pronto para copiar e usar na sua loja</p>
                </div>
            </div>

            {/* Input */}
            <div className="glass-card p-6 space-y-4 border-primary/10">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-black text-gray-300 uppercase tracking-widest">
                        <Package className="w-4 h-4 text-primary" />
                        Produto
                    </label>
                    <textarea
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
                        placeholder="Ex: Massageador de pescoço com aquecimento e vibração..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all text-sm resize-none"
                    />
                    <p className="text-[10px] text-gray-600">Dica: Quanto mais detalhes, melhor o conteúdo gerado. · ⌘+Enter para gerar</p>
                </div>

                {/* Examples */}
                <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Exemplos rápidos</p>
                    <div className="flex flex-wrap gap-2">
                        {PRODUCT_EXAMPLES.map(ex => (
                            <button
                                key={ex}
                                onClick={() => setProduct(ex)}
                                className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-primary hover:border-primary/30 transition-all font-bold"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all duration-300 ${isLoading
                        ? 'bg-primary/30 text-primary/60 cursor-wait'
                        : 'bg-primary text-black hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] active:scale-[0.99]'
                    }`}
                >
                    {isLoading
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Gerando conteúdo...</>
                        : <><Wand2 className="w-4 h-4" /> Gerar Conteúdo Completo da Loja</>
                    }
                </button>
            </div>

            {/* Loading */}
            {isLoading && <LoadingState />}

            {/* Results */}
            {result && !isLoading && <ResultDisplay data={result} product={product} />}
        </div>
    );
}
