import React from 'react';
import { cn } from '../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none',
            error && 'border-red-300 focus:ring-red-500/10 focus:border-red-500',
            className
          )}
          {...props}
        >
          <option value="" disabled>Sélectionner...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] font-medium text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);
