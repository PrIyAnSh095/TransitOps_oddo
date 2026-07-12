
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  linkTo?: string;
  color?: string;
}

export function KPICard({ title, value, subValue, icon: Icon, trend, linkTo, color = '#c4c7c8' }: KPICardProps) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-5 flex flex-col justify-between hover:border-[#333333] transition-colors relative group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3" style={{ color }}>
          <Icon size={18} />
          <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
        </div>
        {linkTo && (
          <Link 
            to={linkTo} 
            className="text-[10px] uppercase font-bold tracking-wider text-[#5d5f5f] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            View Details
          </Link>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono">{value}</span>
          {subValue && <span className="text-sm text-[#8e9192] font-mono">{subValue}</span>}
        </div>
        
        {trend && (
          <div className={`flex items-center text-xs font-bold ${trend.isPositive ? 'text-[#48ddbc]' : 'text-[#ff6b6b]'}`}>
            {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
