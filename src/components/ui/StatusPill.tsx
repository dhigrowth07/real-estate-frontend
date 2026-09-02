import React from 'react';
import { cn } from '@/lib/utils';
import { LeadStage, PropertyStatus, MatchStatus } from '@/types';

export interface StatusPillProps {
  status: LeadStage | PropertyStatus | MatchStatus | string;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      // Lead stages
      case 'NEW':
        return { label: 'New Lead', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'CONTACTED':
        return { label: 'Contacted', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'REQUIREMENT_GATHERED':
        return { label: 'Requirements', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'SITE_VISIT_SCHEDULED':
        return { label: 'Site Visit', classes: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'NEGOTIATION':
        return { label: 'Negotiation', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'CLOSED_WON':
        return {
          label: 'Closed Won',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'CLOSED_LOST':
        return { label: 'Closed Lost', classes: 'bg-rose-50 text-rose-700 border-rose-200' };

      // Property status
      case 'AVAILABLE':
        return { label: 'Available', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'UNDER_OFFER':
        return { label: 'Under Offer', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'SOLD':
        return { label: 'Sold', classes: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'INACTIVE':
        return { label: 'Inactive', classes: 'bg-rose-50 text-rose-700 border-rose-200' };

      // Match status
      case 'NOTIFIED':
        return { label: 'Notified', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'VIEWED':
        return { label: 'Viewed', classes: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'DISMISSED':
        return { label: 'Dismissed', classes: 'bg-rose-50 text-rose-700 border-rose-200' };

      default:
        return {
          label: s.replace(/_/g, ' '),
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wider uppercase',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
