'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Search, Phone, MessageSquare, MapPin, Flame, Zap } from 'lucide-react';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Lead, LeadStage, User } from '@/types';

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

interface ColumnConfig {
  key: LeadStage;
  label: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'NEW',
    label: 'New Leads',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    borderAccent: 'border-t-blue-600',
  },
  {
    key: 'CONTACTED',
    label: 'Contacted',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-700',
    borderAccent: 'border-t-indigo-600',
  },
  {
    key: 'SITE_VISIT_SCHEDULED',
    label: 'Site Visit',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    borderAccent: 'border-t-amber-500',
  },
  {
    key: 'NEGOTIATION',
    label: 'Negotiation',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    borderAccent: 'border-t-purple-600',
  },
  {
    key: 'CLOSED_WON',
    label: 'Closed Won',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    borderAccent: 'border-t-emerald-600',
  },
  {
    key: 'CLOSED_LOST',
    label: 'Closed Lost',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    borderAccent: 'border-t-rose-500',
  },
];

const SAMPLE_LEADS: Lead[] = [
  {
    id: 'l-1',
    name: 'Sarah Jenkins',
    phone: '+1 (555) 123-4567',
    source: 'WEBSITE',
    budgetMin: 5000000,
    budgetMax: 7500000,
    preferredLocations: ['Downtown Core'],
    propertyType: 'APARTMENT',
    bhk: '3BHK',
    purpose: 'BUY',
    urgency: 'IMMEDIATE',
    stage: 'NEW',
    createdAt: new Date().toISOString(),
    matches: [
      { id: 'm1', leadId: 'l-1', propertyId: 'p1', score: 94, status: 'NEW', createdAt: '' },
      { id: 'm2', leadId: 'l-1', propertyId: 'p2', score: 88, status: 'NEW', createdAt: '' },
    ],
  },
  {
    id: 'l-2',
    name: 'David Smith',
    phone: '+1 (555) 234-5678',
    source: 'PORTAL',
    budgetMin: 10000000,
    budgetMax: 15000000,
    preferredLocations: ['Westside Suburbs'],
    propertyType: 'VILLA',
    bhk: '4BHK',
    purpose: 'BUY',
    urgency: 'WITHIN_1_MONTH',
    stage: 'CONTACTED',
    createdAt: new Date().toISOString(),
    matches: [
      { id: 'm3', leadId: 'l-2', propertyId: 'p3', score: 82, status: 'NEW', createdAt: '' },
    ],
  },
  {
    id: 'l-3',
    name: 'Emily Davis',
    phone: '+1 (555) 345-6789',
    source: 'DIRECT_CALL',
    budgetMin: 6000000,
    budgetMax: 8500000,
    preferredLocations: ['Downtown'],
    propertyType: 'APARTMENT',
    bhk: '2BHK',
    purpose: 'BUY',
    urgency: 'IMMEDIATE',
    stage: 'SITE_VISIT_SCHEDULED',
    createdAt: new Date().toISOString(),
    matches: [
      { id: 'm4', leadId: 'l-3', propertyId: 'p4', score: 91, status: 'NEW', createdAt: '' },
      { id: 'm5', leadId: 'l-3', propertyId: 'p5', score: 78, status: 'NEW', createdAt: '' },
      { id: 'm6', leadId: 'l-3', propertyId: 'p6', score: 75, status: 'NEW', createdAt: '' },
    ],
  },
  {
    id: 'l-4',
    name: 'Michael Chang',
    phone: '+1 (555) 456-7890',
    source: 'REFERRAL',
    budgetMin: 8000000,
    budgetMax: 12000000,
    preferredLocations: ['Innovation District'],
    propertyType: 'COMMERCIAL',
    purpose: 'BUY',
    urgency: 'WITHIN_3_MONTHS',
    stage: 'NEGOTIATION',
    createdAt: new Date().toISOString(),
    matches: [
      { id: 'm7', leadId: 'l-4', propertyId: 'p7', score: 89, status: 'NEW', createdAt: '' },
    ],
  },
  {
    id: 'l-5',
    name: 'Robert Keller',
    phone: '+1 (555) 567-8901',
    source: 'WALK_IN',
    budgetMin: 15000000,
    budgetMax: 20000000,
    preferredLocations: ['Marina Bay'],
    propertyType: 'PENTHOUSE',
    bhk: '4BHK',
    purpose: 'BUY',
    urgency: 'IMMEDIATE',
    stage: 'CLOSED_WON',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'l-6',
    name: 'Jessica Alba',
    phone: '+1 (555) 678-9012',
    source: 'OTHER',
    budgetMin: 3000000,
    budgetMax: 4500000,
    preferredLocations: ['Suburbs'],
    propertyType: 'APARTMENT',
    bhk: '1BHK',
    purpose: 'BUY',
    urgency: 'EXPLORING',
    stage: 'CLOSED_LOST',
    createdAt: new Date().toISOString(),
  },
];

