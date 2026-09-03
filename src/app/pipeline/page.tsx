'use client';

import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LeadStage } from '@/types';

const PIPELINE_COLUMNS: { stage: LeadStage; title: string; color: string }[] = [
  { stage: 'NEW', title: 'New Leads', color: 'border-t-blue-500' },
  { stage: 'CONTACTED', title: 'Contacted', color: 'border-t-indigo-500' },
  { stage: 'REQUIREMENT_GATHERED', title: 'Requirements', color: 'border-t-cyan-500' },
  { stage: 'SITE_VISIT_SCHEDULED', title: 'Site Visit', color: 'border-t-purple-500' },
  { stage: 'NEGOTIATION', title: 'Negotiation', color: 'border-t-amber-500' },
  { stage: 'CLOSED_WON', title: 'Closed Won', color: 'border-t-emerald-500' },
];

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Lead Pipeline</h1>
          <p className="text-sm text-slate-500">
            Kanban workflow tracking buyer progression from inquiry to deal closure.
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4" />
          <span>Add Lead</span>
        </Button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6">
        {PIPELINE_COLUMNS.map((col) => (
          <div
            key={col.stage}
            className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                  {col.title}
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  1
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="min-h-[350px] flex-1 space-y-3">
              <Card hoverable className={`border-t-4 ${col.color} space-y-2 p-3.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Vipul Sharma</span>
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    100% Match
                  </span>
                </div>
                <p className="text-xs text-slate-500">3BHK Villa • Whitefield</p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                  <span>₹60L - ₹80L</span>
                  <span>Agent: John</span>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
