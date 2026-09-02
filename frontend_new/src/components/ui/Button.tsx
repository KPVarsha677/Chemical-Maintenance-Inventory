import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary:
  'bg-brand-600 text-white ring-1 ring-inset ring-brand-700/40 hover:bg-brand-700 active:bg-brand-800',
  secondary:
  'bg-white text-navy-800 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-navy-600 hover:bg-slate-100 hover:text-navy-900 active:bg-slate-200',
  danger:
  'bg-rose-600 text-white ring-1 ring-inset ring-rose-700/40 hover:bg-rose-700 active:bg-rose-800'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2'
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}>
      
      {children}
    </button>);

}