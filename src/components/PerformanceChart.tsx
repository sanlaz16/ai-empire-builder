'use client';

import { motion } from 'framer-motion';
import { ChartPoint } from '@/lib/performance';

export default function PerformanceChart({ data, color = '#00f2ea' }: { data: ChartPoint[], color?: string }) {
    if (!data || data.length === 0) return null;

    const height = 300;
    const width = 800; // viewbox units
    const padding = 40;

    const maxVal = Math.max(...data.map(d => d.revenue)) * 1.1; // 10% headroom
    const minVal = 0;

    const getX = (index: number) => {
        return (index / (data.length - 1)) * (width - padding * 2) + padding;
    };

    const getY = (val: number) => {
        return height - padding - (val / maxVal) * (height - padding * 2);
    };

    // Build SVG Path
    let pathD = `M ${getX(0)} ${getY(data[0].revenue)}`;
    for (let i = 1; i < data.length; i++) {
        // Simple smoothing (Bezier?) or straight lines
        // Let's do straight lines for robustness first, or simple smoothing
        // Catmull-Rom or cubic bezier is cleaner but complex manual math.
        // Let's stick to straight lines for simplicity + framer motion smoothing usually looks fine or use basic curve
        pathD += ` L ${getX(i)} ${getY(data[i].revenue)}`;
    }

    // Area fill path
    const areaPathD = `${pathD} L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;

    return (
        <div className="w-full h-full min-h-[300px] flex flex-col justify-end relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Horizontal Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                    const y = getY(maxVal * t);
                    return (
                        <g key={t}>
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                            <text x={padding - 10} y={y + 4} fill="gray" fontSize="10" textAnchor="end">${Math.round(maxVal * t)}</text>
                        </g>
                    )
                })}

                {/* AREA FILL */}
                <motion.path
                    d={areaPathD}
                    fill={color}
                    fillOpacity="0.1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                />

                {/* LINE PATH */}
                <motion.path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, type: 'spring' }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* DATA POINTS HOVER area (could be complex, skipping for MVP visuals) */}
                {data.map((d, i) => (
                    <circle key={i} cx={getX(i)} cy={getY(d.revenue)} r="4" fill={color} opacity="0.8" />
                ))}

                {/* X AXIS LABELS */}
                {data.map((d, i) => (
                    (i % Math.ceil(data.length / 6) === 0) && ( // Show roughly 6 labels
                        <text key={i} x={getX(i)} y={height - 10} fill="gray" fontSize="10" textAnchor="middle">
                            {d.date}
                        </text>
                    )
                ))}
            </svg>
        </div>
    );
}
