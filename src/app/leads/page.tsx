'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Table as TableIcon,
  Kanban,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  Eye,
  Globe,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LeadFormDrawer } from '@/components/leads/LeadFormDrawer';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';
import { Lead } from '@/types';

function getSourceIcon(source?: string) {
  switch (source) {
    case 'WEBSITE':
      return <Globe className="h-3.5 w-3.5 text-slate-400" />;
    case 'PORTAL':
    case 'SOCIAL':
    case 'INSTAGRAM':
      return <Camera className="h-3.5 w-3.5 text-slate-400" />;
    case 'DIRECT_CALL':
    case 'PHONE':
      return <Phone className="h-3.5 w-3.5 text-slate-400" />;
    case 'WHATSAPP':
      return <MessageSquare className="h-3.5 w-3.5 text-slate-400" />;
    default:
      return <Globe className="h-3.5 w-3.5 text-slate-400" />;
  }
}

function getStageBadge(stage?: string) {
  switch (stage) {
    case 'NEW':
      return (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          New
        </span>
      );
    case 'CONTACTED':
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-amber-800 uppercase">
          Contacted
        </span>
      );
    case 'REQUIREMENT_GATHERED':
    case 'SITE_VISIT_SCHEDULED':
      return (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-amber-800 uppercase">
          Showing
        </span>
      );
    case 'NEGOTIATION':
      return (
        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-emerald-700 uppercase">
          Negotiation
        </span>
      );
    case 'CLOSED_WON':
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white uppercase">
          Closed Won
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-slate-700 uppercase">
          {stage?.replace(/_/g, ' ') || 'New'}
        </span>
      );
  }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const params: Record<string, string | undefined> = {};
      if (sourceFilter !== 'ALL') params.source = sourceFilter;
      if (stageFilter !== 'ALL') params.stage = stageFilter;
      if (searchQuery) params.search = searchQuery;

      const data = await apiClient.get<Lead[]>(API_ENDPOINTS.LEADS.LIST, params);
      setLeads(Array.isArray(data) ? data : []);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sourceFilter, stageFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchLeads();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchLeads();
  };

  const handleOpenAdd = () => {
    setEditingLead(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsDrawerOpen(true);
  };

  const handleFormSuccess = () => {
    void fetchLeads();
  };

  // Pagination calculation
  const totalLeads = leads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const paginatedLeads = leads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Page Header matching Reference */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Leads</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 font-bold shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Toolbar / Filters & View Toggle */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter Dropdown */}
          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3.5 text-xs font-semibold text-slate-700 shadow-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="ALL">All Sources</option>
              <option value="WEBSITE">Website</option>
              <option value="PORTAL">Portal</option>
              <option value="REFERRAL">Referral</option>
              <option value="DIRECT_CALL">Direct Call</option>
              <option value="WALK_IN">Walk-in</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Stage Filter Dropdown */}
          <div className="relative">
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3.5 text-xs font-semibold text-slate-700 shadow-xs focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
            >
              <option value="ALL">All Stages</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="REQUIREMENT_GATHERED">Requirement Gathered</option>
              <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CLOSED_WON">Closed Won</option>
              <option value="CLOSED_LOST">Closed Lost</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Search Filter */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter by name or phone..."
            className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 focus:outline-hidden sm:w-60"
          />
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-2xs">
          <button className="flex items-center gap-1.5 rounded bg-white px-3 py-1 text-xs font-bold text-blue-600 shadow-xs">
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
          <Link href="/pipeline">
            <button className="flex cursor-pointer items-center gap-1.5 rounded px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900">
              <Kanban className="h-3.5 w-3.5" />
              <span>Kanban</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Data Table Card matching Reference */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-bold text-slate-800">No leads found</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
              Get started by adding your first prospective buyer or adjust your active filters.
            </p>
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={handleOpenAdd}>
                <Plus className="h-4 w-4" />
                <span>Add First Lead</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-4 py-3 whitespace-nowrap">Lead Name</th>
                  <th className="px-4 py-3 whitespace-nowrap">Contact</th>
                  <th className="px-4 py-3 whitespace-nowrap">Budget & Location</th>
                  <th className="px-4 py-3 whitespace-nowrap">Stage</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Matches</th>
                  <th className="px-4 py-3 whitespace-nowrap">Agent</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-normal">
                {paginatedLeads.map((lead) => {
                  const initials = lead.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  const matchCount = lead.matches?.length || lead._count?.matches || 0;
                  const agentInitials = lead.assignedAgent?.name
                    ? lead.assignedAgent.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'AG';

                  return (
                    <tr
                      key={lead.id}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                    >
                      {/* Lead Name */}
                      <td className="px-4 py-3.5">
                        <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-100 text-xs font-bold text-blue-700">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                              {lead.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              Looking for {lead.bhk ? `${lead.bhk} ` : ''}
                              {lead.propertyType?.toLowerCase() || 'Apartment'}
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div>
                          <span className="font-medium">{lead.phone}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            {getSourceIcon(lead.source)}
                            <span className="capitalize">
                              {lead.source?.toLowerCase().replace(/_/g, ' ') || 'Website'}
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Budget & Location */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">
                          ₹{(lead.budgetMin / 100000).toFixed(0)}L - ₹
                          {(lead.budgetMax / 100000).toFixed(0)}L
                        </p>
                        <p className="max-w-[160px] truncate text-xs text-slate-500">
                          {lead.preferredLocations?.join(', ') || 'Any Location'}
                        </p>
                      </td>

                      {/* Stage */}
                      <td className="px-4 py-3.5">{getStageBadge(lead.stage)}</td>

                      {/* Matches */}
                      <td className="px-4 py-3.5 text-center">
                        <Link href={`/leads/${lead.id}`}>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              matchCount > 0
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'border border-slate-200 bg-slate-100 text-slate-500'
                            }`}
                          >
                            {matchCount}
                          </span>
                        </Link>
                      </td>

                      {/* Agent */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                            {agentInitials}
                          </div>
                          <span className="max-w-[100px] truncate text-xs font-medium text-slate-600">
                            {lead.assignedAgent?.name || 'Unassigned'}
                          </span>
                        </div>
                      </td>

                      {/* Hover Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <a
                            href={`tel:${lead.phone}`}
                            className="rounded-md p-1.5 text-blue-600 transition-colors hover:bg-blue-50"
                            title="Call Lead"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-md p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                            title="WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="cursor-pointer rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
                            title="Edit"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Pagination matching Reference */}
        {totalLeads > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded text-xs font-bold ${
                      isCurrent ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      <LeadFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        lead={editingLead}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
