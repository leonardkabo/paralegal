import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all',
            error && 'border-red-300 focus:ring-red-500/10 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] font-medium text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);
