'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare, X, Star, Send, CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

type FeedbackType = 'bug' | 'suggestion' | 'improvement' | 'complaint';

const TYPES: { value: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'bug', label: 'Bug encontrado', icon: <AlertTriangle className="w-4 h-4" />, color: 'border-red-500/40 bg-red-500/10 text-red-400 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500' },
    { value: 'suggestion', label: 'Sugestão', icon: <Lightbulb className="w-4 h-4" />, color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 data-[active=true]:bg-yellow-500/20 data-[active=true]:border-yellow-500' },
    { value: 'improvement', label: 'Melhoria', icon: <TrendingUp className="w-4 h-4" />, color: 'border-primary/40 bg-primary/10 text-primary data-[active=true]:bg-primary/20 data-[active=true]:border-primary' },
    { value: 'complaint', label: 'Algo faltando', icon: <AlertCircle className="w-4 h-4" />, color: 'border-purple-500/40 bg-purple-500/10 text-purple-400 data-[active=true]:bg-purple-500/20 data-[active=true]:border-purple-500' },
];

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<FeedbackType>('suggestion');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState<number>(0);
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const pathname = usePathname();

    const reset = useCallback(() => {
        setType('suggestion');
        setMessage('');
        setRating(0);
        setHoveredStar(0);
        setStatus('idle');
        setErrorMsg('');
    }, []);

    const open = () => { reset(); setIsOpen(true); };
    const close = () => { setIsOpen(false); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message: message.trim(),
                    rating: rating > 0 ? rating : undefined,
                    page: pathname,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMsg(data.error || 'Falha ao enviar feedback.');
                setStatus('error');
                return;
            }

            setStatus('success');
            setTimeout(() => { close(); }, 3000);
        } catch {
            setErrorMsg('Erro de conexão. Tente novamente.');
            setStatus('error');
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={open}
                aria-label="Abrir feedback"
                className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary text-black font-black text-sm uppercase tracking-wide shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all select-none"
            >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm"
                    onClick={close}
                />
            )}

            {/* Modal */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-[200] w-[360px] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                        <div>
                            <h3 className="font-black text-white text-sm uppercase tracking-widest">Beta Feedback</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Sua opinião melhora a plataforma</p>
                        </div>
                        <button onClick={close} className="p-2 rounded-xl hover:bg-white/10 text-gray-500 hover:text-white transition-all">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {status === 'success' ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-black text-white text-base">Obrigado! 🚀</p>
                                <p className="text-gray-500 text-sm font-bold mt-1">Isso nos ajuda a melhorar a plataforma.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-5 space-y-5">
                            {/* Type Select */}
                            <div className="grid grid-cols-2 gap-2">
                                {TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        type="button"
                                        data-active={type === t.value}
                                        onClick={() => setType(t.value)}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-black transition-all ${t.color}`}
                                    >
                                        {t.icon}
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Message */}
                            <div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    placeholder="Conta o que aconteceu..."
                                    maxLength={2000}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                                />
                                <p className="text-right text-[10px] text-gray-600 mt-1">{message.length}/2000</p>
                            </div>

                            {/* Star Rating */}
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Sua experiência geral (opcional)</p>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            className="transition-transform hover:scale-125"
                                        >
                                            <Star
                                                className={`w-6 h-6 transition-colors ${(hoveredStar || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`}
                                            />
                                        </button>
                                    ))}
                                    {rating > 0 && (
                                        <button type="button" onClick={() => setRating(0)} className="ml-2 text-[10px] text-gray-600 hover:text-gray-400 transition-colors">
                                            limpar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Error */}
                            {status === 'error' && (
                                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{errorMsg}</p>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={status === 'loading' || !message.trim()}
                                className="w-full py-3 rounded-xl bg-primary text-black font-black text-sm uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading'
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                    : <><Send className="w-4 h-4" /> Enviar Feedback</>
                                }
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}
