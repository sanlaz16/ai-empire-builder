export default function ProductFinderLoading() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div>
                    <div className="h-8 w-64 bg-white/10 rounded-xl mb-3"></div>
                    <div className="h-4 w-96 bg-white/5 rounded-full"></div>
                </div>
                <div className="flex gap-3">
                    <div className="w-32 h-10 bg-white/10 rounded-xl"></div>
                    <div className="w-32 h-10 bg-white/10 rounded-xl"></div>
                </div>
            </div>

            <div className="glass-card p-6 border border-white/5 mb-8 flex gap-4">
                <div className="flex-grow h-12 bg-white/5 rounded-xl"></div>
                <div className="w-32 h-12 bg-white/10 rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="glass-card rounded-2xl overflow-hidden border border-white/5 h-[400px] flex flex-col">
                        <div className="h-64 bg-white/5 w-full"></div>
                        <div className="p-4 flex flex-col justify-between flex-grow">
                            <div className="h-5 w-3/4 bg-white/10 rounded-lg mb-4"></div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="h-10 bg-white/5 rounded-lg"></div>
                                <div className="h-10 bg-white/5 rounded-lg"></div>
                                <div className="h-10 bg-white/10 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