export default function PipelineKanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // Drag State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDropStage, setActiveDropStage] = useState<LeadStage | null>(null);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const fetchLeadsAndAgents = useCallback(async () => {
    try {
      const [leadsData, agentsData] = await Promise.all([
        apiClient.get<Lead[]>(API_ENDPOINTS.LEADS.LIST),
        apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST),
      ]);
      if (Array.isArray(leadsData) && leadsData.length > 0) {
        setLeads(leadsData);
      } else {
        setLeads(SAMPLE_LEADS);
      }
      if (Array.isArray(agentsData)) {
        setAgents(agentsData);
      }
    } catch {
      setLeads(SAMPLE_LEADS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLeadsAndAgents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLeadsAndAgents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchLeadsAndAgents();
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropStage !== stage) {
      setActiveDropStage(stage);
    }
  };

  const handleDragLeave = () => {
    setActiveDropStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    setActiveDropStage(null);
    const leadId = draggedLeadId || e.dataTransfer.getData('text/plain');
    if (!leadId) return;

    // Optimistic UI Update
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, stage: targetStage } : lead))
    );

    // Call API
    try {
      await apiClient.patch(API_ENDPOINTS.LEADS.UPDATE(leadId), {
        stage: targetStage,
      });
    } catch {
      // Revert if error
      void fetchLeadsAndAgents();
    } finally {
      setDraggedLeadId(null);
    }
  };

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    if (
      searchQuery &&
      !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.phone.includes(searchQuery)
    ) {
      return false;
    }
    if (agentFilter && lead.assignedAgentId !== agentFilter) {
      return false;
    }
    if (urgencyFilter && lead.urgency !== urgencyFilter) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const totalPipelineValue = filteredLeads.reduce(
    (sum, l) => sum + (l.budgetMax || l.budgetMin || 0),
    0
  );

  return (
    <div className="mx-auto max-w-[1800px] space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lead Pipeline</h1>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Total Pipeline Value:{' '}
            <span className="font-bold text-slate-900">{formatPrice(totalPipelineValue)}</span> •
            Drag cards across columns to advance deal stages.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Agent Filter */}
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
          >
            <option value="">All Agents</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name}
              </option>
            ))}
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
          >
            <option value="">All Urgencies</option>
            <option value="IMMEDIATE">Immediate</option>
            <option value="WITHIN_1_MONTH">Within 1 Month</option>
            <option value="WITHIN_3_MONTHS">Within 3 Months</option>
            <option value="EXPLORING">Just Browsing</option>
          </select>

          <button
            onClick={handleRefresh}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition-colors hover:bg-slate-50"
            title="Refresh Pipeline"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingLead(null);
              setIsDrawerOpen(true);
            }}
            className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 lg:ml-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container (6 Horizontal Columns with Smooth Drag-Drop) */}
      <div className="grid grid-cols-1 items-start gap-4 pb-6 md:grid-cols-2 xl:grid-cols-6">
        {COLUMNS.map((col) => {
          const columnLeads = filteredLeads.filter((l) => l.stage === col.key);
          const columnTotal = columnLeads.reduce(
            (sum, l) => sum + (l.budgetMax || l.budgetMin || 0),
            0
          );
          const isOver = activeDropStage === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`flex flex-col rounded-xl border bg-slate-100/70 ${col.borderAccent} min-h-[600px] border-t-4 p-3 transition-colors ${
                isOver
                  ? 'border-blue-400 bg-blue-50/80 ring-2 ring-blue-400/30'
                  : 'border-slate-200'
              }`}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-wide text-slate-900 uppercase">
                    {col.label}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${col.badgeBg} ${col.badgeText}`}
                  >
                    {columnLeads.length}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {formatPrice(columnTotal)}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white" />
                    ))}
                  </div>
                ) : columnLeads.length === 0 ? (
                  <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-[11px] font-medium text-slate-400">
                    Drop leads here
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const matchCount = lead.matches?.length || 0;
                    const initials = lead.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    const isHot = lead.urgency === 'IMMEDIATE';

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="group cursor-grab space-y-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs transition-all hover:border-blue-400 hover:shadow-md active:cursor-grabbing"
                      >
                        {/* Top: Name & Badges */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div>
                            <Link href={`/leads/${lead.id}`}>
                              <h4 className="text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                {lead.name}
                              </h4>
                            </Link>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                              {lead.propertyType} • {lead.bhk || '2BHK'}
                            </p>
                          </div>

                          {isHot && (
                            <span
                              className="shrink-0 rounded-md border border-rose-200 bg-rose-50 p-1 text-rose-600"
                              title="Immediate Urgency"
                            >
                              <Flame className="h-3 w-3 fill-rose-600" />
                            </span>
                          )}
                        </div>

                        {/* Location & Budget */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 truncate text-[11px] font-medium text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            <span className="truncate">
                              {lead.preferredLocations?.[0] || 'Downtown'}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900">
                            {formatPrice(lead.budgetMin)} - {formatPrice(lead.budgetMax)}
                          </div>
                        </div>

                        {/* Matches & Actions Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                          {/* Matches Badge */}
                          <div className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                            <Zap className="h-3 w-3 fill-blue-600 text-blue-600" />
                            <span>{matchCount} Matches</span>
                          </div>

                          {/* Agent Avatar + Contact Actions */}
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                              title="Call Lead"
                            >
                              <Phone className="h-3 w-3" />
                            </a>
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                              title="WhatsApp Lead"
                            >
                              <MessageSquare className="h-3 w-3" />
                            </a>
                            <div className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                              {initials}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Lead Drawer */}
      <LeadFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={editingLead}
        onSuccess={() => void fetchLeadsAndAgents()}
      />
    </div>
  );
}
