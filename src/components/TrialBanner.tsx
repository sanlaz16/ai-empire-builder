import { Clock } from 'lucide-react';

export default function TrialBanner() {
    return (
        <div className="w-full bg-yellow-500/10 border-b border-yellow-500/20 py-2 px-4 flex items-center justify-center gap-3 text-sm mb-6 rounded-lg animate-fade-in">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-200 font-medium">Plan: <span className="text-white font-bold">Basic</span></span>
            <span className="text-gray-500 hidden md:inline">|</span>
            <span className="text-yellow-200">Status: <span className="text-white font-bold">7-Day Free Trial</span></span>
            <span className="text-gray-500 hidden md:inline">|</span>
            <span className="text-white font-bold bg-yellow-500/20 px-2 py-0.5 rounded text-xs border border-yellow-500/30">
                5 Days Remaining
            </span>
            <button className="ml-4 text-xs underline text-yellow-500 hover:text-yellow-400 font-bold">
                Upgrade Now
            </button>
        </div>
    );
}
