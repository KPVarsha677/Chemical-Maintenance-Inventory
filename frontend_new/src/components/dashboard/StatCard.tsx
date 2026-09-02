import React from "react";
import { TrendingDownIcon, TrendingUpIcon, BoxIcon } from "lucide-react";
interface StatCardProps {
  label: string;
  value: string;
  sublabel: string;
  icon: BoxIcon;
  trend?: {
    direction: 'up' | 'down';
    value: string;
    positive: boolean;
  };
  tone?: 'default' | 'alert';
}
export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  tone = 'default'
}: StatCardProps) {
  const alert = tone === 'alert';
  return <div className={`flex flex-col rounded-lg border bg-white p-5 shadow-card ${alert ? 'border-rose-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${alert ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-navy-600'}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className={`mt-3 text-3xl font-semibold tabular tracking-tight ${alert ? 'text-rose-700' : 'text-navy-900'}`}>
        {value}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3">
        {trend && <span className={`inline-flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.direction === 'up' ? <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDownIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            {trend.value}
          </span>}
        <span className="text-xs text-slate-500">{sublabel}</span>
      </div>
    </div>;
}