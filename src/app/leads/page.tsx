'use client';

import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusPill } from '@/components/ui/StatusPill';
import { Lead } from '@/types';

export default function LeadsPage() {
  const sampleLeads: Lead[] = [
    {
      id: '1',
      name: 'Vipul Sharma',
      phone: '+91 98765 43210',
      email: 'vipul.sharma@example.com',
      source: 'WEBSITE',
      budgetMin: 6000000,
      budgetMax: 8000000,
      preferredLocations: ['Whitefield', 'Indiranagar'],
      propertyType: 'VILLA',
      bhk: '3BHK',
      purpose: 'BUY',
      urgency: 'IMMEDIATE',
      stage: 'NEW',
      createdAt: '2026-09-02T10:00:00Z',
    },
    {
      id: '2',
      name: 'Kavita Rao',
      phone: '+91 98765 43211',
      email: 'kavita.rao@example.com',
      source: 'PORTAL',
      budgetMin: 7000000,
      budgetMax: 9000000,
      preferredLocations: ['Koramangala'],
      propertyType: 'APARTMENT',
      bhk: '2BHK',
      purpose: 'BUY',
      urgency: 'WITHIN_1_MONTH',
      stage: 'SITE_VISIT_SCHEDULED',
      createdAt: '2026-09-01T12:00:00Z',
    },
    {
      id: '3',
      name: 'Rajesh Verma',
      phone: '+91 98765 43212',
      email: 'rajesh.v@example.com',
      source: 'DIRECT_CALL',
      budgetMin: 4000000,
      budgetMax: 5500000,
      preferredLocations: ['Electronic City'],
      propertyType: 'APARTMENT',
      bhk: '2BHK',
      purpose: 'BUY',
      urgency: 'EXPLORING',
      stage: 'CONTACTED',
      createdAt: '2026-08-30T15:00:00Z',
    },
  ];

  const columns: Column<Lead>[] = [
    {
      header: 'Lead Name',
      cell: (lead) => (
        <div>
          <div className="font-bold text-slate-900">{lead.name}</div>
          <div className="text-xs text-slate-500">{lead.phone}</div>
        </div>
      ),
    },
    {
      header: 'Budget Range',
      cell: (lead) => (
        <span className="font-medium text-slate-900">
          ₹{(lead.budgetMin / 100000).toFixed(0)}L - ₹{(lead.budgetMax / 100000).toFixed(0)}L
        </span>
      ),
    },
    {
      header: 'Requirement',
      cell: (lead) => (
        <div>
          <span className="font-medium text-slate-800">
            {lead.bhk || ''} {lead.propertyType}
          </span>
          <div className="text-xs text-slate-500">{lead.preferredLocations.join(', ')}</div>
        </div>
      ),
    },
    {
      header: 'Source',
      cell: (lead) => (
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          {lead.source}
        </span>
      ),
    },
    {
      header: 'Stage',
      cell: (lead) => <StatusPill status={lead.stage} />,
    },
    {
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            View Matches
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Leads Management</h1>
          <p className="text-sm text-slate-500">
            Track buyer inquiries, budgets, and automated property match opportunities.
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4" />
          <span>Add New Lead</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, phone, or location..."
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pr-4 pl-9 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              <span>All Stages</span>
            </Button>
            <Button variant="outline" size="sm">
              <span>All Sources</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Leads Table */}
      <DataTable columns={columns} data={sampleLeads} keyExtractor={(lead) => lead.id} />
    </div>
  );
}
