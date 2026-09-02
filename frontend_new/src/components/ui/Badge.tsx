import React from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200'
};

const dotStyles: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  brand: 'bg-brand-500'
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export function Badge({
  tone = 'neutral',
  children,
  dot = false,
  className = ''
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${toneStyles[tone]} ${className}`}>
      
      {dot &&
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[tone]}`} aria-hidden="true" />
      }
      {children}
    </span>);

}