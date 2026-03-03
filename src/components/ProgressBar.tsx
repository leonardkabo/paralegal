import React from 'react';
import { cn } from '../lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressProps> = ({ value, max = 100, className, showLabel }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Progression</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
};
