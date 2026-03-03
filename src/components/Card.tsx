import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-slate-100 rounded-2xl p-5 shadow-sm transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:border-emerald-100 active:scale-[0.98]',
        className
      )}
    >
      {children}
    </div>
  );
};
