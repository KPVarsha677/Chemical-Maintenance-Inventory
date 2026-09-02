import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow &&
        <p className="mb-1 text-xs font-medium text-slate-500">{eyebrow}</p>
        }
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h1>
        {description &&
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        }
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>);

}