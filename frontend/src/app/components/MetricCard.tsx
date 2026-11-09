
import { ReactNode } from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: ReactNode;
    color: string;
}

export default function MetricCard({
    title,
    value,
    subtitle,
    icon,
    color,
}: MetricCardProps) {
    return (
    <div className="rounded-xl border border-slate-800 bg-[#172638] p-5 shadow-lg transition duration-200 hover:-translate-y-1 hover:border-teal-500/50">

        <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">
            {title}
        </p>

        <div className={`rounded-lg p-2 ${color}`}>
            {icon}
        </div>
        </div>

        <h2 className="mt-5 text-3xl font-bold text-white">
        {value}
        </h2>

        <p className="mt-2 text-xs text-slate-400">
        {subtitle}
        </p>

    </div>
    );
}
