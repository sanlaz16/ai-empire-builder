import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
    return (
        <div
            className={`animate-pulse bg-white/5 rounded-xl ${className || ''}`}
        />
    );
};

export const ProductCardSkeleton = () => {
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-5 space-y-4">
            <Skeleton className="w-full aspect-square" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="space-y-1">
                    <Skeleton className="h-2 w-10" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-1">
                    <Skeleton className="h-2 w-10 text-right" />
                    <Skeleton className="h-4 w-16 float-right" />
                </div>
            </div>
        </div>
    );
};

export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
};

export const IntegrationCardSkeleton = () => {
    return (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center space-y-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-1/2 mx-auto" />
                <Skeleton className="h-3 w-3/4 mx-auto" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>
    );
};
