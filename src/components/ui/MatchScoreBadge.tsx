import React from 'react';
import { cn } from '@/lib/utils';

export interface MatchScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreBadge({
  score,
  showLabel = false,
  className,
  size = 'md',
}: MatchScoreBadgeProps) {
  // Score badge color rules:
  // > 80%  -> Green (#16A34A)
  // 50-80% -> Amber (#F59E0B)
  // < 50%  -> Gray (#64748B)
  const getScoreColorClass = (val: number) => {
    if (val >= 80) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    }
    if (val >= 50) {
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-sm px-2.5 py-1 font-semibold',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border shadow-xs transition-colors',
        getScoreColorClass(score),
        sizeClasses[size],
        className
      )}
    >
      <span className="tabular-nums">{Math.round(score)}%</span>
      {showLabel && <span className="font-normal opacity-90">Match</span>}
    </span>
  );
}
