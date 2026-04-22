import { ReactNode } from 'react';

export function EmptyState({
    icon,
    title,
    message,
    action
}: {
    icon: ReactNode;
    title: string;
    message: string;
    action?: ReactNode;
}) {
    return (
        <div className="w-full min-h-[400px] glass-card flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-gray-400">
                {icon}
            </div>
            <h3 className="text-xl font-black text-white mb-2">{title}</h3>
            <p className="text-sm font-bold text-gray-500 max-w-sm mb-6">
                {message}
            </p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
}
