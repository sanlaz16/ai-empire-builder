export default function OnboardingLoading() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center py-16 px-4 animate-pulse">
            <div className="w-full max-w-2xl">
                <div className="flex justify-center mb-8">
                    <div className="w-48 h-8 rounded-lg bg-white/5"></div>
                </div>

                <div className="w-full max-w-lg mx-auto mb-8">
                    <div className="flex justify-between mb-2">
                        <div className="h-3 w-16 bg-white/10 rounded-full"></div>
                        <div className="h-3 w-8 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full mb-2"></div>
                    <div className="flex justify-between">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-2 h-2 rounded-full bg-white/10"></div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 min-h-[460px] flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 mb-6"></div>
                    <div className="w-64 h-8 bg-white/10 rounded-lg mb-3"></div>
                    <div className="w-80 h-4 bg-white/5 rounded-lg mb-8"></div>

                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <div className="w-full h-8 bg-white/5 rounded-lg"></div>
                        <div className="w-full h-8 bg-white/5 rounded-lg"></div>
                        <div className="w-3/4 h-8 bg-white/5 rounded-lg mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
