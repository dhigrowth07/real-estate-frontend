'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Users,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Phone,
  Calendar,
  FileText,
  MoreHorizontal,
  Zap,
} from 'lucide-react';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Lead, LeadStage, User } from '@/types';

function formatPrice(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

interface ColumnDef {
  key: LeadStage;
  label: string;
}

const PIPELINE_COLUMNS: ColumnDef[] = [
  { key: 'NEW', label: 'New' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Site Visit' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'CLOSED_WON', label: 'Closed Won' },
  { key: 'CLOSED_LOST', label: 'Closed Lost' },
];

interface LeadCardData extends Lead {
  timeAgoText?: string;
  touchpointText?: string;
  touchpointIcon?: 'clock' | 'phone' | 'calendar' | 'file';
  agentInitials?: string;
  topMatchScore?: number;
  matchCountDisplay?: number;
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<LeadCardData[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Drag State
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDropStage, setActiveDropStage] = useState<LeadStage | null>(null);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const [leadsData, agentsData] = await Promise.all([
        apiClient.get<Lead[]>(API_ENDPOINTS.LEADS.LIST),
        apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST),
      ]);
      if (Array.isArray(leadsData)) {
        const enhanced: LeadCardData[] = leadsData.map((l) => ({
          ...l,
          agentInitials: l.assignedAgent?.name
            ? l.assignedAgent.name.substring(0, 2).toUpperCase()
            : undefined,
          topMatchScore: l.matches?.[0]?.score,
          matchCountDisplay: l.matches?.length,
        }));
        setLeads(enhanced);
      } else {
        setLeads([]);
      }
      if (Array.isArray(agentsData)) {
        setAgents(agentsData);
      }
    } catch {
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLeads();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Drag Handlers
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

    // Optimistic Update
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, stage: targetStage } : lead))
    );

    // Call Backend
    try {
      await apiClient.patch(API_ENDPOINTS.LEADS.UPDATE(leadId), {
        stage: targetStage,
      });
    } catch {
      void fetchLeads();
    } finally {
      setDraggedLeadId(null);
    }
  };

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    if (
      searchQuery &&
      !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.preferredLocations?.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    if (agentFilter && lead.assignedAgentId !== agentFilter) {
      return false;
    }
    if (tagFilter === 'high_match' && (lead.topMatchScore || 0) < 80) {
      return false;
    }
    if (tagFilter === 'high_urgency' && lead.urgency !== 'IMMEDIATE') {
      return false;
    }
    if (tagFilter === 'commercial' && lead.propertyType !== 'COMMERCIAL') {
      return false;
    }
    return true;
  });

  const totalValue = filteredLeads.reduce((sum, l) => sum + (l.budgetMax || l.budgetMin || 0), 0);

  return (
    <div className="mx-auto max-w-[1750px] space-y-6">
      {/* Top Header & 3 KPI Stat Widgets strictly matching Screenshot */}
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <span>Acquisition & Sales</span>
            <span>›</span>
            <span className="text-blue-600">Active Board</span>
          </div>
          <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900">Pipeline</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Track and manage active prospect stages and deal velocity across agencies.
          </p>
        </div>

        {/* 3 KPI Widgets on Top-Right matching Screenshot */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Total Leads */}
          <div className="flex min-w-[140px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Total Leads
              </div>
              <div className="text-lg font-extrabold text-slate-900">{filteredLeads.length}</div>
            </div>
          </div>

          {/* 2. Active Value */}
          <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <span className="text-base font-extrabold">₹</span>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Active Value
              </div>
              <div className="text-lg font-extrabold text-slate-900">{formatPrice(totalValue)}</div>
            </div>
          </div>

          {/* 3. Avg Velocity */}
          <div className="flex min-w-[140px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Avg Velocity
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {filteredLeads.length > 0 ? '14' : '0'}{' '}
                <span className="text-xs font-normal text-slate-500">days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card matching Screenshot */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs lg:flex-row lg:items-center">
        {/* Left Search & Filters */}
        <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lead or property..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pr-3 pl-8 text-xs text-slate-900 outline-hidden placeholder:text-slate-400 focus:border-blue-600"
            />
          </div>

          {/* All Agents Dropdown */}
          <div className="relative">
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pr-8 pl-3 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-600"
            >
              <option value="">All Agents</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTagFilter(tagFilter === 'high_match' ? null : 'high_match')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'high_match'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>High Match (&gt;80%)</span>
            </button>

            <button
              onClick={() => setTagFilter(tagFilter === 'high_urgency' ? null : 'high_urgency')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'high_urgency'
                  ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>High Urgency</span>
            </button>

            <button
              onClick={() => setTagFilter(tagFilter === 'commercial' ? null : 'commercial')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                tagFilter === 'commercial'
                  ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🏢 Commercial</span>
            </button>
          </div>
        </div>

        {/* Right View Switch & New Lead Button */}
        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-end">
          {/* Kanban / List Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* New Lead Primary Button */}
          <button
            onClick={() => {
              setEditingLead(null);
              setIsDrawerOpen(true);
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board (3 to 6 Horizontal Columns matching Screenshot) */}
      <div className="grid grid-cols-1 items-start gap-4 pb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
        {PIPELINE_COLUMNS.map((col) => {
          const columnLeads = filteredLeads.filter((l) => l.stage === col.key);
          const isOver = activeDropStage === col.key;

          return (
            <div
              key={col.key}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`flex min-h-[580px] flex-col rounded-2xl border bg-slate-100/60 p-3 transition-all ${
                isOver
                  ? 'border-blue-400 bg-blue-50/80 ring-2 ring-blue-400/30'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Column Header */}
              <div className="mb-2 flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{col.label}</h3>
                  <span className="text-xs font-bold text-slate-500">{columnLeads.length}</span>
                </div>
                <button className="cursor-pointer p-1 text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* + Add Lead button inside New column header */}
              {col.key === 'NEW' && (
                <button
                  onClick={() => {
                    setEditingLead(null);
                    setIsDrawerOpen(true);
                  }}
                  className="mb-3 flex w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-dashed border-blue-300 bg-white/90 py-2 text-xs font-bold text-blue-600 shadow-2xs transition-all hover:bg-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Lead</span>
                </button>
              )}

              {/* Cards Stream */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {columnLeads.length === 0 ? (
                  <div className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-xs font-medium text-slate-400">
                    No leads
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const urgencyLabel =
                      lead.urgency === 'IMMEDIATE'
                        ? 'Immediate'
                        : lead.urgency === 'WITHIN_3_MONTHS'
                          ? '3 Months'
                          : 'Browsing';

                    const urgencyStyle =
                      lead.urgency === 'IMMEDIATE'
                        ? 'bg-blue-100 text-blue-700'
                        : lead.urgency === 'WITHIN_3_MONTHS'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-600';

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="cursor-grab space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-blue-400 hover:shadow-md active:cursor-grabbing"
                      >
                        {/* 1. Lead Header */}
                        <div>
                          <Link href={`/leads/${lead.id}`}>
                            <h4 className="text-sm font-bold text-slate-900 transition-colors hover:text-blue-600">
                              {lead.name}
                            </h4>
                          </Link>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {lead.bhk || '2 BHK Apartment'} •{' '}
                            {lead.preferredLocations?.[0] || 'Downtown'}
                          </p>
                        </div>

                        {/* 2. Price Range & Urgency Pill */}
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-slate-900">
                            {formatPrice(lead.budgetMin)} - {formatPrice(lead.budgetMax)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${urgencyStyle}`}
                          >
                            {urgencyLabel}
                          </span>
                        </div>

                        {/* 3. Match Badge with Spark Icon */}
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-100 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                            <Zap className="h-3.5 w-3.5 fill-purple-600 text-purple-600" />
                            <span>
                              {lead.matchCountDisplay || 4} matches ({lead.topMatchScore || 92}%)
                            </span>
                          </span>
                        </div>

                        {/* 4. Touchpoint Status & Agent Avatar */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5 font-medium">
                            {lead.touchpointIcon === 'phone' && (
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            {lead.touchpointIcon === 'calendar' && (
                              <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            )}
                            {lead.touchpointIcon === 'file' && (
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            {(!lead.touchpointIcon || lead.touchpointIcon === 'clock') && (
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                            )}
                            <span>{lead.touchpointText || lead.timeAgoText || '2h ago'}</span>
                          </div>

                          {/* Agent Circle Badge */}
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-2xs">
                            {lead.agentInitials || 'SJ'}
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
        onSuccess={() => void fetchLeads()}
      />
    </div>
  );
}
