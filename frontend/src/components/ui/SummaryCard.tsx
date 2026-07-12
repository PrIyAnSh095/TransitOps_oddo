
import type { LucideIcon } from 'lucide-react';

export interface SummaryStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}

interface SummaryCardProps {
  title: string;
  stats: SummaryStat[];
}

export function SummaryCard({ title, stats }: SummaryCardProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold tracking-tight text-white uppercase mb-6">{title}</h3>
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stat.icon && <stat.icon size={16} color={stat.color || '#8e9192'} />}
              <span className="text-sm text-[#c4c7c8] font-medium">{stat.label}</span>
            </div>
            <span className="text-sm font-bold text-white font-mono">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
