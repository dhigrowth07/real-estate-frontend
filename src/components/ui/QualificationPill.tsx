import React from 'react';
import { cn } from '@/lib/utils';
import { LeadQualificationStatus, Lead } from '@/types';
import { UserCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export interface QualificationPillProps {
  status?: LeadQualificationStatus | string | null;
  lead?: Partial<Lead>;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function calculateAnsweredCount(lead?: Partial<Lead>): number {
  if (!lead) return 0;
  let count = 0;
  if (lead.propertyType) count++;
  if (lead.budgetMin != null || lead.budgetMax != null) count++;
  if (lead.preferredLocations && lead.preferredLocations.length > 0) count++;
  if (lead.urgency) count++;
  return count;
}

export function QualificationPill({
  status = 'UNQUALIFIED',
  lead,
  showProgress = false,
  size = 'md',
  className,
}: QualificationPillProps) {
  const normalizedStatus = (status || 'UNQUALIFIED').toUpperCase() as LeadQualificationStatus;
  const answeredCount = calculateAnsweredCount(lead);

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px]'
      : size === 'lg'
      ? 'px-3 py-1 text-sm font-semibold'
      : 'px-2.5 py-0.5 text-xs font-bold';

  switch (normalizedStatus) {
    case 'REQUESTED_AGENT':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 tracking-wide text-blue-700 shadow-2xs',
            sizeClasses,
            className
          )}
        >
          <UserCheck className={size === 'sm' ? 'h-2.5 w-2.5 text-blue-600' : 'h-3 w-3 text-blue-600'} />
          <span>Requested Agent</span>
        </span>
      );

    case 'QUALIFIED':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 tracking-wide text-emerald-700 shadow-2xs',
            sizeClasses,
            className
          )}
        >
          <CheckCircle2 className={size === 'sm' ? 'h-2.5 w-2.5 text-emerald-600' : 'h-3 w-3 text-emerald-600'} />
          <span>Qualified</span>
          {showProgress && <span className="font-semibold text-emerald-600">(4/4)</span>}
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 tracking-wide text-amber-800 shadow-2xs',
            sizeClasses,
            className
          )}
        >
          <Clock className={size === 'sm' ? 'h-2.5 w-2.5 text-amber-600' : 'h-3 w-3 text-amber-600'} />
          <span>In Progress</span>
          {showProgress && <span className="font-semibold text-amber-700">({answeredCount}/4)</span>}
        </span>
      );

    case 'UNQUALIFIED':
    default:
      return (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 font-medium tracking-wide text-slate-600 shadow-2xs',
            sizeClasses,
            className
          )}
        >
          <AlertCircle className={size === 'sm' ? 'h-2.5 w-2.5 text-slate-400' : 'h-3 w-3 text-slate-400'} />
          <span>Unqualified</span>
          {showProgress && <span className="text-slate-400">({answeredCount}/4)</span>}
        </span>
      );
  }
}
