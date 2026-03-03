import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900 shadow-sm',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-600',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs rounded-lg',
      md: 'h-11 px-6 text-sm font-medium rounded-xl',
      lg: 'h-14 px-8 text-base font-medium rounded-2xl',
      icon: 'h-10 w-10 rounded-full flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);
