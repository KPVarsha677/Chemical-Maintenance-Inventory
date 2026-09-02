import React from 'react';

const controlClass =
'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none disabled:bg-slate-50';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className = '',
  children
}: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium text-navy-800">
        
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </label>
      {children}
      {error ?
      <p className="mt-1 text-xs text-rose-600">{error}</p> :
      hint ?
      <p className="mt-1 text-xs text-slate-500">{hint}</p> :
      null}
    </div>);

}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props;
  return <input {...rest} className={`${controlClass} ${className}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', children, ...rest } = props;
  return (
    <select {...rest} className={`${controlClass} ${className}`}>
      {children}
    </select>);

}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props;
  return (
    <textarea
      {...rest}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-slate-400 transition-colors duration-150 ease-out focus:border-brand-500 focus:outline-none ${className}`} />);


}

export function FormSection({
  title,
  description,
  children




}: {title: string;description: string;children: React.ReactNode;}) {
  return (
    <div className="grid grid-cols-1 gap-6 border-b border-slate-200 px-5 py-6 last:border-b-0 lg:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>);

}