import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-card ${className}`}>
      
      {children}
    </section>);

}

interface PanelHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PanelHeader({
  title,
  description,
  action,
  className = ''
}: PanelHeaderProps) {
  return (
    <header
      className={`flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 ${className}`}>
      
      <div>
        <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
        {description &&
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        }
      </div>
      {action}
    </header>);

}