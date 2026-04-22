export default function DashboardLoading() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="h-10 w-64 bg-white/10 rounded-xl mb-2"></div>
                    <div className="h-4 w-96 bg-white/5 rounded-full"></div>
                </div>
                <div className="h-12 w-40 bg-white/10 rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card p-6 h-36 border border-white/5 flex flex-col justify-end">
                        <div className="h-3 w-16 bg-white/10 rounded-full mb-2"></div>
                        <div className="h-8 w-24 bg-white/20 rounded-xl"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 h-96 border border-white/5 flex flex-col">
                    <div className="h-6 w-48 bg-white/10 rounded-xl mb-6"></div>
                    <div className="flex-grow bg-white/5 rounded-xl"></div>
                </div>
                <div className="glass-card p-6 h-96 border border-white/5 flex flex-col">
                    <div className="h-6 w-48 bg-white/10 rounded-xl mb-6"></div>
                    <div className="flex-grow bg-white/5 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}
